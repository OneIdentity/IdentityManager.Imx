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
import { Component, OnInit } from '@angular/core';
import { EuiLoadingService, EuiSidesheetService } from '@elemental-ui/core';
import { TranslateService } from '@ngx-translate/core';

import { CollectionLoadParameters, DisplayColumns, EntitySchema, IClientProperty, TypedEntity, ValType } from 'imx-qbm-dbts';
import { BusyService, DataSourceToolbarSettings, DynamicTabDataProviderDirective, MetadataService, SettingsService } from 'qbm';
import { RoleService } from '../../../role-management/role.service';
import {
  SourceDetectiveSidesheetComponent,
  SourceDetectiveSidesheetData,
} from '../../../sourcedetective/sourcedetective-sidesheet.component';
import { SourceDetectiveType } from '../../../sourcedetective/sourcedetective-type.enum';
import { IdentityRoleMembershipsService } from './identity-role-memberships.service';

@Component({
  templateUrl: './identity-role-memberships.component.html',
  styleUrls: ['./identity-role-memberships.component.scss'],
})
export class IdentityRoleMembershipsComponent implements OnInit {
  public dstSettings: DataSourceToolbarSettings;
  public readonly DisplayColumns = DisplayColumns;
  public displayedColumns: IClientProperty[];
  public caption: string;
  public entitySchema: EntitySchema;
  public withActions: boolean;

  private referrer: { objectuid: string; tablename: string };
  private navigationState: CollectionLoadParameters;
  private displayedColumnsWithDisplay: IClientProperty[];

  public busyService = new BusyService();

  constructor(
    private readonly busyServiceElemental: EuiLoadingService,
    private readonly metadataService: MetadataService,
    private readonly roleMembershipsService: IdentityRoleMembershipsService,
    private readonly membershipService: RoleService,
    private readonly settingService: SettingsService,
    private readonly sidesheet: EuiSidesheetService,
    private readonly translate: TranslateService,
    dataProvider: DynamicTabDataProviderDirective
  ) {
    this.referrer = dataProvider.data;
    this.entitySchema = this.roleMembershipsService.getSchema(this.referrer.tablename);
    this.withActions = this.roleMembershipsService.canAnalyseAssignment(this.referrer.tablename);

    this.navigationState = { PageSize: this.settingService.DefaultPageSize };
    this.displayedColumns = [
      this.entitySchema.Columns.XOrigin,
      this.entitySchema.Columns.XDateInserted,
      this.entitySchema.Columns.OrderState,
      this.entitySchema.Columns.ValidUntil,
    ];

    this.displayedColumnsWithDisplay = [...[this.entitySchema.Columns[DisplayColumns.DISPLAY_PROPERTYNAME]], ...this.displayedColumns];
  }

  public async ngOnInit(): Promise<void> {
    const isBusy = this.busyService.beginBusy();
    try {
      await this.metadataService.update([this.referrer.tablename]);
    } finally {
      isBusy.endBusy();
    }
    this.caption = this.metadataService.tables[this.referrer.tablename].Display;
    return this.getData();
  }

  public async onShowDetails(entity: TypedEntity): Promise<void> {
    if (!this.withActions) {
      return;
    }
    const uidPerson = this.referrer.objectuid;

    const uidRole = this.membershipService.targetMap.get(this.referrer.tablename)?.membership.GetUidRole(entity.GetEntity());
    if (uidRole == null) {
      return;
    }
    const data: SourceDetectiveSidesheetData = {
      UID_Person: uidPerson,
      Type: SourceDetectiveType.MembershipOfRole,
      UID: uidRole,
      TableName: this.referrer.tablename,
    };
    this.sidesheet.open(SourceDetectiveSidesheetComponent, {
      title: await this.translate.get('#LDS#Heading View Assignment Analysis').toPromise(),
      subTitle: entity.GetEntity().GetDisplay(),
      padding: '0px',
      width: 'max(768px, 80%)',
      disableClose: false,
      testId: 'identity-role-memberships-risk-sidesheet',
      data,
    });
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

  private async getData(): Promise<void> {
    const isBusy = this.busyService.beginBusy();
    try {
      const dataSource = await this.roleMembershipsService.get(this.referrer.tablename, this.referrer.objectuid, this.navigationState);

      this.dstSettings = {
        displayedColumns: this.displayedColumnsWithDisplay,
        dataSource,
        entitySchema: this.entitySchema,
        navigationState: this.navigationState,
      };
    } finally {
      isBusy.endBusy();
    }
  }
}
