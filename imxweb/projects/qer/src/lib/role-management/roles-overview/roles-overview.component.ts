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

import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { EuiLoadingService, EuiSidesheetService } from '@elemental-ui/core';
import { TranslateService } from '@ngx-translate/core';
import { OwnershipInformation, ViewConfigData } from 'imx-api-qer';
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
  BusyService,
  CdrFactoryService,
  ClassloggerService,
  DataSourceToolbarFilter,
  DataSourceToolbarSettings,
  MetadataService,
  SettingsService,
  SideNavigationComponent,
  DataSourceToolbarViewConfig,
  DataSourceToolbarExportMethod,
  ErrorService,
  HelpContextualValues,
} from 'qbm';
import { QerPermissionsService } from '../../admin/qer-permissions.service';
import { DataManagementService } from '../data-management.service';
import { NewRoleComponent } from '../new-role/new-role.component';
import { IRoleRestoreHandler } from '../restore/restore-handler';
import { RestoreComponent } from '../restore/restore.component';
import { RoleDetailComponent } from '../role-detail/role-detail.component';
import { RoleService } from '../role.service';
import { TreeDatabaseAdaptorService } from './tree-database-adaptor.service';
import { ViewConfigService } from '../../view-config/view-config.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'imx-roles-overview',
  templateUrl: './roles-overview.component.html',
  styleUrls: ['./roles-overview.component.scss'],
})
export class RolesOverviewComponent implements OnInit, OnDestroy, SideNavigationComponent {
  @Input() public data: OwnershipInformation;
  @Input() public contextId: HelpContextualValues;
  public dstSettings: DataSourceToolbarSettings;
  public navigationState: CollectionLoadParameters = {};
  public ownershipInfo: OwnershipInformation;
  public entitySchema: EntitySchema;
  public DisplayColumns = DisplayColumns;
  public displayColumns: IClientProperty[];
  public isAdmin = false;
  public viewConfig: DataSourceToolbarViewConfig;
  public viewConfigPath: string;
  public useTree = false;
  public ValType = ValType;
  public treeDatabase: TreeDatabaseAdaptorService;
  public filterOptions: DataSourceToolbarFilter[] = [];
  public hasHierarchy = false;
  public canCreate: boolean;
  public busyService = new BusyService();

  private isStructureAdmin: boolean;
  private dataModel: DataModel;
  private exportMethod: DataSourceToolbarExportMethod;
  private subscription: Subscription;

  private disposable: () => void;

  constructor(
    private readonly sidesheet: EuiSidesheetService,
    private readonly busyServiceElemental: EuiLoadingService,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly appConfig: AppConfigService,
    private readonly settings: SettingsService,
    private readonly logger: ClassloggerService,
    private readonly roleService: RoleService,
    private viewConfigService: ViewConfigService,
    private dataManagementService: DataManagementService,
    private readonly metadataProvider: MetadataService,
    private readonly translate: TranslateService,
    private readonly permission: QerPermissionsService,
    private readonly errorService: ErrorService
  ) {}

  public ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  public async ngOnInit(): Promise<void> {
    this.ownershipInfo = this.data;
    this.useTree = this.roleService.hasHierarchy(this.ownershipInfo.TableName, this.isAdmin);

    try {
      await this.metadataProvider.update([this.ownershipInfo.TableName]);
      this.isStructureAdmin = await this.permission.isStructAdmin();
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

    this.treeDatabase = new TreeDatabaseAdaptorService(this.roleService, this.settings, this.ownershipInfo, this.busyService, type);
    await this.treeDatabase.prepare(this.roleService.getRoleEntitySchema(this.ownershipInfo.TableName), false);

    if (!this.roleService.exists(this.ownershipInfo.TableName)) {
      return;
    }
    this.isAdmin = this.route.snapshot?.url[0]?.path === 'admin';
    this.roleService.isAdmin = this.isAdmin;

    this.viewConfigPath = (this.isAdmin ? 'admin/role/' : 'role/') + this.ownershipInfo.TableName.toLowerCase();
    const isBusy = this.busyService.beginBusy();
    this.hasHierarchy = (await this.roleService.getEntitiesForTree(this.ownershipInfo.TableName, { PageSize: -1 }))?.Hierarchy != null;
    this.useTree = this.isAdmin && this.hasHierarchy;
    this.canCreate =
      ((this.isAdmin && this.isStructureAdmin) || !this.isAdmin) && this.roleService.canCreate(this.ownershipInfo.TableName, this.isAdmin);

    this.navigationState = this.useTree
      ? {
          // empty string: load first level
          ParentKey: '',
        }
      : {};
    this.entitySchema = this.roleService.getRoleEntitySchema(this.ownershipInfo.TableName);
    this.displayColumns = [this.entitySchema?.Columns[DisplayColumns.DISPLAY_PROPERTYNAME]];
    if (this.hasHierarchy && this.canCreate) {
      this.displayColumns.push({ ColumnName: 'actions', Type: ValType.String });
    }

    try {
      this.dataModel = await this.roleService.getDataModel(this.ownershipInfo.TableName, this.isAdmin);
      this.viewConfig = await this.viewConfigService.getInitialDSTExtension(this.dataModel, this.viewConfigPath);
      this.filterOptions = this.dataModel?.Filters;
    } finally {
      isBusy.endBusy();
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

  public get restoreHandler(): IRoleRestoreHandler {
    return !this.isStructureAdmin && this.isAdmin ? null : this.roleService.targetMap.get(this.ownershipInfo.TableName)?.restore;
  }

  public async restoreDeletedRole(): Promise<void> {
    const restoreHandler = this.restoreHandler;
    const context = this.isAdmin ? restoreHandler.asAdmin() : restoreHandler.asOwner();

    const sidesheetRef = this.sidesheet.open(RestoreComponent, {
      title: await this.translate.get('#LDS#Heading Restore Deleted Object').toPromise(),
      padding: '0px',
      width: 'max(768px, 80%)',
      testId: `${this.ownershipInfo.TableName}-role-restore-sidesheet`,
      data: {
        isAdmin: this.isAdmin,
        restore: context,
      },
    });

    sidesheetRef.afterClosed().subscribe(async (result) => {
      await this.navigate();
    });
  }

  public async createNew(event: Event, entity?: IEntity): Promise<void> {
    event.stopPropagation();
    const over = this.busyServiceElemental.show();
    let newEntity = null;

    try {
      newEntity = await this.roleService.getInteractiveNew(this.ownershipInfo.TableName);
      if (entity != null) {
        const column = CdrFactoryService.tryGetColumn(newEntity.GetEntity(), `UID_Parent${this.ownershipInfo.TableName}`);
        if (column) {
          await column.PutValue(entity.GetKeys()[0]);
        }
      }
    } finally {
      this.busyServiceElemental.hide(over);
    }

    if (newEntity == null) {
      return;
    }

    this.disposable = this.errorService.setTarget('sidesheet');
    const sidesheetRef = this.sidesheet.open(NewRoleComponent, {
      title: await this.translate
        .get(this.roleService.getRoleTranslateKeys(this.ownershipInfo.TableName)?.createHeading ?? '#LDS#Heading Create Object')
        .toPromise(),
      padding: '0px',
      width: 'max(500px, 50%)',
      disableClose: true,
      testId: 'role-create-sidesheet',
      data: {
        typedEntity: newEntity,
        info: this.ownershipInfo,
        isAdmin: this.isAdmin,
        parentDepartmentUid: entity?.GetKeys()[0],
      },
    });

    sidesheetRef.afterClosed().subscribe(async (result) => {
      this.disposable();
      if (result) {
        await this.navigate();
      }
    });
  }

  public getCreationText(): string {
    return this.roleService.getRoleTranslateKeys(this.ownershipInfo.TableName)?.create ?? '#LDS#Create object';
  }

  public getChildCreationText(): string {
    return this.roleService.getRoleTranslateKeys(this.ownershipInfo.TableName)?.createChild ?? '#LDS#Create child object';
  }

  private navigateToStartPage(error?: any): void {
    this.logger.error(this, error);
    this.router.navigate([this.appConfig.Config.routeConfig.start], { queryParams: {} });
  }

  private async openDetails(item: IEntity): Promise<void> {
    this.busyServiceElemental.show();
    try {
      // Grab the interactive entity and store it in the service
      this.roleService.setSidesheetData({
        ownershipInfo: this.ownershipInfo,
        entity: item,
        isAdmin: this.isAdmin,
        canEdit: !this.isAdmin || (this.isAdmin && this.isStructureAdmin),
      });
      await this.dataManagementService.setInteractive();
    } finally {
      this.busyServiceElemental.hide();
    }
    const result = await this.sidesheet
      .open(RoleDetailComponent, {
        title: await this.translate
          .get(this.roleService.getRoleTranslateKeys(this.ownershipInfo.TableName)?.editHeading ?? '#LDS#Heading Edit Object')
          .toPromise(),

        subTitle: item.GetDisplay(),
        padding: '0px',
        width: 'max(768px, 80%)',
        disableClose: true,
        testId: `${this.ownershipInfo.TableName}-role-detail-sidesheet`,
      })
      .afterClosed()
      .toPromise();

    if (result) {
      await this.navigate();
    }
  }

  private async navigate(): Promise<void> {
    const isBusy = this.busyService.beginBusy();
    try {
      this.useTree ? await this.navigateInTree() : await this.navigateWithTable();
    } finally {
      isBusy.endBusy();
    }
  }

  private async navigateInTree(): Promise<void> {
    await this.treeDatabase.prepare(this.roleService.getRoleEntitySchema(this.ownershipInfo.TableName), true);
  }

  private async navigateWithTable(): Promise<void> {
    if (this.dataModel) {
      this.exportMethod = this.roleService.getExportMethod(this.ownershipInfo.TableName, this.isAdmin, this.navigationState);
    }
    if (this.exportMethod) {
      this.exportMethod.initialColumns = this.displayColumns.map((col) => col.ColumnName);
    }
    this.dstSettings = {
      dataSource: await this.roleService.get(this.ownershipInfo.TableName, this.isAdmin, this.navigationState),
      entitySchema: this.entitySchema,
      navigationState: this.navigationState,
      displayedColumns: this.displayColumns,
      filters: this.filterOptions,
      dataModel: this.dataModel,
      viewConfig: this.viewConfig,
      exportMethod: this.exportMethod,
    };
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
}
