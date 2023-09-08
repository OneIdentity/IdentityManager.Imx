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
import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { UntypedFormControl } from '@angular/forms';
import { MatButtonToggleChange } from '@angular/material/button-toggle';
import { EuiLoadingService, EuiSidesheetService } from '@elemental-ui/core';
import { TranslateService } from '@ngx-translate/core';

import { 
  PortalTargetsystemUnsDirectmembers, 
  PortalTargetsystemUnsGroupServiceitem, 
  PortalTargetsystemUnsNestedmembers 
} from 'imx-api-tsb';
import {
  CollectionLoadParameters,
  EntitySchema,
  TypedEntity,
  TypedEntityCollectionData,
  ValType
} from 'imx-qbm-dbts';
import {
  ConfirmationService,
  DataSourceToolbarSettings,
  DataTableComponent,
  FkAdvancedPickerComponent,
  ClientPropertyForTableColumns,
  SettingsService,
  SnackBarService
} from 'qbm';
import { SourceDetectiveSidesheetComponent, SourceDetectiveSidesheetData, SourceDetectiveType } from 'qer';
import { DbObjectKeyBase } from '../../../target-system/db-object-key-wrapper.interface';
import { GroupsService } from '../../groups.service';
import { NewMembershipService } from './new-membership/new-membership.service';

@Component({
  selector: 'imx-group-members',
  templateUrl: './group-members.component.html',
  styleUrls: ['./group-members.component.scss']
})
export class GroupMembersComponent implements OnInit {

  @Input() public groupDirectMembershipData: TypedEntityCollectionData<PortalTargetsystemUnsDirectmembers>;
  @Input() public groupNestedMembershipData: TypedEntityCollectionData<PortalTargetsystemUnsNestedmembers>;
  @Input() public unsGroupDbObjectKey: DbObjectKeyBase;

  @ViewChild('membersTable') public membersTable: DataTableComponent<any>;

  /**
   * Settings needed by the DataSourceToolbarComponent
   */
  public dstSettings: DataSourceToolbarSettings;
  public dstNestedGroupSettings: DataSourceToolbarSettings;

  /**
   * Page size, start index, search and filtering options etc.
   */
  public navigationState: CollectionLoadParameters;
  public nestedNavigationState: CollectionLoadParameters;
  public viewDirectMemberships = new UntypedFormControl(true);

  public showUnsubscribeWarning = false;

  public readonly entitySchemaGroupDirectMemberships: EntitySchema;
  public readonly entitySchemaGroupNestedMemberships: EntitySchema;

  public readonly itemStatus = {
    enabled: (item: PortalTargetsystemUnsDirectmembers): boolean => {
      return !item.IsFromDynamic?.value
        && ((item.UID_PersonWantsOrg.value !== '' && item.IsRequestCancellable.value)
          || item.XOrigin.value === 1);
    }
  };

  private displayedColumns: ClientPropertyForTableColumns[] = [];
  private nestedDisplayColumns: ClientPropertyForTableColumns[] = [];
  private selectedItems: TypedEntity[] = [];
  private selectedMembershipView: 'direct' | 'nested' = 'direct';
  private busyIndicator: OverlayRef;
  private groupId: string;

  constructor(
    private readonly busyService: EuiLoadingService,
    private readonly snackBarService: SnackBarService,
    private readonly sidesheet: EuiSidesheetService,
    private readonly groupsService: GroupsService,
    private readonly confirmationService: ConfirmationService,
    private readonly membershipService: NewMembershipService,
    private readonly translate: TranslateService,
    private readonly settingsService: SettingsService,
  ) {
    this.entitySchemaGroupDirectMemberships = groupsService.UnsGroupDirectMembersSchema;
    this.entitySchemaGroupNestedMemberships = groupsService.UnsGroupNestedMembersSchema;
    this.navigationState = { PageSize: settingsService.DefaultPageSize, StartIndex: 0 };
    this.nestedNavigationState = { PageSize: settingsService.DefaultPageSize, StartIndex: 0 };
  }

  public get membershipView(): 'direct' | 'nested' {
    return this.selectedMembershipView;
  }

  get isMobile(): boolean {
    return document.body.offsetWidth <= 768;
  }

  public async ngOnInit(): Promise<void> {
    this.displayedColumns = [
      this.entitySchemaGroupDirectMemberships.Columns.UID_Person,
      this.entitySchemaGroupDirectMemberships.Columns.UID_UNSAccount,
      this.entitySchemaGroupDirectMemberships.Columns.XOrigin,
      this.entitySchemaGroupDirectMemberships.Columns.XDateInserted,
      this.entitySchemaGroupDirectMemberships.Columns.OrderState,
      this.entitySchemaGroupDirectMemberships.Columns.ValidUntil,
      this.entitySchemaGroupDirectMemberships.Columns.XMarkedForDeletion
    ];
    this.nestedDisplayColumns = [
      this.entitySchemaGroupNestedMemberships.Columns.UID_Person,
      this.entitySchemaGroupNestedMemberships.Columns.UID_UNSGroupChild,
      this.entitySchemaGroupNestedMemberships.Columns.XMarkedForDeletion
    ];

    this.groupId = this.unsGroupDbObjectKey.Keys[0];

    await this.navigateDirect();
  }

  get selectedItemsCount(): number {
    return this.selectedItems.length;
  }

  public onSelectionChanged(items: TypedEntity[]): void {
    this.selectedItems = items;
  }

  public canUnsubscribeSelected(): boolean {
    return this.selectedItems != null
      && this.selectedItemsCount > 0
      && this.selectedItems.every(elem => elem.GetEntity().GetColumn('UID_PersonWantsOrg').GetValue() !== ''
        && elem.GetEntity().GetColumn('IsRequestCancellable').GetValue());
  }

  public canDeleteSelected(): boolean {
    return this.selectedItems != null
      && this.selectedItemsCount > 0
      && this.selectedItems.every(elem => elem.GetEntity().GetColumn('XOrigin').GetValue() === 1);
  }

  public async onToggleChanged(change: MatButtonToggleChange): Promise<void> {
    this.selectedMembershipView = change.value;
    this.selectedItems = [];
    if (this.selectedMembershipView === 'direct') {
      return this.onDirectNavigationStateChanged({ PageSize: this.settingsService.DefaultPageSize, StartIndex: 0 });
    }
    else {
      return this.onNestedNavigationStateChanged({ PageSize: this.settingsService.DefaultPageSize, StartIndex: 0 });
    }
  }

  public async onDirectNavigationStateChanged(newState?: CollectionLoadParameters): Promise<void> {
    if (newState) {
      this.navigationState = newState;
    }
    await this.navigateDirect();
  }

  public async onNestedNavigationStateChanged(newState?: CollectionLoadParameters): Promise<void> {
    if (newState) {
      this.nestedNavigationState = newState;
    }
    await this.navigateNested();
  }

  public async deleteMembers(): Promise<void> {
    if (await this.confirmationService.confirm({
      Title: '#LDS#Heading Remove Memberships',
      Message: '#LDS#The removal of memberships may take some time. The displayed data may differ from the actual state. Are you sure you want to remove the selected memberships?',
      identifier: 'group-members-confirm-delete-memberships'
    })) {
      this.handleOpenLoader();
      try {
        await this.groupsService.deleteGroupMembers(
          this.unsGroupDbObjectKey,
          this.selectedItems.map(i => i.GetEntity().GetColumn('UID_UNSAccount').GetValue())
        );
        this.membersTable.clearSelection();
        this.snackBarService.open({ key: '#LDS#The memberships have been successfully removed.' }, '#LDS#Close');
        await this.navigateDirect();
      } finally {
        this.handleCloseLoader();
      }
    }
  }

  public async requestMembership(serviceItem: PortalTargetsystemUnsGroupServiceitem): Promise<void> {
    const sidesheetRef = this.sidesheet.open(FkAdvancedPickerComponent, {
      title: await this.translate.get('#LDS#Heading Request Memberships').toPromise(),
      subTitle: serviceItem.GetEntity().GetDisplay(),
      padding: '0px',
      width: 'max(600px, 60%)',
      icon: 'usergroup',
      testId: 'systementitlements-reqeust-memberships',
      data: {
        fkRelations: this.membershipService.getFKRelation(),
        isMultiValue: true
      }
    });

    const result = await sidesheetRef.afterClosed().toPromise();

    if (result && result.candidates.length > 0 && await this.membershipService.requestMembership(result.candidates, serviceItem)) {
      this.snackBarService.open({
        key: '#LDS#The memberships for "{0}" have been successfully added to the shopping cart.',
        parameters: [serviceItem.GetEntity().GetDisplay()],
      });
    }
  }

  public onWarningDismissed(): void {
    this.showUnsubscribeWarning = false;
  }

  public async unsubscribeMembership(): Promise<void> {

    // if there is at least 1 item, that is not unsubscribable, show a warning instead
    const notSubscribable = this.selectedItems.some(entity => entity.GetEntity().GetColumn('IsRequestCancellable').GetValue() === false);
    if (notSubscribable) {
      this.showUnsubscribeWarning = true;
      this.membersTable.clearSelection();
      return;
    }
    if (await this.confirmationService.confirm({
      Title: '#LDS#Heading Unsubscribe Memberships',
      Message: '#LDS#Are you sure you want to unsubscribe the selected memberships?',
      identifier: 'group-members-confirm-unsubscribe-membership'
    })) {
      this.handleOpenLoader();
      try {
        await Promise.all(this.selectedItems.map((entity => this.membershipService.unsubscribeMembership(entity))));
        this.snackBarService.open({ key: '#LDS#The memberships have been successfully unsubscribed. It may take some time for the changes to take effect. The displayed data may differ from the actual state.' });
      } finally {
        this.handleCloseLoader();
        this.membersTable.clearSelection();
        await this.navigateDirect();
      }
    }
  }


  public async onShowDetails(item: PortalTargetsystemUnsDirectmembers): Promise<void> {

    const uidPerson = item.UID_Person.value;

    const data: SourceDetectiveSidesheetData = {
      UID_Person: uidPerson,
      Type: SourceDetectiveType.MembershipOfSystemEntitlement,
      UID: this.unsGroupDbObjectKey.Keys[0],
      TableName: this.unsGroupDbObjectKey.TableName
    };
    this.sidesheet.open(SourceDetectiveSidesheetComponent, {
      title: await this.translate.get('#LDS#Heading View Assignment Analysis').toPromise(),
      subTitle: item.GetEntity().GetDisplay(),
      padding: '0px',
      width: '800px',
      disableClose: false,
      testId: 'systementitlements-membership-assingment-analysis',
      data,
    });
  }

  private async navigateDirect(): Promise<void> {
    this.handleOpenLoader();
    try {
      this.groupDirectMembershipData = await this.groupsService.getGroupDirectMembers(this.groupId, this.navigationState);
      this.dstSettings = {
        displayedColumns: this.displayedColumns,
        dataSource: this.groupDirectMembershipData,
        entitySchema: this.entitySchemaGroupDirectMemberships,
        navigationState: this.navigationState
      };
    } finally {
      this.handleCloseLoader();
    }
  }

  private async navigateNested(): Promise<void> {
    this.showUnsubscribeWarning = false;
    this.handleOpenLoader();
    try {
      this.groupNestedMembershipData = await this.groupsService.getGroupNestedMembers(this.groupId, this.navigationState);
      this.dstNestedGroupSettings = {
        displayedColumns: this.nestedDisplayColumns,
        dataSource: this.groupNestedMembershipData,
        entitySchema: this.entitySchemaGroupNestedMemberships,
        navigationState: this.nestedNavigationState
      };
    } finally {
      this.handleCloseLoader();
    }
  }

  private handleOpenLoader(): void {
    if (!this.busyIndicator) {
      this.busyIndicator = this.busyService.show();
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

  public LdsNotUnsubscribableHint = "#LDS#There is at least one membership you cannot unsubscribe. You can only unsubscribe memberships you have requested.";

  public LdsDirectlyAssignedHint = "#LDS#Here you can get an overview of members assigned to the system entitlement itself.";

  public LdsIndirectlyAssignedHint = "#LDS#Here you can get an overview of members not assigned to the system entitlement itself, but to a child system entitlement.";

  public LdsDirectlyAssigned = "#LDS#Direct memberships";

  public LdsIndirectlyAssigned = "#LDS#Inherited memberships";
}
