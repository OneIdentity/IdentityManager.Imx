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

import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { EuiLoadingService, EuiSidesheetService } from '@elemental-ui/core';
import { TranslateService } from '@ngx-translate/core';
import { OwnershipInformation } from 'imx-api-qer';
import {
  CollectionLoadParameters,
  DataModel,
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
  SettingsService
} from 'qbm';
import { IDataExplorerComponent } from '../../data-explorer-view/data-explorer-extension';
import { DataManagementService } from '../data-management.service';
import { IRoleRestoreHandler } from '../restore/restore-handler';
import { RestoreComponent } from '../restore/restore.component';
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
  public filterOptions: DataSourceToolbarFilter[] = [];

  private dataModel: DataModel;

  constructor(
    private readonly sidesheet: EuiSidesheetService,
    private readonly busyService: EuiLoadingService,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly appConfig: AppConfigService,
    private readonly settings: SettingsService,
    private readonly logger: ClassloggerService,
    private readonly roleService: RoleService,
    private dataManagementService: DataManagementService,
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

    const type = this.roleService.getType(this.ownershipInfo.TableName, true);

    this.treeDatabase = new TreeDatabaseAdaptorService(this.roleService, this.settings, this.busyService, this.ownershipInfo, type);

    if (!this.roleService.exists(this.ownershipInfo.TableName)) {
      return;
    }
    this.isAdmin = this.route.snapshot?.url[0]?.path === 'admin';
    setTimeout(() => { this.busyService.show(); });
    try {
      this.useTree = this.isAdmin && (await this.roleService.getEntitiesForTree(this.ownershipInfo.TableName, { PageSize: -1 })).Hierarchy != null;
    } finally {
      setTimeout(() => { this.busyService.hide(); });
    }
    this.navigationState = this.useTree ? {
      // empty string: load first level
      ParentKey: ''
    } : {};
    this.entitySchema = this.roleService.getRoleEntitySchema(this.ownershipInfo.TableName);
    this.displayColumns = [
      this.entitySchema.Columns[DisplayColumns.DISPLAY_PROPERTYNAME],
      {
        ColumnName: 'details',
        Type: ValType.String,
      },
    ];

    setTimeout(() => { this.busyService.show(); });
    try {
      this.dataModel = await this.roleService.getDataModel(this.ownershipInfo.TableName, this.isAdmin)
      this.filterOptions = this.dataModel?.Filters;
    } finally {
      setTimeout(() => { this.busyService.hide(); });
    }
    await this.navigate();

  }

  public async onNavigationStateChanged(newState?: CollectionLoadParameters): Promise<void> {
    if (newState) {
      this.navigationState = newState;
    }
    await this.navigate();
  }

  public async onSearch(keywords: string): Promise<void> {
    this.logger.debug(this, `Searching for: ${keywords}`);
    this.navigationState.StartIndex = 0;
    this.navigationState.search = keywords;
    await this.navigate();
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
    this.busyService.show();
    try {
      // Grab the interactive entity and store it in the service
      this.roleService.setSidesheetData({
        ownershipInfo: this.ownershipInfo,
        entity: item,
        isAdmin: this.isAdmin
      });
      await this.dataManagementService.setInteractive();
    } finally {
      this.busyService.hide();
    }
    const table = this.metadataProvider.tables[this.ownershipInfo.TableName];
    const result = await this.sidesheet.open(RoleDetailComponent, {
      title: this.ldsReplace.transform(await this.translate.get('#LDS#Heading Edit {0}').toPromise(),
        table.DisplaySingular),
      headerColour: 'blue',
      padding: '0px',
      width: 'max(768px, 80%)',
      disableClose: true,
      testId: 'role-detail-sidesheet'
    }).afterClosed().toPromise();

    if (result) {
      await this.navigate();
    };
  }

  private async navigate(): Promise<void> {
    this.busyService.show();
    try {
      this.useTree ? await this.navigateInTree() : await this.navigateWithTable();
    } finally {
      this.busyService.hide();
    }
  }

  private async navigateInTree(): Promise<void> {
    await this.treeDatabase.prepare(
      this.roleService.getRoleEntitySchema(this.ownershipInfo.TableName));
  }

  private async navigateWithTable(): Promise<void> {

    this.dstSettings = {
      dataSource: await this.roleService.get(this.ownershipInfo.TableName, this.isAdmin, this.navigationState),
      entitySchema: this.entitySchema,
      navigationState: this.navigationState,
      displayedColumns: this.displayColumns,
      filters: this.filterOptions,
      dataModel: this.dataModel
    };
  }

  public get restoreHandler(): IRoleRestoreHandler {
    return this.roleService.targetMap.get(this.ownershipInfo.TableName)?.restore;
  }

  public async restoreDeletedRole(): Promise<void> {
    const restoreHandler = this.restoreHandler;
    const context = this.isAdmin ? restoreHandler.asAdmin() : restoreHandler.asOwner();

    const sidesheetRef = this.sidesheet.open(RestoreComponent, {
      title: await this.translate.get('#LDS#Heading Restore a Deleted Role').toPromise(),
      headerColour: 'blue',
      padding: '0px',
      width: 'max(768px, 80%)',
      testId: 'role-restore-sidesheet',
      data: {
        isAdmin: this.isAdmin,
        restore: context
      },
    });

    sidesheetRef.afterClosed().subscribe(async (result) => {
      await this.navigate();
    });
  }
}
