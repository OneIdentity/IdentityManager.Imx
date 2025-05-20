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
import { EuiSidesheetService } from '@elemental-ui/core';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';

import { PwoExtendedData, ViewConfigData } from '@imx-modules/imx-api-qer';
import {
  CollectionLoadParameters,
  DataModel,
  EntityData,
  EntitySchema,
  ExtendedTypedEntityCollection,
  TypedEntity,
  ValType,
} from '@imx-modules/imx-qbm-dbts';
import {
  AuthenticationService,
  BusyService,
  calculateSidesheetWidth,
  ClassloggerService,
  ClientPropertyForTableColumns,
  ConfirmationService,
  DataSourceToolbarViewConfig,
  DataViewInitParameters,
  DataViewSource,
  ISessionState,
  SnackBarService,
} from 'qbm';
import { ProjectConfigurationService } from '../../project-configuration/project-configuration.service';
import { ViewConfigService } from '../../view-config/view-config.service';
import { Approval } from '../approval';
import { ApprovalsSidesheetComponent } from '../approvals-sidesheet/approvals-sidesheet.component';
import { ApprovalsService } from '../approvals.service';
import { WorkflowActionService } from '../workflow-action/workflow-action.service';

@Component({
  templateUrl: './inquiries.component.html',
  selector: 'imx-inquiries',
  styleUrls: ['./inquiries.component.scss'],
  providers: [DataViewSource],
})
export class InquiriesComponent implements OnInit, OnDestroy {
  public readonly entitySchema: EntitySchema;

  @Input() public uidHelperPwo: string;
  private isInitialLoadedWithServer = false;
  private displayedColumns: ClientPropertyForTableColumns[];
  private readonly subscriptions: Subscription[] = [];
  private dataModel: DataModel;
  private viewConfig: DataSourceToolbarViewConfig;
  private viewConfigPath = 'itshop/approve/requests';
  public userUid: string;

  public busyService = new BusyService();

  constructor(
    public readonly actionService: WorkflowActionService,
    private readonly approvalsService: ApprovalsService,
    private viewConfigService: ViewConfigService,
    private readonly sideSheet: EuiSidesheetService,
    private readonly logger: ClassloggerService,
    private readonly projectConfig: ProjectConfigurationService,
    private readonly translator: TranslateService,
    snackbar: SnackBarService,
    authentication: AuthenticationService,
    public dataSource: DataViewSource<Approval, PwoExtendedData | undefined>,
    private confirmation: ConfirmationService,
  ) {
    this.entitySchema = approvalsService.PortalItshopApproveRequestsSchema;
    (this.displayedColumns = [
      {
        ColumnName: 'query',
        Type: ValType.String,
        untranslatedDisplay: '#LDS#Query',
      },
      this.entitySchema?.Columns.DisplayOrg,
      {
        ColumnName: 'inquirer',
        Type: ValType.String,
        untranslatedDisplay: '#LDS#Inquiry made by',
      },
      {
        ColumnName: 'queryDate',
        Type: ValType.String,
        untranslatedDisplay: '#LDS#Inquiry made on',
      },
      {
        ColumnName: 'edit',
        Type: ValType.String,
        untranslatedDisplay: '#LDS#Actions',
      },
    ]),
      this.subscriptions.push(
        this.actionService.applied.subscribe(async () => {
          if (this.dataSource.collectionData().totalCount === 1) {
            snackbar.open({
              key: '#LDS#There are currently no inquiries.',
            });
          }
          this.dataSource.selection.clear();
          this.dataSource.updateState();
        }),
      );
    this.approvalsService.isChiefApproval = false;
    this.subscriptions.push(authentication.onSessionResponse.subscribe((session: ISessionState) => (this.userUid = session.UserUid || '')));
  }

  public async ngOnInit(): Promise<void> {
    const isBusy = this.busyService.beginBusy();

    try {
      this.dataModel = await this.approvalsService.getApprovalDataModel();
      this.viewConfig = await this.viewConfigService.getInitialDSTExtension(this.dataModel, this.viewConfigPath);

      await this.getData();
    } finally {
      isBusy.endBusy();
    }
  }

  public ngOnDestroy(): void {
    // Set service value back to false since the toggle value is stored there
    this.approvalsService.isChiefApproval = false;
    this.subscriptions.forEach((s) => s.unsubscribe());
  }

  public async getData(): Promise<void> {
    const dataViewInitParameters: DataViewInitParameters<Approval> = {
      execute: (
        params: CollectionLoadParameters,
        signal: AbortSignal,
      ): Promise<ExtendedTypedEntityCollection<Approval, PwoExtendedData | undefined> | undefined> =>
        this.getDataFromService(params, signal),
      schema: this.entitySchema,
      columnsToDisplay: this.displayedColumns,
      dataModel: this.dataModel,
      exportFunction: this.approvalsService.exportApprovalRequests(),
      viewConfig: this.viewConfig,
      highlightEntity: (approval: Approval) => {
        this.editPwo(approval);
      },
    };
    this.dataSource.init(dataViewInitParameters);
  }

  /**
   * Extracts the server communication, because if the data is loaded for the first time, a special check is needed
   * @returns Promise<ExtendedTypedEntityCollection<Approval, PwoExtendedData>>
   */
  private async getDataFromService(
    state: CollectionLoadParameters,
    signal: AbortSignal,
  ): Promise<ExtendedTypedEntityCollection<Approval, PwoExtendedData | undefined> | undefined> {
    const result = await this.approvalsService.get({ ...state, forinquiry: true, uid_pwohelperpwo: this.uidHelperPwo }, { signal });
    if (this.uidHelperPwo && result?.Data.length === 0 && !this.isInitialLoadedWithServer) {
      this.confirmation.confirm({ Message: '#LDS#This request has already been approved or denied.' });
    }
    // checks, if the data is loaded from the server for the first time
    this.isInitialLoadedWithServer = true;
    return result;
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

  /**
   * Occurs when user clicks the edit button for a request
   *
   * @param pwo Selected PortalItshopApproveRequests.
   */
  public async editPwo(pwo: TypedEntity): Promise<void> {
    this.logger.trace('New selected pwo', pwo);
    const doUpdate = await this.sideSheet
      .open(ApprovalsSidesheetComponent, {
        title: await this.translator.get('#LDS#Heading View Request Details').toPromise(),
        subTitle: pwo.GetEntity().GetDisplay(),
        padding: '0',
        width: calculateSidesheetWidth(1000),
        testId: 'inqueries-sidesheet',
        data: {
          pwo,
          itShopConfig: (await this.projectConfig.getConfig()).ITShopConfig,
          fromInquiry: true,
        },
      })
      .afterClosed()
      .toPromise();

    if (doUpdate) {
      await this.getData();
    }
  }

  public getInquiryText(pwo: Approval): string {
    return this.getPwoData(pwo)?.Columns?.ReasonHead.Value || '';
  }
  public getInquirer(pwo: Approval): string {
    return this.getPwoData(pwo)?.Columns?.DisplayPersonHead.Value || '';
  }
  public getQueryDate(pwo: Approval): string {
    return this.getPwoData(pwo)?.Columns?.DateHead.Value ?? '';
  }

  private getPwoData(pwo: Approval): EntityData | undefined {
    const questionHistory = pwo.pwoData.WorkflowHistory?.Entities?.filter(
      (entityData) => entityData.Columns?.DecisionLevel.Value === pwo.DecisionLevel.value,
    ).sort((item1, item2) => this.ascendingDate(item1.Columns?.XDateInserted?.Value, item2.Columns?.XDateInserted?.Value));
    return questionHistory?.[0];
  }

  private ascendingDate(value1: Date, value2: Date): number {
    if (value1 < value2) {
      return 1;
    }

    if (value1 > value2) {
      return -1;
    }

    return 0;
  }
}
