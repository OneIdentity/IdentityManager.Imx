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

import { Component, OnDestroy, OnInit } from '@angular/core';
import { EuiLoadingService, EuiSidesheetService } from '@elemental-ui/core';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';

import { ViewConfigData } from '@imx-modules/imx-api-qer';
import { PortalTargetsystemUnsAccount } from '@imx-modules/imx-api-tsb';
import {
  CollectionLoadParameters,
  DataModel,
  DbObjectKey,
  DisplayColumns,
  EntitySchema,
  IClientProperty,
  TypedEntityCollectionData,
} from '@imx-modules/imx-qbm-dbts';
import {
  BusyService,
  ClassloggerService,
  DataSourceToolbarFilter,
  DataSourceToolbarViewConfig,
  DataViewInitParameters,
  DataViewSource,
  HELP_CONTEXTUAL,
  SettingsService,
  SideNavigationComponent,
  calculateSidesheetWidth,
} from 'qbm';
import { ViewConfigService } from 'qer';
import { ContainerTreeDatabaseWrapper } from '../container-list/container-tree-database-wrapper';
import { DeHelperService } from '../de-helper.service';
import { AccountSidesheetComponent } from './account-sidesheet/account-sidesheet.component';
import { AccountSidesheetData } from './accounts.models';
import { AccountsService } from './accounts.service';
import { TargetSystemReportComponent } from './target-system-report/target-system-report.component';

@Component({
  selector: 'imx-data-explorer-accounts',
  templateUrl: './accounts.component.html',
  styleUrls: ['./accounts.component.scss'],
  providers: [DataViewSource],
})
export class DataExplorerAccountsComponent implements OnInit, OnDestroy, SideNavigationComponent {
  /**
   * Page size, start index, search and filtering options etc.
   */
  public navigationState: CollectionLoadParameters;
  public filterOptions: DataSourceToolbarFilter[] = [];
  public treeDbWrapper: ContainerTreeDatabaseWrapper;

  public readonly entitySchemaUnsAccount: EntitySchema;
  public readonly DisplayColumns = DisplayColumns;
  public data: any;
  public busyService = new BusyService();
  public contextId = HELP_CONTEXTUAL.DataExplorerAccounts;

  private displayedColumns: IClientProperty[] = [];
  private authorityDataDeleted$: Subscription;
  private tableName: string;
  private dataModel: DataModel;
  private viewConfigPath = 'targetsystem/uns/account';
  private viewConfig: DataSourceToolbarViewConfig;

  constructor(
    public translateProvider: TranslateService,
    private readonly sideSheet: EuiSidesheetService,
    private readonly logger: ClassloggerService,
    private readonly accountsService: AccountsService,
    private readonly dataHelper: DeHelperService,
    private viewConfigService: ViewConfigService,
    readonly settingsService: SettingsService,
    private readonly busyServiceElemental: EuiLoadingService,
    public dataSource: DataViewSource<PortalTargetsystemUnsAccount>,
  ) {
    this.navigationState = { PageSize: settingsService.DefaultPageSize, StartIndex: 0 };
    this.entitySchemaUnsAccount = accountsService.accountSchema;
    this.authorityDataDeleted$ = this.dataHelper.authorityDataDeleted.subscribe(() => this.dataSource.updateState());
    this.treeDbWrapper = new ContainerTreeDatabaseWrapper(this.busyService, dataHelper);
  }

  public async ngOnInit(): Promise<void> {
    /** if you like to add columns, please check {@link AccountsExtComponent | Account Extension Component} as well */
    this.displayedColumns = [
      this.entitySchemaUnsAccount.Columns[DisplayColumns.DISPLAY_PROPERTYNAME],
      this.entitySchemaUnsAccount.Columns.UID_Person,
      this.entitySchemaUnsAccount.Columns.UID_UNSRoot,
      this.entitySchemaUnsAccount.Columns.AccountDisabled,
      this.entitySchemaUnsAccount.Columns.XMarkedForDeletion,
    ];

    const isBusy = this.busyService.beginBusy();

    try {
      this.dataModel = await this.accountsService.getDataModel();
      this.viewConfig = await this.viewConfigService.getInitialDSTExtension(this.dataModel, this.viewConfigPath);
      const dataViewInitParameters: DataViewInitParameters<PortalTargetsystemUnsAccount> = {
        execute: (
          params: CollectionLoadParameters,
          signal: AbortSignal,
        ): Promise<TypedEntityCollectionData<PortalTargetsystemUnsAccount>> => this.accountsService.getAccounts(params, signal),
        schema: this.entitySchemaUnsAccount,
        columnsToDisplay: this.displayedColumns,
        dataModel: this.dataModel,
        exportFunction: this.accountsService.exportAccounts(),
        viewConfig: this.viewConfig,
        highlightEntity: (identity: PortalTargetsystemUnsAccount) => {
          this.onAccountChanged(identity);
        },
        filterTree: {
          filterMethode: async (parentkey) => {
            return this.accountsService.getFilterTree({
              parentkey,
              filter: this.dataSource.state().filter,
            });
          },
          multiSelect: false,
        },
      };
      this.dataSource.init(dataViewInitParameters);
    } finally {
      isBusy.endBusy();
    }
  }

  public ngOnDestroy(): void {
    if (this.authorityDataDeleted$) {
      this.authorityDataDeleted$.unsubscribe();
    }
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

  public async onAccountChanged(unsAccount: PortalTargetsystemUnsAccount): Promise<void> {
    this.logger.debug(this, `Selected UNS account changed`);
    this.logger.trace(this, `New UNS account selected`, unsAccount);

    let data: AccountSidesheetData;

    const hideOverlayRef = this.busyServiceElemental.show();
    try {
      const unsDbObjectKey = DbObjectKey.FromXml(unsAccount.GetEntity().GetColumn('XObjectKey').GetValue());

      data = {
        unsAccountId: unsAccount.GetEntity().GetColumn('UID_UNSAccount').GetValue(),
        unsDbObjectKey,
        selectedAccount: await this.accountsService.getAccountInteractive(unsDbObjectKey, 'UID_UNSAccount'),
        uidPerson: unsAccount.GetEntity().GetColumn('UID_Person').GetValue(),
        tableName: this.tableName,
      };
    } finally {
      this.busyServiceElemental.hide(hideOverlayRef);
    }

    await this.viewAccount(data);
  }

  public async openReportOptionsSidesheet(): Promise<void> {
    this.sideSheet.open(TargetSystemReportComponent, {
      title: await this.translateProvider.get('#LDS#Heading Download Target System Report').toPromise(),
      icon: 'download',
      padding: '0px',
      width: calculateSidesheetWidth(700, 0.4),
      testId: 'accounts-report-sidesheet',
    });
  }

  private async viewAccount(data: AccountSidesheetData): Promise<void> {
    this.logger.debug(this, `Viewing account`);
    this.logger.trace(this, `Account selected`, data.selectedAccount);
    const sidesheetRef = this.sideSheet.open(AccountSidesheetComponent, {
      title: await this.translateProvider.get('#LDS#Heading Edit User Account').toPromise(),
      subTitle: data.selectedAccount.GetEntity().GetDisplay(),
      padding: '0px',
      width: calculateSidesheetWidth(),
      icon: 'account',
      testId: 'edit-user-account-sidesheet',
      data,
    });
    sidesheetRef.afterClosed().subscribe((dataRefreshRequired) => {
      if (dataRefreshRequired) {
        this.dataSource.updateState();
      }
    });
  }
}
