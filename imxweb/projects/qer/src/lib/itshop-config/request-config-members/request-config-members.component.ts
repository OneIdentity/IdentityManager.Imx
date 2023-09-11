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

import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { MatButtonToggleChange } from '@angular/material/button-toggle';
import { EuiSidesheetService } from '@elemental-ui/core';
import { TranslateService } from '@ngx-translate/core';

import { PortalRolesExclusions, PortalShopConfigMembers } from 'imx-api-qer';
import {
  CollectionLoadParameters,
  EntitySchema,
  IClientProperty,
  TypedEntity,
  TypedEntityCollectionData,
  ValType,
} from 'imx-qbm-dbts';

import {
  DataSourceToolbarSettings,
  DataSourceToolbarFilter,
  ClassloggerService,
  DataTableComponent,
  HELPER_ALERT_KEY_PREFIX,
  StorageService,
  SettingsService,
  HELP_CONTEXTUAL,
  BaseCdr,
  EntityService,
  ConfirmationService,
} from 'qbm';
import { ACTION_DISMISS, RequestsService } from '../requests.service';
import { MemberSelectorComponent } from './member-selector/member-selector.component';
import { JustificationType } from '../../justification/justification-type.enum';
import { JustificationService } from '../../justification/justification.service';
import { ReasonSidesheetComponent } from './reason-sidesheet/reason-sidesheet.component';


const helperAlertKey = `${HELPER_ALERT_KEY_PREFIX}_requestShopAccess`;

@Component({
  selector: 'imx-request-config-members',
  templateUrl: './request-config-members.component.html',
  styleUrls: ['../request-config-sidesheet-common.scss', './request-config-members.component.scss'],
})
export class RequestConfigMembersComponent implements OnInit {
  @Input() public customerNodeId: string;
  @Input() public requestDynamicGroup: string;
  @Input() public shopDisplay = '';
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
  public accessContextIds = HELP_CONTEXTUAL.ConfigurationRequestsAccess;

  public readonly itemStatus = {
    enabled: (item: PortalShopConfigMembers): boolean => {
      return item.XOrigin?.value !== 4;
    },
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
    private translate: TranslateService,
    private readonly sidesheet: EuiSidesheetService,
    private readonly justificationService: JustificationService,
    private readonly entityService: EntityService,
    private readonly confirmation: ConfirmationService,
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
    this.displayedColumns = [this.entitySchemaShopConfigMembers.Columns.UID_Person, this.entitySchemaShopConfigMembers.Columns.XOrigin];
    this.displayedColumnsExcluded = [
      this.entitySchemaShopConfigExcludedMembers.Columns.UID_Person,
      this.entitySchemaShopConfigExcludedMembers.Columns.Description,
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

  public async openMemberSelector(): Promise<void> {
    const newMember = this.requestsService.generateRequestConfigMemberEntity(this.customerNodeId);
    const property = this.entitySchemaShopConfigMembers.Columns.UID_Person;
    const entity = newMember.GetEntity();
    const fk = entity.GetFkCandidateProvider().getProviderItem(property.FkRelation.ParentColumnName, property.FkRelation.ParentTableName);

    const dialogRef = this.sidesheet.open(MemberSelectorComponent, {
      title: await this.translate.get('#LDS#Heading Add Members').toPromise(),
      subTitle: this.shopDisplay,
      padding: '0px',
      width: 'max(55%,550px)',
      testId: 'request-config-members-add-membership',
      data: {
        get: (parameters) => fk.load(entity, parameters),
        GetFilterTree: (parentkey) => fk.getFilterTree(entity, parentkey),
        isMultiValue: true,
      },
    });
    dialogRef.afterClosed().subscribe((selectedValues: string[]) => {
      if (selectedValues) {
        this.processMemberSelections(selectedValues);
      }
    });
  }

  /**
   * In case of a Dynamic Role origined member, it opens a sidesheet, where the user can enter a reason, why the user would like to remove the selected members and removes it.
   * In case of a Direct assignment origined member, it lets the user exclude the member without a reason.
   */
  public async removeMembers(): Promise<void> {
    let reason;
    if (this.managedByDynamicGroupSelected) {
      reason = await this.giveReason();
      if (reason === undefined) return;
    }
    if (await this.confirmation.confirmDelete('#LDS#Heading Exclude Members', '#LDS#Are you sure you want to exclude the selected members?')) {
      try {
        this.requestsService.handleOpenLoader();
        await this.requestsService.removeRequestConfigMembers(
          this.customerNodeId,
          this.requestDynamicGroup,
          this.selectedMembers,
          reason.standard.DisplayValue + " - " + reason.freetext
        );
        await this.navigate();
        // Remove any remaining items in memory that haven't yet been processed by backend
        const data = this.removeSelectionsInMemory(this.selectedMembers, this.dstSettings.dataSource.Data);
        this.dstSettings.dataSource.Data = data;
        await this.navigate(this.dstSettings.dataSource);
        if (this.managedByDynamicGroupSelected) {
          // If adding an exclusion
          this.requestsService.openSnackbar(this.requestsService.LdsMembersRemoved, ACTION_DISMISS);
        }
        // Reset table selections (removing references to now deleted members)
        this.dataTable.clearSelection();
      } finally {
        this.requestsService.handleCloseLoader();
      }
    };
  }

  /**
   * Opens the sidesheet, where the user can give the reason, why the member(s) should be excluded
   * @returns The user's reason
   */
  public async giveReason(): Promise<{ standard: string; freetext: string }> {
    const justification = await this.justificationService.createCdr(JustificationType.deny);
    const actionParameters = {
      justification,
      reason: this.createCdrReason(justification ? '#LDS#Additional comments about your decision' : undefined),
    };

    const sidesheetRef = this.sidesheet.open(ReasonSidesheetComponent, {
      title: await this.translate.get('#LDS#Heading Exclude Members').toPromise(),
      subTitle: this.shopDisplay,
      padding: '0px',
      width: 'max(55%,550px)',
      testId: 'request-config-members-remove-membership',
      data: {
        actionParameters
      }
    });

    const reason = await sidesheetRef.afterClosed().toPromise();
    return reason;
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
      this.requestsService.openSnackbar(this.requestsService.LdsMembersAdded, ACTION_DISMISS);
      // Reset table selections (removing references to now deleted members)
      this.dataTableExclusions.clearSelection();
    } finally {
      this.requestsService.handleCloseLoader();
    }
  }

  private createCdrReason(display?: string): BaseCdr {
    const column = this.entityService.createLocalEntityColumn({
      ColumnName: 'ReasonHead',
      Type: ValType.Text,
      IsMultiLine: true,
    });

    return new BaseCdr(column, display || '#LDS#Reason for your decision');
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
