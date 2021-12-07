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

import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { EuiLoadingService, EuiSidesheetService } from '@elemental-ui/core';
import { TranslateService } from '@ngx-translate/core';
import { OwnershipInformation } from 'imx-api-qer';
import {
  CollectionLoadParameters,
  DisplayColumns,
  EntitySchema,
  IClientProperty,
  IEntity,
  TypedEntity,
  ValType,
} from 'imx-qbm-dbts';
import {
  AppConfigService,
  ClassloggerService,
  DataSourceToolbarFilter,
  LdsReplacePipe,
  DataSourceToolbarSettings,
  MetadataService,
  SettingsService,
  SearchResultAction
} from 'qbm';
import { IDataExplorerComponent } from '../../data-explorer-view/data-explorer-extension';
import { RoleDetailComponent } from '../role-detail/role-detail.component';
import { RoleService } from '../role.service';
import { TreeDatabaseAdaptorService } from './tree-database-adaptor.service';

@Component({
  selector: 'imx-roles-overview',
  templateUrl: './roles-overview.component.html',
  styleUrls: ['./roles-overview.component.scss'],
})
export class RolesOverviewComponent implements OnInit, IDataExplorerComponent {

  @Input() public data: OwnershipInformation;
  public dstSettings: DataSourceToolbarSettings;
  public navigationState: CollectionLoadParameters = {};
  public ownershipInfo: OwnershipInformation;
  public entitySchema: EntitySchema;
  public DisplayColumns = DisplayColumns;
  public displayColumns: IClientProperty[];
  public isAdmin = false;
  public useTree = false;
  public ValType = ValType;
  public treeDatabase: TreeDatabaseAdaptorService;
  public searchResultAction: SearchResultAction;
  private filterOptions: DataSourceToolbarFilter[] = [];

  constructor(
    private readonly sidesheet: EuiSidesheetService,
    private readonly busyService: EuiLoadingService,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly appConfig: AppConfigService,
    private readonly settings: SettingsService,
    private readonly logger: ClassloggerService,
    private readonly roleService: RoleService,
    private readonly metadataProvider: MetadataService,
    private readonly translate: TranslateService,
    private readonly ldsReplace: LdsReplacePipe,
  ) {
    this.route.params.subscribe(async (params) => {
      this.ownershipInfo = {
        TableName: params.tablename,
        Count: params.count,
      };
    });

    this.searchResultAction = { action: async (entity: IEntity) => { await this.openDetails(entity); } };
  }

  public async ngOnInit(): Promise<void> {

    if (!this.ownershipInfo.TableName || this.ownershipInfo.TableName.length === 0) {
      this.ownershipInfo = this.data;
    }
    try {
      await this.metadataProvider.update([this.ownershipInfo.TableName]);
    } catch (error) {
      this.navigateToStartPage(error);
    }
    const table = this.metadataProvider.tables[this.ownershipInfo.TableName];
    if (!table) {
      this.logger.debug(this, `RolesOverview: Table ${this.ownershipInfo.TableName} does not exists.`);
      this.navigateToStartPage();
      return;
    }

    this.ownershipInfo.TableNameDisplay = table.Display;

    this.treeDatabase = new TreeDatabaseAdaptorService(this.roleService, this.settings, this.busyService, this.ownershipInfo);

    if (!this.roleService.exists(this.ownershipInfo)) {
      return;
    }
    this.isAdmin = this.route.snapshot?.url[0]?.path === 'admin';
    // TODO later: useTree unabhängig vom Tabellennamen bestimmen (z.B. Hierarchy != null,
    // derzeit geht diese Information leider verloren)
    this.useTree = this.isAdmin && this.ownershipInfo.TableName !== 'ESet';

    this.isAdmin = this.route.snapshot?.url[0]?.path === 'admin';

    this.navigationState = {
      // empty string: load first level
      parentKey: ''
    };
    this.entitySchema = this.roleService.getRoleEntitySchema(this.ownershipInfo);
    this.displayColumns = [
      this.entitySchema.Columns[DisplayColumns.DISPLAY_PROPERTYNAME],
      {
        ColumnName: 'details',
        Type: ValType.String,
      },
    ];
    await this.navigate(true);

  }

  public async onNavigationStateChanged(newState?: CollectionLoadParameters): Promise<void> {
    if (newState) {
      this.navigationState = newState;
    }
    await this.navigate(false);
  }

  public async onSearch(keywords: string): Promise<void> {
    this.logger.debug(this, `Searching for: ${keywords}`);
    this.navigationState.StartIndex = 0;
    this.navigationState.search = keywords;
    await this.navigate(true);
  }

  public async showDetails(item: TypedEntity): Promise<void> {
    await this.openDetails(item.GetEntity());
  }

  public async onNodeSelected(node: IEntity): Promise<void> {
    await this.openDetails(node);
  }

  private navigateToStartPage(error?: any): void {
    this.logger.error(this, error);
    this.router.navigate([this.appConfig.Config.routeConfig.start], { queryParams: {} });
  }

  private async openDetails(item: IEntity): Promise<void> {
    const table = this.metadataProvider.tables[this.ownershipInfo.TableName];

    const sidesheetRef = this.sidesheet.open(RoleDetailComponent, {
      title: this.ldsReplace.transform(await this.translate.get('#LDS#Heading Edit {0}').toPromise(),
        table.DisplaySingular),
      headerColour: 'blue',
      padding: '0px',
      width: '900px',
      disableClose: true,
      testId: 'role-detail-sidesheet',
      data: {
        entity: item,
        isAdmin: this.isAdmin,
        ownershipInfo: this.ownershipInfo,
        editableFields: await this.roleService.getEditableFields(this.ownershipInfo.TableName, item),
      },
    });

    sidesheetRef.afterClosed().subscribe(async (result) => {
      await this.navigate(true);
    });
  }

  private async navigate(withFilter: boolean): Promise<void> {
    this.busyService.show();
    try {
      if (withFilter) {
        this.filterOptions = (await this.roleService.getDataModel(this.ownershipInfo, this.isAdmin))?.Filters;
      }
      this.useTree ? await this.navigateInTree() : await this.navigateWithTable();
    } finally {
      this.busyService.hide();
    }
  }

  private async navigateInTree(): Promise<void> {
    await this.treeDatabase.prepare(
      this.roleService.getRoleEntitySchema(this.ownershipInfo),
      this.roleService.getType(this.ownershipInfo, true),
      { StartIndex: 0, PageSize: this.settings.DefaultPageSize });
  }

  private async navigateWithTable(): Promise<void> {
    this.dstSettings = {
      dataSource: await this.roleService.get(this.ownershipInfo, this.isAdmin, this.navigationState),
      entitySchema: this.entitySchema,
      navigationState: this.navigationState,
      displayedColumns: this.displayColumns,
      filters: this.filterOptions
    };
  }
}
