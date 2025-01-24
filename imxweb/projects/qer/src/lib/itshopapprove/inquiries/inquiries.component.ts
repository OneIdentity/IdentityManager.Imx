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
 * Copyright 2023 One Identity LLC.
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

import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { EuiSidesheetService } from '@elemental-ui/core';
import { Subscription } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';

import { PwoExtendedData, ViewConfigData } from 'imx-api-qer';
import { ValType, ExtendedTypedEntityCollection, TypedEntity, EntitySchema, DataModel, EntityData } from 'imx-qbm-dbts';
import {
  DataSourceToolbarSettings,
  ClassloggerService,
  AuthenticationService,
  DataTableComponent,
  SettingsService,
  SnackBarService,
  ClientPropertyForTableColumns,
  BusyService,
  DataSourceToolbarViewConfig,
} from 'qbm';
import { ApprovalsSidesheetComponent } from '../approvals-sidesheet/approvals-sidesheet.component';
import { Approval } from '../approval';
import { ProjectConfigurationService } from '../../project-configuration/project-configuration.service';
import { ApprovalsService } from '../approvals.service';
import { WorkflowActionService } from '../workflow-action/workflow-action.service';
import { ApprovalsLoadParameters } from '../approvals-load-parameters';
import { ViewConfigService } from '../../view-config/view-config.service';

@Component({
  templateUrl: './inquiries.component.html',
  selector: 'imx-inquiries',
  styleUrls: ['./inquiries.component.scss'],
})
export class InquiriesComponent implements OnInit, OnDestroy {
  public dstSettings: DataSourceToolbarSettings;
  public readonly entitySchema: EntitySchema;
  public approvalsCollection: ExtendedTypedEntityCollection<Approval, PwoExtendedData>;
  public hasData = false;

  @ViewChild(DataTableComponent) private readonly table: DataTableComponent<TypedEntity>;

  private navigationState: ApprovalsLoadParameters;
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
    settingsService: SettingsService,
    authentication: AuthenticationService
  ) {
    this.navigationState = { PageSize: settingsService.DefaultPageSize, StartIndex: 0 };
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
          if (this.dstSettings.dataSource.totalCount === 1) {
            snackbar.open({
              key: '#LDS#There are currently no inquiries.',
            });
          }
          this.getData();
          this.table.clearSelection();
        })
      );
    this.approvalsService.isChiefApproval = false;
    this.subscriptions.push(authentication.onSessionResponse.subscribe((session) => (this.userUid = session.UserUid)));
  }

  public async ngOnInit(): Promise<void> {
    this.navigationState.forinquiry = true;
    const isBusy = this.busyService.beginBusy();

    try {
      this.dataModel = await this.approvalsService.getApprovalDataModel();
      this.viewConfig = await this.viewConfigService.getInitialDSTExtension(this.dataModel, this.viewConfigPath);

      await this.getData(undefined, true);
    } finally {
      isBusy.endBusy();
    }
  }

  public ngOnDestroy(): void {
    // Set service value back to false since the toggle value is stored there
    this.approvalsService.isChiefApproval = false;
    this.subscriptions.forEach((s) => s.unsubscribe());
  }

  public async getData(parameters?: ApprovalsLoadParameters, isInitialLoad: boolean = false): Promise<void> {
    if (parameters) {
      this.navigationState = parameters;
    }

    const isBusy = this.busyService.beginBusy();

    try {
      this.approvalsCollection = isInitialLoad ? { totalCount: 0, Data: [] } : await this.approvalsService.get(this.navigationState);
      this.hasData = this.approvalsCollection?.totalCount > 0 || (this.navigationState.search ?? '') !== '';
      this.updateTable();
    } finally {
      isBusy.endBusy();
    }
  }

  public async updateConfig(config: ViewConfigData): Promise<void> {
    await this.viewConfigService.putViewConfig(config);
    this.viewConfig = await this.viewConfigService.getDSTExtensionChanges(this.viewConfigPath);
    this.dstSettings.viewConfig = this.viewConfig;
  }

  public async deleteConfigById(id: string): Promise<void> {
    await this.viewConfigService.deleteViewConfig(id);
    this.viewConfig = await this.viewConfigService.getDSTExtensionChanges(this.viewConfigPath);
    this.dstSettings.viewConfig = this.viewConfig;
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
        width: 'max(700px, 60%)',
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
    return this.getPwoData(pwo).Columns.ReasonHead.Value;
  }
  public getInquirer(pwo: Approval): string {
    return this.getPwoData(pwo).Columns.DisplayPersonHead.Value;
  }
  public getQueryDate(pwo: Approval): Date {
    return new Date(this.getPwoData(pwo).Columns.DateHead.Value);
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

  private getPwoData(pwo: Approval): EntityData {
    const questionHistory = pwo.pwoData.WorkflowHistory.Entities.filter(
      (entityData) => entityData.Columns.DecisionLevel.Value === pwo.DecisionLevel.value
    ).sort((item1, item2) => this.ascendingDate(item1.Columns.XDateInserted?.Value, item2.Columns.XDateInserted?.Value));
    return questionHistory[0];
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

  private updateTable(): void {
    if (this.approvalsCollection) {
      const exportMethod = this.approvalsService.exportApprovalRequests(this.navigationState);
      exportMethod.initialColumns = this.displayedColumns.map((col) => col.ColumnName);
      this.dstSettings = {
        dataSource: this.approvalsCollection,
        extendedData: this.approvalsCollection?.extendedData?.Data,
        entitySchema: this.entitySchema,
        navigationState: this.navigationState,
        displayedColumns: this.displayedColumns,
        dataModel: this.dataModel,
        viewConfig: this.viewConfig,
        exportMethod,
      };
    } else {
      this.dstSettings = undefined;
    }
  }
}
