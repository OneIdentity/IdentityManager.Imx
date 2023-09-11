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
import { Component, Input, OnInit } from '@angular/core';
import { EuiLoadingService } from '@elemental-ui/core';
import { PortalTargetsystemUnsGroupmembers } from 'imx-api-tsb';
import { CollectionLoadParameters, DataModel, DisplayColumns, EntitySchema, IClientProperty, TypedEntityCollectionData } from 'imx-qbm-dbts';
import { DataSourceToolbarSettings, SettingsService } from 'qbm';
import { GroupsService } from '../../groups.service';

@Component({
  selector: 'imx-child-system-entitlements',
  templateUrl: './child-system-entitlements.component.html',
  styleUrls: ['./child-system-entitlements.component.scss']
})
export class ChildSystemEntitlementsComponent implements OnInit {
  @Input() public groupId: string;
  @Input() public isAdmin: boolean;

  public groupsGroupMembershipData: TypedEntityCollectionData<PortalTargetsystemUnsGroupmembers>;
  public groupsDstSettings: DataSourceToolbarSettings;
  public navigationState: CollectionLoadParameters;
  public readonly entitySchemaUnsGroupMemberships: EntitySchema;

  private groupDisplayedColumns: IClientProperty[] = [];
  private dataModel: DataModel;

  constructor(
    private readonly busyService: EuiLoadingService,
    private readonly settingsService: SettingsService,
    private readonly groupsService: GroupsService
  ) {
    this.navigationState = { PageSize: settingsService.DefaultPageSize, StartIndex: 0 };
    this.entitySchemaUnsGroupMemberships = groupsService.UnsGroupMembersSchema;
  }

  public async ngOnInit(): Promise<void> {
    this.groupDisplayedColumns = [
      this.entitySchemaUnsGroupMemberships.Columns.UID_UNSGroupChild,
      this.entitySchemaUnsGroupMemberships.Columns[DisplayColumns.DISPLAY_PROPERTYNAME],
      this.entitySchemaUnsGroupMemberships.Columns.XDateInserted,
    ];

    let overlayRef: OverlayRef;
    setTimeout(() => (overlayRef = this.busyService.show()));

    try {
      this.dataModel = await this.groupsService.getDataModel(this.isAdmin);
    } finally {
      setTimeout(() => this.busyService.hide(overlayRef));
    }
    await this.groupNavigate();
  }

  public async getData(newState?: CollectionLoadParameters): Promise<void> {
    await this.groupNavigate(newState);
  }

  private async groupNavigate(newState?: CollectionLoadParameters): Promise<void> {
    let overlayRef: OverlayRef;
    setTimeout(() => overlayRef = this.busyService.show());

    try {
      if (newState) {
        this.navigationState = newState;
      }

      this.groupsGroupMembershipData = await this.groupsService.getGroupsGroupMembers(this.groupId, this.navigationState);
      this.groupsDstSettings = {
        displayedColumns: this.groupDisplayedColumns,
        dataSource: this.groupsGroupMembershipData,
        entitySchema: this.entitySchemaUnsGroupMemberships,
        navigationState: this.navigationState,
        dataModel: this.dataModel
      };
    } finally {
      setTimeout(() => this.busyService.hide(overlayRef));
    }

  }

}
