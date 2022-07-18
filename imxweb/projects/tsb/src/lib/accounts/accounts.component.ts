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
 * Copyright 2022 One Identity LLC.
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

import { Component, Input, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { OverlayRef } from '@angular/cdk/overlay';
import { EuiSidesheetService, EuiLoadingService } from '@elemental-ui/core';
import { Subscription } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';

import {
  DataSourceToolbarSettings,
  ClassloggerService,
  DataSourceToolbarFilter,
  SettingsService
} from 'qbm';
import { IDataExplorerComponent } from 'qer';
import { CollectionLoadParameters, IClientProperty, DisplayColumns, DbObjectKey, EntitySchema, DataModel, FilterData } from 'imx-qbm-dbts';
import { AccountsService } from './accounts.service';
import { AccountSidesheetComponent } from './account-sidesheet/account-sidesheet.component';
import { DeHelperService } from '../de-helper.service';
import { DataExplorerFiltersComponent } from '../data-filters/data-explorer-filters.component';
import { AccountSidesheetData, GetAccountsOptionalParameters } from './accounts.models';
import { PortalTargetsystemUnsSystem, PortalTargetsystemUnsAccount } from 'imx-api-tsb';
import { ContainerTreeDatabaseWrapper } from '../container-list/container-tree-database-wrapper';
import { TargetSystemReportComponent } from './target-system-report/target-system-report.component';

@Component({
  selector: 'imx-data-explorer-accounts',
  templateUrl: './accounts.component.html',
  styleUrls: ['./accounts.component.scss'],
})
export class DataExplorerAccountsComponent implements OnInit, OnDestroy, IDataExplorerComponent {
  @Input() public applyIssuesFilter = false;
  @Input() public issuesFilterMode: string;
  @Input() public targetSystemData?: PortalTargetsystemUnsSystem[];

  @ViewChild('dataExplorerFilters', { static: false }) public dataExplorerFilters: DataExplorerFiltersComponent;

  /**
   * Settings needed by the DataSourceToolbarComponent
   */

  public dstSettings: DataSourceToolbarSettings;
  /**
   * Page size, start index, search and filtering options etc.
   */
  public navigationState: CollectionLoadParameters;
  public filterOptions: DataSourceToolbarFilter[] = [];
  public treeDbWrapper: ContainerTreeDatabaseWrapper;

  public readonly entitySchemaUnsAccount: EntitySchema;
  public readonly DisplayColumns = DisplayColumns;
  public data: any;

  private displayedColumns: IClientProperty[] = [];
  private authorityDataDeleted$: Subscription;
  private tableName: string;
  private busyIndicator: OverlayRef;
  private dataModel: DataModel;

  constructor(
    public translateProvider: TranslateService,
    private readonly sideSheet: EuiSidesheetService,
    private readonly busyService: EuiLoadingService,
    private readonly logger: ClassloggerService,
    private readonly accountsService: AccountsService,
    private readonly dataHelper: DeHelperService,
    readonly settingsService: SettingsService
  ) {
    this.navigationState = { PageSize: settingsService.DefaultPageSize, StartIndex: 0 };
    this.entitySchemaUnsAccount = accountsService.accountSchema;
    this.authorityDataDeleted$ = this.dataHelper.authorityDataDeleted.subscribe(() => this.navigate());
    this.treeDbWrapper = new ContainerTreeDatabaseWrapper(busyService, dataHelper);
  }

  public async ngOnInit(): Promise<void> {
    this.displayedColumns = [
      this.entitySchemaUnsAccount.Columns[DisplayColumns.DISPLAY_PROPERTYNAME],
      this.entitySchemaUnsAccount.Columns.UID_Person,
      this.entitySchemaUnsAccount.Columns.UID_UNSRoot,
      this.entitySchemaUnsAccount.Columns.AccountDisabled,
      this.entitySchemaUnsAccount.Columns.XMarkedForDeletion,
    ];
    let overlayRef: OverlayRef;
    setTimeout(() => (overlayRef = this.busyService.show()));

    try {
      this.filterOptions = await this.accountsService.getFilterOptions();
      this.dataModel = await this.accountsService.getDataModel();
    } finally {
      setTimeout(() => this.busyService.hide(overlayRef));
    }
    if (this.applyIssuesFilter && !this.issuesFilterMode) {
      const orphanedFilter = this.filterOptions.find((f) => {
        return f.Name === 'orphaned';
      });

      if (orphanedFilter) {
        orphanedFilter.InitialValue = '1';
      }
    }

    if (this.applyIssuesFilter && this.issuesFilterMode === 'manager') {
      const managerDiscrepencyFilter = this.filterOptions.find((f) => {
        return f.Name === 'managerdiscrepancy';
      });

      if (managerDiscrepencyFilter) {
        managerDiscrepencyFilter.InitialValue = '1';
      }
    }
    await this.navigate();
  }

  public ngOnDestroy(): void {
    if (this.authorityDataDeleted$) {
      this.authorityDataDeleted$.unsubscribe();
    }
  }

  /**
   * Occurs when the navigation state has changed - e.g. users clicks on the next page button.
   *
   */
  public async onNavigationStateChanged(newState?: CollectionLoadParameters): Promise<void> {
    if (newState) {
      this.navigationState = newState;
    }
    await this.navigate();
  }

  public async onAccountChanged(unsAccount: PortalTargetsystemUnsAccount): Promise<void> {
    this.logger.debug(this, `Selected UNS account changed`);
    this.logger.trace(this, `New UNS account selected`, unsAccount);

    let data: AccountSidesheetData;

    this.handleOpenLoader();
    try {
      const unsDbObjectKey = DbObjectKey.FromXml(unsAccount.XObjectKey.value);

      data = {
        unsAccountId: unsAccount.UID_UNSAccount.value,
        unsDbObjectKey,
        selectedAccount: await this.accountsService.getAccountInteractive(unsDbObjectKey, 'UID_UNSAccount'),
        uidPerson: unsAccount.UID_Person.value,
        tableName: this.tableName
      };
    } finally {
      this.handleCloseLoader();
    }

    this.viewAccount(data);
  }

  /**
   * Occurs when user triggers search.
   *
   * @param keywords Search keywords.
   */
  public async onSearch(keywords: string): Promise<void> {
    this.logger.debug(this, `Searching for: ${keywords}`);
    this.navigationState.StartIndex = 0;
    this.navigationState.search = keywords;
    await this.navigate();
  }

  public async filterByTree(filters: FilterData[]): Promise<void> {
    this.navigationState.filter = filters;
    return this.navigate();
  }

  public async openReportOptionsSidesheet(): Promise<void> {
    this.sideSheet.open(TargetSystemReportComponent, {
      title: await this.translateProvider.get('#LDS#Choose target system for report').toPromise(),
      headerColour: 'iris-blue',
      bodyColour: 'asher-gray',
      padding: '0px',
      width: 'max(400px, 40%)',
      testId: 'accounts-report-sidesheet'
    });
  }

  private async navigate(): Promise<void> {
    this.handleOpenLoader();
    const getParams: GetAccountsOptionalParameters = this.navigationState;

    try {
      this.logger.debug(this, `Retrieving accounts list`);
      this.logger.trace('Navigation settings', this.navigationState);
      const tsUid = this.dataExplorerFilters.selectedTargetSystemUid;
      const cUid = this.dataExplorerFilters.selectedContainerUid;
      getParams.system = tsUid ? tsUid : undefined;
      getParams.container = cUid ? cUid : undefined;

      const data = await this.accountsService.getAccounts(getParams);
      this.dstSettings = {
        displayedColumns: this.displayedColumns,
        dataSource: data,
        entitySchema: this.entitySchemaUnsAccount,
        navigationState: this.navigationState,
        filters: this.filterOptions,
        filterTree: {
          filterMethode: async (parentkey) => {
            return this.accountsService.getFilterTree({
              parentkey,
              container: getParams.container,
              system: getParams.system,
              filter: getParams.filter
            });
          },
          multiSelect: false
        },
        dataModel: this.dataModel,
        identifierForSessionStore: 'accounts'
      };
      this.tableName = data.tableName;
      this.logger.debug(this, `Head at ${data.Data.length + this.navigationState.StartIndex} of ${data.totalCount} item(s)`);
    } finally {
      this.handleCloseLoader();
    }
  }

  private viewAccount(data: AccountSidesheetData): void {
    this.logger.debug(this, `Viewing account`);
    this.logger.trace(this, `Account selected`, data.selectedAccount);
    const sidesheetRef = this.sideSheet.open(AccountSidesheetComponent, {
      title: data.selectedAccount.GetEntity().GetDisplay(),
      headerColour: 'orange',
      padding: '0px',
      width: '60%',
      icon: 'account',
      data
    });
    sidesheetRef.afterClosed().subscribe((dataRefreshRequired) => {
      if (dataRefreshRequired) {
        this.navigate();
      }
    });
  }

  private handleOpenLoader(): void {
    if (!this.busyIndicator) {
      setTimeout(() => (this.busyIndicator = this.busyService.show()));
    }
  }

  private handleCloseLoader(): void {
    if (this.busyIndicator) {
      setTimeout(() => {
        this.busyService.hide(this.busyIndicator);
        this.busyIndicator = undefined;
      });
    }
  }
}
