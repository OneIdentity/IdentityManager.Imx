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

import { Component, Input, OnInit } from '@angular/core';
import { UntypedFormControl } from '@angular/forms';
import { MatButtonToggleChange } from '@angular/material/button-toggle';
import { EuiLoadingService, EuiSidesheetService } from '@elemental-ui/core';
import { TranslateService } from '@ngx-translate/core';

import {
  PortalTargetsystemUnsDirectmembers,
  PortalTargetsystemUnsGroupServiceitem,
  PortalTargetsystemUnsNestedmembers,
} from '@imx-modules/imx-api-tsb';
import { CollectionLoadParameters, EntitySchema, IClientProperty, TypedEntity, TypedEntityCollectionData } from '@imx-modules/imx-qbm-dbts';
import {
  calculateSidesheetWidth,
  ConfirmationService,
  DataViewInitParameters,
  DataViewSource,
  DataViewSourceFactoryService,
  FkAdvancedPickerComponent,
  isMobile,
  SnackBarService,
} from 'qbm';
import { SourceDetectiveSidesheetComponent, SourceDetectiveSidesheetData, SourceDetectiveType } from 'qer';
import { DbObjectKeyBase } from '../../../target-system/db-object-key-wrapper.interface';
import { GroupsService } from '../../groups.service';
import { NewMembershipService } from './new-membership/new-membership.service';

@Component({
  selector: 'imx-group-members',
  templateUrl: './group-members.component.html',
  styleUrls: ['./group-members.component.scss'],
  providers: [DataViewSource],
})
export class GroupMembersComponent implements OnInit {
  @Input() public groupDirectMembershipData: TypedEntityCollectionData<PortalTargetsystemUnsDirectmembers>;
  @Input() public groupNestedMembershipData: TypedEntityCollectionData<PortalTargetsystemUnsNestedmembers>;
  @Input() public unsGroupDbObjectKey: DbObjectKeyBase;

  public viewDirectMemberships = new UntypedFormControl(true);

  public canViewInheritedMemberships: boolean = false;

  public showUnsubscribeWarning = false;

  public readonly entitySchemaGroupDirectMemberships: EntitySchema;
  public readonly entitySchemaGroupNestedMemberships: EntitySchema;

  public readonly itemStatus = {
    enabled: (item: PortalTargetsystemUnsDirectmembers): boolean => {
      return (
        !item.IsFromDynamic?.value &&
        ((item.UID_PersonWantsOrg.value !== '' && item.IsRequestCancellable.value) || item.XOrigin.value === 1)
      );
    },
  };

  protected abortController: AbortController;

  public get selectedItemsCount() {
    return this.dataSourceDirect.selection.selected.length;
  }

  private selectedMembershipView: 'direct' | 'nested' = 'direct';
  private groupId: string;

  public automaticColumnDirect: IClientProperty[];
  public dataSourceDirect: DataViewSource<PortalTargetsystemUnsDirectmembers>;
  public dataSourceNested: DataViewSource<PortalTargetsystemUnsNestedmembers>;

  constructor(
    private readonly busyService: EuiLoadingService,
    private readonly snackBarService: SnackBarService,
    private readonly sidesheet: EuiSidesheetService,
    private readonly groupsService: GroupsService,
    private readonly confirmationService: ConfirmationService,
    private readonly membershipService: NewMembershipService,
    private readonly translate: TranslateService,
    dataSourceFactory: DataViewSourceFactoryService,
  ) {
    this.abortController = new AbortController();
    this.entitySchemaGroupDirectMemberships = groupsService.UnsGroupDirectMembersSchema;
    this.entitySchemaGroupNestedMemberships = groupsService.UnsGroupNestedMembersSchema;
    this.dataSourceDirect = dataSourceFactory.getDataSource<PortalTargetsystemUnsDirectmembers>();
    this.dataSourceNested = dataSourceFactory.getDataSource<PortalTargetsystemUnsNestedmembers>();
    this.automaticColumnDirect = [
      this.entitySchemaGroupDirectMemberships.Columns.UID_UNSAccount,
      this.entitySchemaGroupDirectMemberships.Columns?.XOrigin,
      this.entitySchemaGroupDirectMemberships.Columns.XDateInserted,
      this.entitySchemaGroupDirectMemberships.Columns.OrderState,
      this.entitySchemaGroupDirectMemberships.Columns.ValidUntil,
    ];
  }

  public get membershipView(): 'direct' | 'nested' {
    return this.selectedMembershipView;
  }

  get isMobile(): boolean {
    return isMobile();
  }

  public async ngOnInit(): Promise<void> {
    this.groupId = this.unsGroupDbObjectKey.Keys[0];
    this.canViewInheritedMemberships = this.unsGroupDbObjectKey?.TableName === 'ADSGroup';

    await this.navigateDirect();
  }

  public canUnsubscribeSelected(): boolean {
    return (
      this.dataSourceDirect.selection.selected != null &&
      this.dataSourceDirect.selection.selected.length > 0 &&
      this.dataSourceDirect.selection.selected.every(
        (elem) =>
          elem.GetEntity().GetColumn('UID_PersonWantsOrg').GetValue() !== '' &&
          elem.GetEntity().GetColumn('IsRequestCancellable').GetValue(),
      )
    );
  }

  public canDeleteSelected(): boolean {
    return (
      this.dataSourceDirect.selection.selected != null &&
      this.dataSourceDirect.selection.selected.length > 0 &&
      this.dataSourceDirect.selection.selected.every((elem) => elem.GetEntity().GetColumn('XOrigin').GetValue() === 1)
    );
  }

  public async onToggleChanged(change: MatButtonToggleChange): Promise<void> {
    this.selectedMembershipView = change.value;
    this.abortController.abort();

    if (this.selectedMembershipView === 'direct') {
      await this.navigateDirect();
    } else {
      await this.navigateNested();
    }
  }

  public async deleteMembers(): Promise<void> {
    if (
      await this.confirmationService.confirm({
        Title: '#LDS#Heading Remove Memberships',
        Message:
          '#LDS#The removal of memberships may take some time. The displayed data may differ from the actual state. Are you sure you want to remove the selected memberships?',
        identifier: 'group-members-confirm-delete-memberships',
      })
    ) {
      this.handleOpenLoader();
      try {
        console.log(this.dataSourceDirect.selection.selected);
        await this.groupsService.deleteGroupMembers(
          this.unsGroupDbObjectKey,
          this.dataSourceDirect.selection.selected.map((i) => i.GetEntity().GetColumn('UID_UNSAccount').GetValue()),
        );
        this.dataSourceDirect.selection.clear();
        this.snackBarService.open({ key: '#LDS#The memberships have been successfully removed.' }, '#LDS#Close');
        await this.navigateDirect();
      } finally {
        this.handleCloseLoader();
      }
    }
  }

  public async requestMembership(serviceItem: PortalTargetsystemUnsGroupServiceitem): Promise<void> {
    const sidesheetRef = this.sidesheet.open(FkAdvancedPickerComponent, {
      title: await this.translate.instant('#LDS#Heading Request Memberships'),
      subTitle: serviceItem.GetEntity().GetDisplay(),
      padding: '0px',
      width: calculateSidesheetWidth(),
      icon: 'usergroup',
      testId: 'systementitlements-reqeust-memberships',
      data: {
        fkRelations: this.membershipService.getFKRelation(),
        isMultiValue: true,
      },
    });

    const result = await sidesheetRef.afterClosed().toPromise();

    if (result && result.candidates.length > 0 && (await this.membershipService.requestMembership(result.candidates, serviceItem))) {
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
    const notSubscribable = this.dataSourceDirect.selection.selected.some(
      (entity) => entity.GetEntity().GetColumn('IsRequestCancellable').GetValue() === false,
    );
    if (notSubscribable) {
      this.showUnsubscribeWarning = true;
      this.dataSourceDirect.selection.clear();
      return;
    }
    if (
      await this.confirmationService.confirm({
        Title: '#LDS#Heading Unsubscribe Memberships',
        Message: '#LDS#Are you sure you want to unsubscribe the selected memberships?',
        identifier: 'group-members-confirm-unsubscribe-membership',
      })
    ) {
      this.handleOpenLoader();
      try {
        await Promise.all(this.dataSourceDirect.selection.selected.map((entity) => this.membershipService.unsubscribeMembership(entity)));
        this.snackBarService.open({
          key: '#LDS#The memberships have been successfully unsubscribed. It may take some time for the changes to take effect. The displayed data may differ from the actual state.',
        });
      } finally {
        this.handleCloseLoader();
        this.dataSourceDirect.selection.clear();
        await this.navigateDirect();
      }
    }
  }

  public async onShowDetails(item: TypedEntity): Promise<void> {
    const data: SourceDetectiveSidesheetData = {
      UID_Person: item.GetEntity().GetColumn('UID_Person').GetValue(),
      Type: SourceDetectiveType.MembershipOfSystemEntitlement,
      UID: this.unsGroupDbObjectKey.Keys[0],
      TableName: this.unsGroupDbObjectKey.TableName,
    };
    this.sidesheet.open(SourceDetectiveSidesheetComponent, {
      title: await this.translate.instant('#LDS#Heading View Assignment Analysis'),
      subTitle: item.GetEntity().GetDisplay(),
      padding: '0px',
      width: calculateSidesheetWidth(800, 0.5),
      disableClose: false,
      testId: 'systementitlements-membership-assingment-analysis',
      data,
    });
  }

  private async navigateDirect(): Promise<void> {
    this.dataSourceDirect.itemStatus = this.itemStatus;
    const columnsToDisplay = [
      this.entitySchemaGroupDirectMemberships.Columns.UID_Person,
      ...this.automaticColumnDirect,
      this.entitySchemaGroupDirectMemberships.Columns.XMarkedForDeletion,
    ];
    const dataViewInitParameters: DataViewInitParameters<PortalTargetsystemUnsDirectmembers> = {
      execute: (
        params: CollectionLoadParameters,
        signal: AbortSignal,
      ): Promise<TypedEntityCollectionData<PortalTargetsystemUnsDirectmembers>> => {
        return this.groupsService.getGroupDirectMembers(this.groupId, params, signal);
      },
      schema: this.entitySchemaGroupDirectMemberships,
      columnsToDisplay,
      highlightEntity: (identity: PortalTargetsystemUnsDirectmembers) => {
        this.onShowDetails(identity);
      },
    };
    await this.dataSourceDirect.init(dataViewInitParameters);
  }

  private async navigateNested(): Promise<void> {
    this.showUnsubscribeWarning = false;
    const columnsToDisplay = [
      this.entitySchemaGroupNestedMemberships.Columns.UID_Person,
      this.entitySchemaGroupNestedMemberships.Columns.UID_UNSGroupChild,
      this.entitySchemaGroupNestedMemberships.Columns.XMarkedForDeletion,
    ];
    const dataViewInitParameters: DataViewInitParameters<PortalTargetsystemUnsNestedmembers> = {
      execute: (
        params: CollectionLoadParameters,
        signal: AbortSignal,
      ): Promise<TypedEntityCollectionData<PortalTargetsystemUnsNestedmembers>> => {
        return this.groupsService.getGroupNestedMembers(this.groupId, params, signal);
      },
      schema: this.entitySchemaGroupNestedMemberships,
      columnsToDisplay,
      highlightEntity: (identity: PortalTargetsystemUnsNestedmembers) => {
        this.onShowDetails(identity);
      },
    };
    await this.dataSourceNested.init(dataViewInitParameters);
  }

  private handleOpenLoader(): void {
    this.busyService.show();
  }

  private handleCloseLoader(): void {
    this.busyService.hide();
  }

  public LdsNotUnsubscribableHint =
    '#LDS#There is at least one membership you cannot unsubscribe. You can only unsubscribe memberships you have requested.';

  public LdsDirectlyAssignedHint = '#LDS#Here you can get an overview of members assigned to the system entitlement itself.';

  public LdsIndirectlyAssignedHint =
    '#LDS#Here you can get an overview of members not assigned to the system entitlement itself, but to a child system entitlement.';

  public LdsDirectlyAssigned = '#LDS#Direct memberships';

  public LdsIndirectlyAssigned = '#LDS#Inherited memberships';
}
