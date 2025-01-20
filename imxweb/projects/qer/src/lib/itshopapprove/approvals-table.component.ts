/*
 * ONE IDENTITY LLC. PROPRIETARY INFORMATION
 *
 * This software is confidential.  One Identity, LLC. or one of its affiliates or
 * subsidiaries, has supplied this software to you under terms of a
 * license agreement, nondisclosure agreement or both.
 *
 * You may not copy, disclose, or use this software except in accordance with
 * those terms.
 *
 *
 * Copyright 2024 One Identity LLC.
 * ALL RIGHTS RESERVED.
 *
 * ONE IDENTITY LLC. MAKES NO REPRESENTATIONS OR
 * WARRANTIES ABOUT THE SUITABILITY OF THE SOFTWARE,
 * EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED
 * TO THE IMPLIED WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE, OR
 * NON-INFRINGEMENT.  ONE IDENTITY LLC. SHALL NOT BE
 * LIABLE FOR ANY DAMAGES SUFFERED BY LICENSEE
 * AS A RESULT OF USING, MODIFYING OR DISTRIBUTING
 * THIS SOFTWARE OR ITS DERIVATIVES.
 *
 */

import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Params } from '@angular/router';
import { EuiSidesheetService } from '@elemental-ui/core';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';

import { PwoExtendedData, RecommendationEnum, ViewConfigData } from '@imx-modules/imx-api-qer';
import {
  CollectionLoadParameters,
  DataModel,
  EntitySchema,
  ExtendedTypedEntityCollection,
  IClientProperty,
  ValType,
} from '@imx-modules/imx-qbm-dbts';
import {
  AuthenticationService,
  BusyService,
  calculateSidesheetWidth,
  ClassloggerService,
  ClientPropertyForTableColumns,
  DataSourceToolbarSettings,
  DataSourceToolbarViewConfig,
  DataViewInitParameters,
  DataViewSource,
  ExtService,
  IExtension,
  ISessionState,
  SettingsService,
} from 'qbm';
import { QerPermissionsService } from '../admin/qer-permissions.service';
import { ProjectConfigurationService } from '../project-configuration/project-configuration.service';
import { UserModelService } from '../user/user-model.service';
import { Approval } from './approval';
import { ApprovalsDecision } from './approvals-decision.enum';
import { ApprovalsLoadParameters } from './approvals-load-parameters';
import { ApprovalsSidesheetComponent } from './approvals-sidesheet/approvals-sidesheet.component';
import { ApprovalsService } from './approvals.service';
import { RecommendationSidesheetComponent } from './recommendation-sidesheet/recommendation-sidesheet.component';
import { WorkflowActionService } from './workflow-action/workflow-action.service';

import { isCancelPwO } from '../admin/qer-permissions-helper';
import { ViewConfigService } from '../view-config/view-config.service';
@Component({
  templateUrl: './approvals-table.component.html',
  selector: 'imx-approvals-table',
  styleUrls: ['./approvals-table.component.scss'],
  providers: [DataViewSource],
})
export class ApprovalsTableComponent implements OnInit, OnDestroy {
  public recApprove = RecommendationEnum.Approve;
  public recDeny = RecommendationEnum.Deny;

  private isChiefApprover = false;

  @Input() public params: Params = {};
  @Input() hideToolbar = true;
  public isUserEscalationApprover = false;

  public abortController: AbortController = new AbortController();

  public get canWithdrawAdditionalApprover(): boolean {
    return this.selectedItems.every((item: Approval) => item.canWithdrawAdditionalApprover(this.currentUserId));
  }
  public get canAddApprover(): boolean {
    return this.selectedItems.every((item: Approval) => item.canAddApprover(this.currentUserId));
  }
  public get canDelegateDecision(): boolean {
    return this.selectedItems.every((item: Approval) => item.canDelegateDecision(this.currentUserId));
  }
  public get canDenyApproval(): boolean {
    return this.selectedItems.every((item: Approval) => item.canDenyApproval(this.currentUserId));
  }
  public get canEscalateDecision(): boolean {
    return this.selectedItems.every((item: Approval) => item.canEscalateDecision);
  }
  public get canRerouteDecision(): boolean {
    return this.selectedItems.every((item: Approval) => item.canRerouteDecision(this.currentUserId));
  }

  public get canResetReservation(): boolean {
    return this.selectedItems.every((item: Approval) => item.canResetReservation(this.isChiefApprover));
  }

  public get canSendInquiry(): boolean {
    return this.selectedItems.every((item: Approval) => item.CanAskForHelp.value);
  }

  public get canRecallInquiry(): boolean {
    return this.selectedItems.every((item: Approval) => item.canRecallInquiry);
  }

  public get canPerformActions(): boolean {
    return (
      this.selectedItems.length > 0 &&
      (this.canWithdrawAdditionalApprover ||
        this.canAddApprover ||
        this.canDelegateDecision ||
        this.canDenyApproval ||
        this.canRerouteDecision ||
        this.canEscalateDecision ||
        this.canSendInquiry ||
        this.canRecallInquiry ||
        this.canResetReservation)
    );
  }

  public currentUserId: string;
  public readonly entitySchema: EntitySchema;
  public canBeDelegated = false;
  public selectedItems: Approval[] = [];

  public busyService = new BusyService();

  private navigationState: ApprovalsLoadParameters;
  private approvalsDecision: ApprovalsDecision = ApprovalsDecision.none;
  private extensions: IExtension[] = [];
  private readonly subscriptions: Subscription[] = [];
  private readonly UID_ComplianceRuleId = 'cpl.UID_ComplianceRule';
  private dataModel: DataModel;
  private viewConfig: DataSourceToolbarViewConfig;
  private viewConfigPath = 'itshop/approve/requests';

  private displayedColumns: ClientPropertyForTableColumns[];

  constructor(
    public readonly actionService: WorkflowActionService,
    private readonly approvalsService: ApprovalsService,
    private viewConfigService: ViewConfigService,
    private readonly sideSheet: EuiSidesheetService,
    private readonly logger: ClassloggerService,
    private readonly projectConfig: ProjectConfigurationService,
    private readonly translator: TranslateService,
    settingsService: SettingsService,
    private readonly userModelService: UserModelService,
    authentication: AuthenticationService,
    private readonly ext: ExtService,
    private readonly permissions: QerPermissionsService,
    public dataSource: DataViewSource<Approval, PwoExtendedData | undefined>,
  ) {
    this.navigationState = { PageSize: settingsService.DefaultPageSize, StartIndex: 0 };
    this.entitySchema = approvalsService.PortalItshopApproveRequestsSchema;
    this.displayedColumns = [
      this.entitySchema?.Columns?.DisplayOrg,
      this.entitySchema?.Columns?.UiOrderState,
      this.entitySchema?.Columns?.OrderDate,
      this.entitySchema?.Columns?.PWOPriority,
      {
        ColumnName: 'decision',
        Type: ValType.String,
        afterAdditionals: true,
        untranslatedDisplay: '#LDS#Approval decision',
      },
      {
        ColumnName: 'recommendations',
        Type: ValType.String,
        untranslatedDisplay: '#LDS#Recommendation',
      },
    ];
    this.subscriptions.push(
      this.actionService.applied.subscribe(async () => {
        this.dataSource.selection.clear();
        this.dataSource.updateState();
      }),
    );
    this.subscriptions.push(
      authentication.onSessionResponse.subscribe((state: ISessionState) => {
        this.currentUserId = state.UserUid || '';
        if (state.IsLoggedIn) {
          this.viewEscalation = false;
        }
      }),
    );
    this.userModelService.getFeatures().then((featureInfo) => {
      this.isUserEscalationApprover = isCancelPwO(featureInfo.Features || []);
    });

    this.extensions = this.ext.Registry[this.UID_ComplianceRuleId];

    if (this.extensions && this.extensions.length > 0) {
      this.extensions[0].subject?.subscribe((dstSettings: DataSourceToolbarSettings) => {
        this.dataSource.collectionData.update((collectionData) => ({
          ...collectionData,
          Data: dstSettings.dataSource?.Data as Approval[],
        }));
      });
    }
  }

  public async ngOnInit(): Promise<void> {
    this.parseParams();
    const isBusy = this.busyService.beginBusy();

    try {
      this.dataModel = await this.approvalsService.getApprovalDataModel(this.abortController.signal);
      this.isChiefApprover = await this.permissions.isCancelPwO();
      if (this.abortController.signal.aborted) {
        return;
      }
      this.viewConfig = await this.viewConfigService.getInitialDSTExtension(
        this.dataModel,
        this.viewConfigPath,
        this.abortController.signal,
      );

      if (this.abortController.signal.aborted) {
        return;
      }

      await this.getData();
      this.handleDecision();
    } finally {
      isBusy.endBusy();
    }
  }

  public ngOnDestroy(): void {
    this.approvalsService.abortCall();
    this.dataSource?.abortCall();
    this.abortController.abort();
    // Set service value back to false since the toggle value is stored there
    this.approvalsService.isChiefApproval = false;
    this.subscriptions.forEach((s) => s.unsubscribe());
  }

  public async updateConfig(config: ViewConfigData): Promise<void> {
    await this.viewConfigService.putViewConfig(config);
    this.viewConfig = await this.viewConfigService.getDSTExtensionChanges(this.viewConfigPath);
    this.dataSource.viewConfig.set(this.viewConfig);
  }

  public async deleteConfigById(id: string): Promise<void> {
    await this.viewConfigService.deleteViewConfig(id);
    this.viewConfig = await this.viewConfigService.getDSTExtensionChanges(this.viewConfigPath);
    this.dataSource.viewConfig.set(this.viewConfig);
  }

  public get viewEscalation(): boolean {
    return this.approvalsService.isChiefApproval;
  }
  public set viewEscalation(val: boolean) {
    this.approvalsService.isChiefApproval = val;
  }

  public switchEscalation(): void {
    this.dataSource.selection.clear();
    this.dataSource.state.update((state) => ({ ...state, StartIndex: 0 }));
    this.dataSource.updateState();
  }

  public getAdditionalText(entity: Approval): string {
    return (
      this.dataSource
        .additionalListColumns()
        ?.map((elem: IClientProperty) => {
          return `${elem?.Display || elem?.ColumnName}: ${elem?.ColumnName == null ? '-' : entity.GetEntity().GetColumn(elem.ColumnName).GetDisplayValue() || '-'}`;
        })
        .filter((elem) => !!elem)
        .join('; ') || ''
    );
  }

  public async getData(): Promise<void> {
    const dataViewInitParameters: DataViewInitParameters<Approval> = {
      execute: (
        params: CollectionLoadParameters,
        signal: AbortSignal,
      ): Promise<ExtendedTypedEntityCollection<Approval, PwoExtendedData | undefined> | undefined> => {
        return Promise.resolve(
          this.approvalsService.get(params, { signal }).then((collectionData) => {
            if (this.extensions) {
              const dstSettings: DataSourceToolbarSettings = {
                dataSource: collectionData,
                navigationState: this.dataSource.state,
                entitySchema: this.entitySchema,
                extendedData: collectionData?.extendedData?.Data,
              };
              this.extensions[0].inputData = dstSettings;
            }
            return collectionData;
          }),
        );
      },
      schema: this.entitySchema,
      columnsToDisplay: this.displayedColumns,
      dataModel: this.dataModel,
      exportFunction: this.approvalsService.exportApprovalRequests(),
      viewConfig: this.viewConfig,
      highlightEntity: (approval: Approval) => {
        this.editPwo(approval);
      },
      selectionChange: (approval: Approval[]) => this.onSelectionChanged(approval),
    };
    this.dataSource.init(dataViewInitParameters);
  }

  /**
   * Occurs when user clicks the edit button for a request
   *
   * @param pwo Selected PortalItshopApproveRequests.
   */
  public async editPwo(pwo: Approval): Promise<void> {
    this.logger.trace('New selected pwo', pwo);
    const doUpdate = await this.sideSheet
      .open(ApprovalsSidesheetComponent, {
        title: await this.translator.get('#LDS#Heading View Request Details').toPromise(),
        subTitle: pwo.GetEntity().GetDisplay(),
        padding: '0',
        width: calculateSidesheetWidth(1000),
        testId: 'approvals-sidesheet',
        data: {
          pwo,
          itShopConfig: (await this.projectConfig.getConfig()).ITShopConfig,
          fromInquiry: false,
        },
      })
      .afterClosed()
      .toPromise();

    if (doUpdate) {
      await this.dataSource.updateState();
    }
  }

  /**
   * Occurs when user clicks the edit button for a request
   *
   * @param pwo Selected PortalItshopApproveRequests.
   */
  public async viewRecommendationDetails(pwo: Approval): Promise<void> {
    this.logger.trace('See recommendations of: ', pwo);
    const decision: 'approve' | 'deny' | null = await this.sideSheet
      .open(RecommendationSidesheetComponent, {
        title: await this.translator.get('#LDS#Heading View Recommendation Details').toPromise(),
        subTitle: pwo.GetEntity().GetDisplay(),
        panelClass: 'imx-sidesheet',
        padding: '0',
        width: calculateSidesheetWidth(1000),
        testId: 'approval-recommendation-sidesheet',
        data: { recommendations: pwo.pwoData.Recommendation },
      })
      .afterClosed()
      .toPromise();

    if (decision === 'approve') {
      this.actionService.approve([pwo]);
    } else if (decision === 'deny') {
      this.actionService.deny([pwo]);
    }
  }

  public onSelectionChanged(items: Approval[]): void {
    this.logger.trace(this, 'selection changed', items);
    this.selectedItems = items;
  }

  private parseParams(): void {
    // Cases: VI_BuildITShopLink_Approve, VI_BuildITShopLink_Deny, VI_BuildITShopLink_Reject
    if (this.params.uid_personwantsorg && this.params.uid_pwohelperpwo && this.params.decision) {
      this.navigationState.uid_personwantsorg = this.params.uid_personwantsorg;
      this.navigationState.uid_pwohelperpwo = this.params.uid_pwohelperpwo;

      // Will otherwise result in a string
      this.approvalsDecision = ApprovalsDecision[this.params.decision.toLowerCase()] as unknown as ApprovalsDecision;
      return;
    }

    // Case: VI_BuildITShopLink_Show_for_Approver
    if (this.params.uid_personwantsorg && this.params.uid_pwohelperpwo) {
      this.navigationState.uid_personwantsorg = this.params.uid_personwantsorg;
      this.navigationState.uid_pwohelperpwo = this.params.uid_pwohelperpwo;
      return;
    }

    // Case: VI_BuildITShopLink_Pending
    // Nothing to handle here.
  }

  private handleDecision(): void {
    if (this.approvalsDecision === ApprovalsDecision.none || !!this.dataSource.collectionData()?.Data?.length) {
      return;
    }

    switch (this.approvalsDecision) {
      case ApprovalsDecision.approve:
        this.actionService.approve(this.dataSource.collectionData()?.Data || []);
        break;
      case ApprovalsDecision.deny:
        this.actionService.deny(this.dataSource.collectionData()?.Data || []);
        break;
      case ApprovalsDecision.denydecision:
        this.actionService.denyDecisions(this.dataSource.collectionData()?.Data || []);
        break;
    }
  }
}
