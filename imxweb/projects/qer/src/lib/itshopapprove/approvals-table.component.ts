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
 * Copyright 2021 One Identity LLC.
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

import { OverlayRef } from '@angular/cdk/overlay';
import { Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Params } from '@angular/router';
import { EuiLoadingService, EuiSidesheetService } from '@elemental-ui/core';
import { Subscription } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';

import { PwoExtendedData } from 'imx-api-qer';
import { ValType, ExtendedTypedEntityCollection, TypedEntity, EntitySchema, DataModel, IClientProperty } from 'imx-qbm-dbts';

import { DataSourceToolbarSettings, ClassloggerService, AuthenticationService, DataTableComponent, isIE, SettingsService, IExtension, ExtService, buildAdditionalElementsString } from 'qbm';
import { ApprovalsSidesheetComponent } from './approvals-sidesheet/approvals-sidesheet.component';
import { Approval } from './approval';
import { ProjectConfigurationService } from '../project-configuration/project-configuration.service';
import { ApprovalsService } from './approvals.service';
import { WorkflowActionService } from './workflow-action/workflow-action.service';
import { ApprovalsLoadParameters } from './approvals-load-parameters';
import { ApprovalsDecision } from './approvals-decision.enum';
import { UserModelService } from '../user/user-model.service';

@Component({
  templateUrl: './approvals-table.component.html',
  selector: 'imx-approvals-table',
  styleUrls: ['./approvals-table.component.scss'],
})
export class ApprovalsTableComponent implements OnInit, OnDestroy {
  @Input() public params: Params = {};
  public isUserEscalationApprover = false;

  public get canWithdrawAdditionalApprover(): boolean {
    return this.selectedItems.every((item) => item.canWithdrawAdditionalApprover(this.currentUserId));
  }
  public get canAddApprover(): boolean {
    return this.selectedItems.every((item) => item.canAddApprover(this.currentUserId));
  }
  public get canDelegateDecision(): boolean {
    return this.selectedItems.every((item) => item.canDelegateDecision(this.currentUserId));
  }
  public get canDenyApproval(): boolean {
    return this.selectedItems.every((item) => item.canDenyApproval(this.currentUserId));
  }
  public get canEscalateDecision(): boolean {
    return this.selectedItems.every((item) => item.canEscalateDecision);
  }
  public get canRerouteDecision(): boolean {
    return this.selectedItems.every((item) => item.canRerouteDecision(this.currentUserId));
  }
  public get canPerformActions(): boolean {
    return (
      this.selectedItems.length > 0 &&
      (this.canWithdrawAdditionalApprover ||
        this.canAddApprover ||
        this.canDelegateDecision ||
        this.canDenyApproval ||
        this.canRerouteDecision ||
        this.canEscalateDecision)
    );
  }

  public currentUserId: string;
  public dstSettings: DataSourceToolbarSettings;
  public readonly entitySchema: EntitySchema;
  public canBeDelegated = false;
  public selectedItems: Approval[] = [];
  public approvalsCollection: ExtendedTypedEntityCollection<Approval, PwoExtendedData>;

  @ViewChild(DataTableComponent) private readonly table: DataTableComponent<TypedEntity>;

  private navigationState: ApprovalsLoadParameters;
  private approvalsDecision: ApprovalsDecision = ApprovalsDecision.none;
  private extensions: IExtension[] = [];
  private readonly subscriptions: Subscription[] = [];
  private readonly UID_ComplianceRuleId = 'cpl.UID_ComplianceRule';

  private dataModel: DataModel;

  constructor(
    public readonly actionService: WorkflowActionService,
    private readonly approvalsService: ApprovalsService,
    private readonly sideSheet: EuiSidesheetService,
    private readonly logger: ClassloggerService,
    private readonly busyService: EuiLoadingService,
    private readonly projectConfig: ProjectConfigurationService,
    private readonly translator: TranslateService,
    settingsService: SettingsService,
    private readonly userModelService: UserModelService,
    authentication: AuthenticationService,
    private readonly ext: ExtService
  ) {
    this.navigationState = { PageSize: settingsService.DefaultPageSize, StartIndex: 0 };
    this.entitySchema = approvalsService.PortalItshopApproveRequestsSchema;
    this.subscriptions.push(
      this.actionService.applied.subscribe(async () => {
        this.getData();
        this.table.clearSelection();
      })
    );
    this.subscriptions.push(authentication.onSessionResponse.subscribe((state) => (this.currentUserId = state.UserUid)));
    this.userModelService.getGroups().then((groups) => {
      this.isUserEscalationApprover = groups.find((g) => g.Name === 'vi_4_ITSHOPADMIN_CANCEL') != null;
    });

    this.extensions = this.ext.Registry[this.UID_ComplianceRuleId];

    if (this.extensions && this.extensions.length > 0) {
      this.extensions[0].subject.subscribe((dstSettings: DataSourceToolbarSettings) => {
        this.dstSettings = dstSettings;
      })
    }
  }

  public async ngOnInit(): Promise<void> {
    this.parseParams();
    let overlayRef: OverlayRef;
    setTimeout(() => (overlayRef = this.busyService.show()));

    try {
      this.dataModel = await this.approvalsService.getApprovalDataModel();
    } finally {
      setTimeout(() => this.busyService.hide(overlayRef));
    }
    await this.getData();
    this.handleDecision();
  }

  public ngOnDestroy(): void {
    // Set service value back to false since the toggle value is stored there
    this.approvalsService.isChiefApproval = false;
    this.subscriptions.forEach((s) => s.unsubscribe());
  }


  public get viewEscalation(): boolean {
    return this.approvalsService.isChiefApproval;
  }
  public set viewEscalation(val: boolean) {
    this.approvalsService.isChiefApproval = val;
  }

  public switchEscalation(): Promise<void> {
    // Set start index to 0 and clear selection before changing
    const navigationState = {
      ...this.navigationState,
      ...{
        StartIndex: 0,
      },
    };
    this.table.clearSelection();
    return this.getData(navigationState);
  }

  public getAdditionalText(entity: Approval, additional: IClientProperty[]): string {
    return buildAdditionalElementsString(entity.GetEntity(), additional);
  }

  public async getData(parameters?: ApprovalsLoadParameters): Promise<void> {
    if (parameters) {
      this.navigationState = parameters;
    }

    let busyIndicator: OverlayRef;
    setTimeout(() => (busyIndicator = this.busyService.show()));

    try {
      this.approvalsCollection = await this.approvalsService.get(this.navigationState);
      this.updateTable();

      if (this.extensions && this.extensions[0]) {
        this.extensions[0].inputData = this.dstSettings;
      }

    } finally {
      setTimeout(() => this.busyService.hide(busyIndicator));
    }
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
        headerColour: 'blue',
        padding: '10px',
        width: isIE() ? '40%' : 'max(550px, 40%)',
        testId: 'approvals-sidesheet',
        data: {
          pwo,
          itShopConfig: (await this.projectConfig.getConfig()).ITShopConfig,
        },
      })
      .afterClosed()
      .toPromise();

    if (doUpdate) {
      await this.getData();
    }
  }

  public onSearch(keywords: string): Promise<void> {
    const navigationState = {
      ...this.navigationState,
      ...{
        StartIndex: 0,
        search: keywords,
      },
    };

    return this.getData(navigationState);
  }

  public onSelectionChanged(items: Approval[]): void {
    this.logger.trace(this, 'selection changed', items);
    this.selectedItems = items;
  }

  private updateTable(): void {
    if (this.approvalsCollection) {
      this.dstSettings = {
        dataSource: this.approvalsCollection,
        extendedData: this.approvalsCollection.extendedData?.Data,
        entitySchema: this.entitySchema,
        navigationState: this.navigationState,
        displayedColumns: [
          this.entitySchema.Columns.DisplayOrg,
          this.entitySchema.Columns.UiOrderState,
          this.entitySchema.Columns.OrderDate,
          this.entitySchema.Columns.PWOPriority,
          {
            ColumnName: 'decision',
            Type: ValType.String,
          },
          {
            ColumnName: 'edit',
            Type: ValType.String,
          },
        ],
        dataModel: this.dataModel,
        identifierForSessionStore: 'approvals-table'
      };
    } else {
      this.dstSettings = undefined;
    }
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
    if (
      this.approvalsDecision === ApprovalsDecision.none ||
      this.approvalsCollection.Data == null ||
      this.approvalsCollection.Data.length === 0
    ) {
      return;
    }

    switch (this.approvalsDecision) {
      case ApprovalsDecision.approve:
        this.actionService.approve(this.approvalsCollection.Data);
        break;
      case ApprovalsDecision.deny:
        this.actionService.deny(this.approvalsCollection.Data);
        break;
      case ApprovalsDecision.denydecision:
        this.actionService.denyDecisions(this.approvalsCollection.Data);
        break;
    }
  }
}
