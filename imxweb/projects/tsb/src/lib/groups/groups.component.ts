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

import { OverlayRef } from '@angular/cdk/overlay';
import { UntypedFormControl } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { EuiLoadingService, EuiSidesheetService } from '@elemental-ui/core';
import { TranslateService } from '@ngx-translate/core';
import { Component, OnInit, Input, OnDestroy, ViewChild } from '@angular/core';
import {
  CollectionLoadParameters,
  IClientProperty,
  DisplayColumns,
  DbObjectKey,
  EntitySchema,
  DataModel,
  FilterData,
  ValType,
} from 'imx-qbm-dbts';
import { ViewConfigData } from 'imx-api-qer';
import {
  EntityWriteDataBulk,
  PortalTargetsystemUnsGroup,
  PortalTargetsystemUnsGroupServiceitem,
  PortalTargetsystemUnsSystem,
} from 'imx-api-tsb';
import {
  BusyService,
  ClassloggerService,
  DataSourceToolbarFilter,
  DataSourceToolbarSettings,
  DataTableComponent,
  SettingsService,
  SideNavigationComponent,
  SnackBarService,
  DataSourceToolbarViewConfig,
  HelpContextualValues,
} from 'qbm';
import { SourceDetectiveSidesheetComponent, SourceDetectiveSidesheetData, SourceDetectiveType, ViewConfigService } from 'qer';
import { Subscription } from 'rxjs';

import { ContainerTreeDatabaseWrapper } from '../container-list/container-tree-database-wrapper';
import { DeHelperService } from '../de-helper.service';
import { GroupSidesheetComponent } from './group-sidesheet/group-sidesheet.component';
import { GetGroupsOptionalParameters, GroupSidesheetData } from './groups.models';
import { GroupsService } from './groups.service';
import { ProductOwnerSidesheetComponent } from './product-owner-sidesheet/product-owner-sidesheet.component';

@Component({
  selector: 'imx-data-explorer-groups',
  templateUrl: './groups.component.html',
  styleUrls: ['./groups.component.scss'],
})
export class DataExplorerGroupsComponent implements OnInit, OnDestroy, SideNavigationComponent {
  @Input() public unsAccountIdFilter: string;
  @Input() public sidesheetWidth = '65%';
  @Input() public applyIssuesFilter = false;
  @Input() public issuesFilterMode: string;
  @Input() public targetSystemData?: PortalTargetsystemUnsSystem[];
  @Input() public isAdmin: boolean;
  @Input() public uidPerson = '';
  @Input() public usedInSidesheet = false;
  @Input() public contextId: HelpContextualValues;

  @ViewChild('dataTable', { static: false }) public dataTable: DataTableComponent<PortalTargetsystemUnsGroup>;
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
  public requestableBulkUpdateCtrl = new UntypedFormControl(true);
  public entitySchemaUnsGroup: EntitySchema;
  public readonly DisplayColumns = DisplayColumns;
  public selectedGroupsForUpdate: PortalTargetsystemUnsGroup[] = [];
  public data: any;

  public busyService = new BusyService();
  private viewConfigPath: string;
  private viewConfig: DataSourceToolbarViewConfig;

  public readonly itemStatus = {
    enabled: (item: PortalTargetsystemUnsGroup): boolean => {
      return item.UID_AccProduct?.value !== '';
    },
  };

  private displayedColumns: IClientProperty[] = [];
  private authorityDataDeleted$: Subscription;

  private dataModel: DataModel;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly sideSheet: EuiSidesheetService,
    private readonly busyServiceElemental: EuiLoadingService,
    private readonly logger: ClassloggerService,
    private readonly groupsService: GroupsService,
    private viewConfigService: ViewConfigService,
    private readonly dataHelper: DeHelperService,
    private readonly translate: TranslateService,
    private readonly snackbar: SnackBarService,
    settingsService: SettingsService
  ) {
    this.isAdmin = this.route.snapshot?.url[0]?.path === 'admin';
    this.navigationState = { PageSize: settingsService.DefaultPageSize, StartIndex: 0 };
    this.entitySchemaUnsGroup = this.groupsService.unsGroupsSchema(this.isAdmin);
    this.authorityDataDeleted$ = this.dataHelper.authorityDataDeleted.subscribe(() => this.navigate());
    this.treeDbWrapper = new ContainerTreeDatabaseWrapper(this.busyService, dataHelper);
  }

  public async ngOnInit(): Promise<void> {
    this.entitySchemaUnsGroup = this.groupsService.unsGroupsSchema(this.isAdmin);

    this.displayedColumns = [
      this.entitySchemaUnsGroup.Columns[DisplayColumns.DISPLAY_PROPERTYNAME],
      this.entitySchemaUnsGroup.Columns.Requestable,
    ];

    if (this.entitySchemaUnsGroup.Columns.XMarkedForDeletion) {
      this.displayedColumns.push(this.entitySchemaUnsGroup.Columns.XMarkedForDeletion);
    }

    if (this.unsAccountIdFilter) {
      this.displayedColumns.push({ ColumnName: 'action', Type: ValType.String });
    }

    const isBusy = this.busyService.beginBusy();

    try {
      this.filterOptions = await this.groupsService.getFilterOptions(this.isAdmin);

      this.dataModel = await this.groupsService.getDataModel(this.isAdmin);
      this.viewConfigPath = this.isAdmin || this.unsAccountIdFilter ? 'targetsystem/uns/group' : 'resp/unsgroup';
      this.viewConfig = await this.viewConfigService.getInitialDSTExtension(this.dataModel, this.viewConfigPath);
    } finally {
      isBusy.endBusy();
    }
    if (this.applyIssuesFilter && !this.issuesFilterMode) {
      const ownerFilter = this.filterOptions.find((f) => {
        return f.Name === 'withowner';
      });

      if (ownerFilter) {
        ownerFilter.InitialValue = '0';
      }
    }

    if (this.applyIssuesFilter && this.issuesFilterMode === 'requestable') {
      const requestableFliter = this.filterOptions.find((f) => {
        return f.Name === 'published';
      });

      if (requestableFliter) {
        requestableFliter.InitialValue = '0';
      }
    }
    await this.navigate();
  }

  public ngOnDestroy(): void {
    if (this.authorityDataDeleted$) {
      this.authorityDataDeleted$.unsubscribe();
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

  public get itemsAreNotRequestable(): boolean {
    return this.selectedGroupsForUpdate.every((elem) => !elem.Requestable.value);
  }

  public get itemsAreRequestable(): boolean {
    return this.selectedGroupsForUpdate.every((elem) => elem.Requestable.value);
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

  public async onGroupChanged(group: PortalTargetsystemUnsGroup): Promise<void> {
    if (this.unsAccountIdFilter) {
      return;
    }

    this.logger.debug(this, `Selected group changed`);
    this.logger.trace(this, `New group selected`, group);

    let data: GroupSidesheetData;
    let busy: OverlayRef;
    const isBusy = this.busyService.beginBusy();

    try {
      const objKey = DbObjectKey.FromXml(group.XObjectKey.value);

      const uidAccProduct = group.UID_AccProduct.value;

      data = {
        uidAccProduct,
        unsGroupDbObjectKey: objKey,
        group: await this.groupsService.getGroupDetailsInteractive(objKey, 'UID_AccProduct'),
        groupServiceItem: await this.groupsService.getGroupServiceItem(uidAccProduct),
        isAdmin: this.isAdmin,
      };
    } finally {
      isBusy.endBusy();
    }

    this.viewGroup(data);
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
    this.navigationState.StartIndex = 0;
    return this.navigate();
  }

  public onGroupSelected(selected: PortalTargetsystemUnsGroup[]): void {
    this.selectedGroupsForUpdate = selected;
  }

  public async viewSource(event: Event, item: PortalTargetsystemUnsGroup): Promise<void> {
    event.stopPropagation();

    const uidPerson = this.uidPerson;
    const objKey = DbObjectKey.FromXml(item.XObjectKey.value);

    const data: SourceDetectiveSidesheetData = {
      UID_Person: uidPerson,
      Type: SourceDetectiveType.MembershipOfSystemEntitlement,
      UID: objKey.Keys[0],
      TableName: objKey.TableName,
    };
    this.sideSheet.open(SourceDetectiveSidesheetComponent, {
      title: await this.translate.get('#LDS#Heading View Assignment Analysis').toPromise(),
      subTitle: item.GetEntity().GetDisplay(),
      padding: '0px',
      width: 'max(600px, 60%)',
      disableClose: false,
      testId: 'system-entitlement-role-membership-details',
      data,
    });
  }

  public async bulkUpdateSelected(request: boolean): Promise<void> {
    const updateData: EntityWriteDataBulk = {
      Keys: [],
      Data: [
        {
          Name: PortalTargetsystemUnsGroupServiceitem.GetEntitySchema().Columns.IsInActive.ColumnName,
          // Inverse value as actual property is 'Not available'
          Value: !request,
        },
      ],
    };
    return this.updateSelectedGroups(updateData);
  }

  public async bulkUpdateOwner(): Promise<void> {
    const selectedOwner = await this.sideSheet
      .open(ProductOwnerSidesheetComponent, {
        title: await this.translate.get('#LDS#Heading Assign Product Owner').toPromise(),
        subTitle: this.selectedGroupsForUpdate.length === 1 ? this.selectedGroupsForUpdate[0].GetEntity().GetDisplay() : '',
        padding: '0px',
        width: `max(650px, ${this.sidesheetWidth})`,
        icon: 'usergroup',
        testId: 'system-entitlements-assign-product-owner',
        data: await this.groupsService.getGroupServiceItem(this.selectedGroupsForUpdate[0].UID_AccProduct.value),
      })
      .afterClosed()
      .toPromise();

    if (selectedOwner) {
      return this.updateOwnerForSelectedGroups(selectedOwner);
    }
  }

  private async updateOwnerForSelectedGroups(selectedOwner: { uidPerson?: string; uidRole?: string }): Promise<void> {
    let confirmMessage = '';
    let busy: OverlayRef;
    try {
      setTimeout(() => (busy = this.busyServiceElemental.show()));
      confirmMessage = await this.groupsService.updateMultipleOwner(
        this.selectedGroupsForUpdate.map((elem) => elem.UID_AccProduct.value),
        selectedOwner
      );
    } finally {
      setTimeout(() => this.busyServiceElemental.hide(busy));
    }

    if (confirmMessage) {
      this.snackbar.open({ key: confirmMessage });
    }
    return this.navigate();
  }

  private async updateSelectedGroups(updateData: EntityWriteDataBulk): Promise<void> {
    this.selectedGroupsForUpdate.forEach((group: PortalTargetsystemUnsGroup) => {
      const serviceItemUid = group?.UID_AccProduct.value;
      if (serviceItemUid?.length) {
        updateData.Keys.push([serviceItemUid]);
      }
    });
    let busy: OverlayRef;

    try {
      setTimeout(() => (busy = this.busyServiceElemental.show()));
      await this.groupsService.bulkUpdateGroupServiceItems(updateData);
      await this.navigate();
      this.dataTable.clearSelection();
      this.requestableBulkUpdateCtrl.setValue(true, { emitEvent: false });
    } finally {
      setTimeout(() => this.busyServiceElemental.hide(busy));
    }
  }

  private async navigate(): Promise<void> {
    const isBusy = this.busyService.beginBusy();

    const getParams: GetGroupsOptionalParameters = this.navigationState;

    try {
      if (this.unsAccountIdFilter) {
        getParams.uid_unsaccount = this.unsAccountIdFilter;
      }

      const data =
        this.isAdmin || this.unsAccountIdFilter // Wenn wir filtern, muss auch der Admin-Endpoint genutzt werden
          ? await this.groupsService.getGroups(getParams)
          : await this.groupsService.getGroupsResp(getParams);

      const exportMethod =
        this.isAdmin || this.unsAccountIdFilter
          ? this.groupsService.exportGroups(getParams)
          : this.groupsService.exportGroupsResp(getParams);
      exportMethod.initialColumns = this.displayedColumns.map((col) => col.ColumnName);

      this.dstSettings = {
        displayedColumns: this.displayedColumns,
        dataSource: data,
        entitySchema: this.entitySchemaUnsGroup,
        navigationState: this.navigationState,
        filters: this.filterOptions,
        filterTree: {
          filterMethode: async (parentkey) => {
            return this.groupsService.getFilterTree({
              parentkey,
              container: getParams.container,
              system: getParams.system,
              uid_unsaccount: getParams.uid_unsaccount,
            });
          },
          multiSelect: false,
        },
        dataModel: this.dataModel,
        viewConfig: this.viewConfig,
        exportMethod,
      };
      this.logger.debug(this, `Head at ${data.Data.length + this.navigationState.StartIndex} of ${data.totalCount} item(s)`);
    } finally {
      isBusy.endBusy();
    }
  }

  private async viewGroup(data: GroupSidesheetData): Promise<void> {
    const sidesheetRef = this.sideSheet.open(GroupSidesheetComponent, {
      title: await this.translate.get('#LDS#Heading Edit System Entitlement').toPromise(),
      subTitle: data.group.GetEntity().GetDisplay(),
      padding: '0px',
      width: `max(650px, ${this.sidesheetWidth})`,
      icon: 'usergroup',
      data,
      testId: 'edit-system-entitlement-sidesheet',
      disableClose: true,
    });
    // After the sidesheet closes, reload the current data to refresh any changes that might have been made
    sidesheetRef.afterClosed().subscribe(() => this.navigate());
  }
}
