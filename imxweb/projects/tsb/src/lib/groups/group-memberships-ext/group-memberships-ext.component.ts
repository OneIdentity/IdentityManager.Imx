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

import { Component, Input, OnInit } from '@angular/core';
import { EuiSidesheetService } from '@elemental-ui/core';
import { TranslateService } from '@ngx-translate/core';

import { CollectionLoadParameters, DbObjectKey, DisplayColumns, EntitySchema, IClientProperty, TypedEntity } from 'imx-qbm-dbts';
import { BusyService, DataSourceToolbarSettings, DynamicTabDataProviderDirective, SettingsService } from 'qbm';
import { GroupMembershipsExtService } from './group-memberships-ext.service';
import { SourceDetectiveSidesheetComponent, SourceDetectiveSidesheetData, SourceDetectiveType } from 'qer';
import { PortalPersonGroupmemberships } from 'imx-api-tsb';

@Component({
  templateUrl: './group-memberships-ext.component.html',
  styleUrls: ['./group-memberships-ext.component.scss'],
})
export class GroupMembershipsExtComponent implements OnInit {
  @Input() public referrer: {
    objecttable?: string;
    objectuid?: string;
    tablename?: string;
  };

  public dstSettings: DataSourceToolbarSettings;
  public readonly DisplayColumns = DisplayColumns;

  public entitySchema: EntitySchema;

  public displayColumns: IClientProperty[] = [];
  private displayedColumnsWithDisplay = [];
  private navigationState: CollectionLoadParameters;

  public busyService = new BusyService();

  constructor(
    private readonly settingService: SettingsService,
    private readonly groupService: GroupMembershipsExtService,
    private readonly translate: TranslateService,
    private readonly sidesheet: EuiSidesheetService,
    dataProvider: DynamicTabDataProviderDirective
  ) {
    this.referrer = dataProvider?.data;
    this.navigationState = { PageSize: this.settingService.DefaultPageSize };
    this.entitySchema = groupService.portalPersonGroupmembershipsSchema;
    this.displayColumns = [
      this.entitySchema.Columns.XOrigin,
      this.entitySchema.Columns.XDateInserted,
      this.entitySchema.Columns.OrderState,
      this.entitySchema.Columns.ValidUntil,
    ];

    this.displayedColumnsWithDisplay = [...[this.entitySchema.Columns[DisplayColumns.DISPLAY_PROPERTYNAME]], ...this.displayColumns];
  }

  public async ngOnInit(): Promise<void> {
    return this.getData();
  }

  public async onNavigationStateChanged(newState?: CollectionLoadParameters): Promise<void> {
    if (newState) {
      this.navigationState = newState;
    }
    await this.getData();
  }

  public async onSearch(keywords: string): Promise<void> {
    this.navigationState.StartIndex = 0;
    this.navigationState.search = keywords;
    await this.getData();
  }

  public async onShowDetails(entity: PortalPersonGroupmemberships): Promise<void> {
    const unsGroupId = DbObjectKey.FromXml(entity.ObjectKeyGroup.value);

    const data: SourceDetectiveSidesheetData = {
      UID_Person: this.referrer.objectuid,
      Type: SourceDetectiveType.MembershipOfSystemEntitlement,
      UID: unsGroupId.Keys[0],
      TableName: unsGroupId.TableName,
    };

    this.sidesheet.open(SourceDetectiveSidesheetComponent, {
      title: await this.translate.get('#LDS#Heading View Assignment Analysis').toPromise(),
      subTitle: entity.GetEntity().GetDisplay(),
      padding: '0px',
      width: '800px',
      disableClose: false,
      testId: 'group-membership-assingment-analysis',
      data,
    });

  }

  private async getData(): Promise<void> {
   const isBusy = this.busyService.beginBusy();
    try {
      const groupsPerIdentity = await this.groupService.getGroupMemberships(this.referrer.objectuid, this.navigationState);
      this.dstSettings = {
        displayedColumns: this.displayedColumnsWithDisplay,
        dataSource: groupsPerIdentity,
        entitySchema: this.entitySchema,
        navigationState: this.navigationState,
      };
    } finally {
      isBusy.endBusy();
    }
  }
}
