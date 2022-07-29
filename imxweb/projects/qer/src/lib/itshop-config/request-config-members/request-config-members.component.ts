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

import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { MatButtonToggleChange } from '@angular/material/button-toggle';
import { MatDialog } from '@angular/material/dialog';
import { PortalRolesExclusions, PortalShopConfigMembers } from 'imx-api-qer';
import { CollectionLoadParameters, EntitySchema, IClientProperty, TypedEntity, TypedEntityCollectionData } from 'imx-qbm-dbts';
import {
  DataSourceToolbarSettings,
  DataSourceToolbarFilter,
  ClassloggerService,
  DataTableComponent,
  HELPER_ALERT_KEY_PREFIX,
  StorageService,
  SettingsService
} from 'qbm';
import { DynamicExclusionDialogComponent } from '../../dynamic-exclusion-dialog/dynamic-exclusion-dialog.component';
import { ACTION_DISMISS, RequestsService } from '../requests.service';
import { MemberSelectorComponent } from './member-selector.component';

const helperAlertKey = `${HELPER_ALERT_KEY_PREFIX}_requestShopAccess`;

@Component({
  selector: 'imx-request-config-members',
  templateUrl: './request-config-members.component.html',
  styleUrls: ['../request-config-common.scss', './request-config-members.component.scss']
})
export class RequestConfigMembersComponent implements OnInit {

  @Input() public customerNodeId: string;
  @Input() public requestDynamicGroup: string;
  @Output() public memberCountUpdated = new EventEmitter<number>();
  @ViewChild('dataTable', { static: false }) public dataTable: DataTableComponent<PortalShopConfigMembers>;
  @ViewChild('dataTableExclusions', { static: false }) public dataTableExclusions: DataTableComponent<PortalRolesExclusions>;

  public dstSettings: DataSourceToolbarSettings;
  public dstSettingsExcludedMembers: DataSourceToolbarSettings;
  public navigationState: CollectionLoadParameters;
  public navigationStateExcludedMembers: CollectionLoadParameters;
  public filterOptions: DataSourceToolbarFilter[] = [];
  public selectedMembers: PortalShopConfigMembers[] = [];
  public selectedExclusions: PortalRolesExclusions[] = [];

  public readonly itemStatus = {
    enabled: (item: PortalShopConfigMembers): boolean => {
      return item.XOrigin?.value !== 4;
    }
  };

  private readonly entitySchemaShopConfigMembers: EntitySchema;
  private readonly entitySchemaShopConfigExcludedMembers: EntitySchema;
  private readonly defaultPageSize: number;
  private displayedColumns: IClientProperty[] = [];
  private displayedColumnsExcluded: IClientProperty[] = [];
  private selectedMemberView = 'members';

  constructor(
    private readonly logger: ClassloggerService,
    public readonly requestsService: RequestsService,
    private readonly storageService: StorageService,
    settingsService: SettingsService,
    private readonly matDialog: MatDialog,
  ) {
    this.defaultPageSize = settingsService.DefaultPageSize;
    this.entitySchemaShopConfigMembers = this.requestsService.shopConfigMembersSchema;
    this.entitySchemaShopConfigExcludedMembers = this.requestsService.shopConfigExcludedMembersSchema;
    this.navigationState = { PageSize: this.defaultPageSize, StartIndex: 0 };
    this.navigationStateExcludedMembers = { PageSize: this.defaultPageSize, StartIndex: 0 };
  }

  get isMobile(): boolean {
    return document.body.offsetWidth <= 768;
  }

  get showHelperAlert(): boolean {
    return !this.storageService.isHelperAlertDismissed(helperAlertKey);
  }

  get managedByDynamicGroup(): boolean {
    return !!this.requestDynamicGroup?.length;
  }

  get managedByDynamicGroupSelected(): boolean {
    let result = false;
    const selection = this.selectedMembers.find((member) => {
      // tslint:disable-next-line:no-bitwise
      return (member.XOrigin?.value & 4) > 0;
    });
    result = !!selection;
    return result;
  }

  get membershipViewMode(): string {
    return this.selectedMemberView;
  }

  public async ngOnInit(): Promise<void> {
    this.displayedColumns = [
      this.entitySchemaShopConfigMembers.Columns.UID_Person,
      this.entitySchemaShopConfigMembers.Columns.XOrigin
    ];
    this.displayedColumnsExcluded = [
      this.entitySchemaShopConfigExcludedMembers.Columns.UID_Person,
      this.entitySchemaShopConfigExcludedMembers.Columns.Description
    ];
    await this.navigate();
    if (this.managedByDynamicGroup) {
      await this.navigateExcludedMembers();
    }
  }

  public async onToggleChanged(change: MatButtonToggleChange): Promise<void> {
    this.selectedMemberView = change.value;
    switch (change.value) {
      case 'members':
        await this.navigate();
        break;
      case 'exclusions':
        await this.navigateExcludedMembers();
        break;
    }
  }

  public async onSearch(keywords: string): Promise<void> {
    this.logger.debug(this, `Searching for: ${keywords}`);
    this.navigationState.StartIndex = 0;
    this.navigationState.search = keywords;
    await this.navigate();
  }

  public async onSearchExcluded(keywords: string): Promise<void> {
    this.logger.debug(this, `Searching for: ${keywords}`);
    this.navigationStateExcludedMembers.StartIndex = 0;
    this.navigationStateExcludedMembers.search = keywords;
    await this.navigateExcludedMembers();
  }

  public onMemberSelected(selected: PortalShopConfigMembers[]): void {
    this.logger.debug(this, `Selected shop members changed`);
    this.logger.trace(`New shop member selections`, selected);
    this.selectedMembers = selected;
  }

  public onExcusionSelected(selected: PortalRolesExclusions[]): void {
    this.selectedExclusions = selected;
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

  public async onNavigationStateExcludedChanged(newState?: CollectionLoadParameters): Promise<void> {
    if (newState) {
      this.navigationStateExcludedMembers = newState;
    }
    await this.navigateExcludedMembers();
  }

  public openMemberSelector(): void {
    const newMember = this.requestsService.generateRequestConfigMemberEntity(this.customerNodeId);
    const property = this.entitySchemaShopConfigMembers.Columns.UID_Person;
    const entity = newMember.GetEntity();
    const fk = entity.GetFkCandidateProvider()
      .getProviderItem(property.FkRelation.ParentColumnName, property.FkRelation.ParentTableName);

    const dialogRef = this.matDialog.open(MemberSelectorComponent, {
      width: this.isMobile ? '90vw' : '60vw',
      maxWidth: this.isMobile ? '90vw' : '80vw',
      minHeight: '60vh',
      data: {
        get: parameters => fk.load(entity, parameters),
        GetFilterTree: parentkey => fk.getFilterTree(entity, parentkey),
        isMultiValue: true
      }
    });
    dialogRef.afterClosed().subscribe((selectedValues: string[]) => {
      if (selectedValues) {
        this.processMemberSelections(selectedValues);
      }
    });
  }


  public async removeMembers(): Promise<void> {
    let reasonForExclusion = '';
    if (this.managedByDynamicGroupSelected) {
      const dialogRef = this.matDialog.open(DynamicExclusionDialogComponent, {
        width: '500px',
      });
      const reason = await dialogRef.afterClosed().toPromise();
      if (reason === undefined) {
        // Handle the cancel case from dialog
        return;
      }
      reasonForExclusion = reason;
    }
    try {
      this.requestsService.handleOpenLoader();
      await this.requestsService.removeRequestConfigMembers(
        this.customerNodeId, this.requestDynamicGroup, this.selectedMembers, reasonForExclusion
      );
      await this.navigate();
      // Remove any remaining items in memory that haven't yet been processed by backend
      const data = this.removeSelectionsInMemory(this.selectedMembers, this.dstSettings.dataSource.Data);
      this.dstSettings.dataSource.Data = data;
      await this.navigate(this.dstSettings.dataSource);
      if (this.managedByDynamicGroupSelected) {
        // If adding an exclusion
        this.requestsService.openSnackbar(
          this.requestsService.LdsMembersRemoved, ACTION_DISMISS
        );
      }
      // Reset table selections (removing references to now deleted members)
      this.dataTable.clearSelection();
    } finally {
      this.requestsService.handleCloseLoader();
    }
  }

  public async removeExclusions(): Promise<void> {
    this.requestsService.handleOpenLoader();
    try {
      await this.requestsService.removeRequestConfigMemberExclusions(this.requestDynamicGroup, this.selectedExclusions);
      await this.navigateExcludedMembers();
      // Remove any remaining items in memory that haven't yet been processed by backend
      const data = this.removeSelectionsInMemory(this.selectedExclusions, this.dstSettingsExcludedMembers.dataSource.Data);
      this.dstSettingsExcludedMembers.dataSource.Data = data;
      await this.navigateExcludedMembers(this.dstSettingsExcludedMembers.dataSource);
      this.requestsService.openSnackbar(
        this.requestsService.LdsMembersAdded, ACTION_DISMISS
      );
      // Reset table selections (removing references to now deleted members)
      this.dataTableExclusions.clearSelection();
    } finally {
      this.requestsService.handleCloseLoader();
    }
  }

  public onHelperDismissed(): void {
    this.storageService.storeHelperAlertDismissal(helperAlertKey);
  }

  public clearData(): void {
    this.dstSettingsExcludedMembers.dataSource.Data = [];
  }

  public clearMembers(): void {
    this.dstSettings.dataSource.Data = [];
  }

  private removeSelectionsInMemory(selectedItems: any[], dataItems: any[]): any[] {
    const idsToRemove: string[] = [];
    selectedItems.forEach((member: any) => {
      idsToRemove.push(member.UID_Person.value);
    });
    const filteredData = dataItems.filter((item: any) => {
      return idsToRemove.indexOf(item.UID_Person.value) === -1;
    });
    return filteredData;
  }

  private async processMemberSelections(values: string[]): Promise<void> {
    this.requestsService.handleOpenLoader();
    try {
      await this.requestsService.addMultipleRequestConfigMembers(values, this.customerNodeId);
      this.requestsService.openSnackbar(this.requestsService.LdsMembersUpdated, ACTION_DISMISS);
      await this.navigate();
    } finally {
      this.requestsService.handleCloseLoader();
    }
  }

  private async navigate(data?: TypedEntityCollectionData<TypedEntity>): Promise<void> {
    this.requestsService.handleOpenLoader();
    const getParams: any = this.navigationState;
    try {
      if (!data) {
        data = await this.requestsService.getRequestConfigMembers(this.customerNodeId, getParams);
      }
      // Notify caller of new count, but only when a search is not applied
      if (!this.navigationState?.search || this.navigationState?.search === '') {
        this.memberCountUpdated.emit(data.totalCount);
      }
      this.dstSettings = {
        displayedColumns: this.displayedColumns,
        dataSource: data,
        entitySchema: this.entitySchemaShopConfigMembers,
        navigationState: this.navigationState,
        filters: this.filterOptions,
      };
      this.logger.debug(this, `Head at ${data.Data.length + this.navigationState.StartIndex} of ${data.totalCount} item(s)`);
    } finally {
      this.requestsService.handleCloseLoader();
    }
  }

  private async navigateExcludedMembers(data?: TypedEntityCollectionData<TypedEntity>): Promise<void> {
    this.requestsService.handleOpenLoader();
    try {
      if (!data) {
        data = await this.requestsService.getExcludedRequestConfigMembers(this.requestDynamicGroup, this.navigationStateExcludedMembers);
      }
      this.dstSettingsExcludedMembers = {
        displayedColumns: this.displayedColumnsExcluded,
        dataSource: data,
        entitySchema: this.entitySchemaShopConfigExcludedMembers,
        navigationState: this.navigationStateExcludedMembers,
        filters: this.filterOptions,
      };
    } finally {
      this.requestsService.handleCloseLoader();
    }
  }
}
