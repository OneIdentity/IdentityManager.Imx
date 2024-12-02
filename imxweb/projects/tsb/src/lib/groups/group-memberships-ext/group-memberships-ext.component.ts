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
import { EuiSidesheetService } from '@elemental-ui/core';
import { TranslateService } from '@ngx-translate/core';

import { PortalPersonGroupmemberships } from '@imx-modules/imx-api-tsb';
import {
  CollectionLoadParameters,
  DbObjectKey,
  DisplayColumns,
  EntitySchema,
  ExtendedTypedEntityCollection,
  IClientProperty,
  TypedEntity,
} from '@imx-modules/imx-qbm-dbts';
import {
  BusyService,
  calculateSidesheetWidth,
  DataSourceToolbarSettings,
  DataViewInitParameters,
  DataViewSource,
  DynamicTabDataProviderDirective,
} from 'qbm';
import { SourceDetectiveSidesheetComponent, SourceDetectiveSidesheetData, SourceDetectiveType } from 'qer';
import { GroupMembershipsExtService } from './group-memberships-ext.service';

@Component({
  templateUrl: './group-memberships-ext.component.html',
  styleUrls: ['./group-memberships-ext.component.scss'],
  providers: [DataViewSource],
})
export class GroupMembershipsExtComponent implements OnInit {
  @Input() public referrer: {
    objecttable: string;
    objectuid: string;
    tablename?: string;
  };

  public dstSettings: DataSourceToolbarSettings;
  public readonly DisplayColumns = DisplayColumns;

  public entitySchema: EntitySchema;

  public displayColumns: IClientProperty[] = [];
  private displayedColumnsWithDisplay: IClientProperty[] = [];
  private navigationState: CollectionLoadParameters;

  public busyService = new BusyService();

  constructor(
    private readonly groupService: GroupMembershipsExtService,
    private readonly translate: TranslateService,
    private readonly sidesheet: EuiSidesheetService,
    dataProvider: DynamicTabDataProviderDirective,
    public dataSource: DataViewSource<PortalPersonGroupmemberships>,
  ) {
    this.referrer = dataProvider?.data;
    this.entitySchema = groupService.portalPersonGroupmembershipsSchema;
    this.displayColumns = [
      this.entitySchema.Columns?.XOrigin,
      this.entitySchema.Columns.XDateInserted,
      this.entitySchema.Columns.OrderState,
      this.entitySchema.Columns.ValidUntil,
    ];

    this.displayedColumnsWithDisplay = [this.entitySchema.Columns[DisplayColumns.DISPLAY_PROPERTYNAME], ...this.displayColumns];
  }

  public async ngOnInit(): Promise<void> {
    return this.getData();
  }

  public async onShowDetails(entity: TypedEntity): Promise<void> {
    const unsGroupId = DbObjectKey.FromXml(entity.GetEntity().GetColumn('ObjectKeyGroup').GetValue());

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
      width: calculateSidesheetWidth(800, 0.5),
      disableClose: false,
      testId: 'group-membership-assingment-analysis',
      data,
    });
  }

  private async getData(): Promise<void> {
    const isBusy = this.busyService.beginBusy();
    try {
      const dataViewInitParameters: DataViewInitParameters<PortalPersonGroupmemberships> = {
        execute: (
          params: CollectionLoadParameters,
          signal: AbortSignal,
        ): Promise<ExtendedTypedEntityCollection<PortalPersonGroupmemberships, unknown>> => {
          return this.groupService.getGroupMemberships(this.referrer.objectuid, params, signal);
        },
        schema: this.entitySchema,
        columnsToDisplay: this.displayedColumnsWithDisplay,
        highlightEntity: (identity: PortalPersonGroupmemberships) => {
          this.onShowDetails(identity);
        },
      };
      await this.dataSource.init(dataViewInitParameters);
    } finally {
      isBusy.endBusy();
    }
  }
}
