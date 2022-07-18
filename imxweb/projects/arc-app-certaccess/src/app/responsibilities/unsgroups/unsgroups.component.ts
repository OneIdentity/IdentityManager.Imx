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

import { OverlayRef } from '@angular/cdk/overlay';
import { Component, OnInit } from '@angular/core';
import { EuiLoadingService, EuiSidesheetService } from '@elemental-ui/core';
import { TranslateService } from '@ngx-translate/core';

import { CollectionLoadParameters, DbObjectKey, DisplayColumns, EntitySchema, IClientProperty, ValType } from 'imx-qbm-dbts';
import { PortalRespUnsgroup } from 'imx-api-tsb';

import { DataSourceToolbarFilter, DataSourceToolbarSettings, ClassloggerService, SettingsService, ClientPropertyForTableColumns } from 'qbm';
import { GroupsService, GroupSidesheetData, GroupSidesheetComponent } from 'tsb';
import { UnsgroupsService } from './unsgroups.service';


@Component({
  selector: 'imx-unsgroups',
  templateUrl: './unsgroups.component.html',
  styleUrls: ['./unsgroups.component.scss']
})
export class UnsgroupsComponent implements OnInit {

  public dstSettings: DataSourceToolbarSettings;
  public selectedItems: PortalRespUnsgroup[] = [];

  public readonly DisplayColumns = DisplayColumns;
  public readonly entitySchema: EntitySchema;

  private pageSize: number;
  private navigationState: CollectionLoadParameters;
  private filterOptions: DataSourceToolbarFilter[] = [];
  private busyIndicator: OverlayRef;

  private readonly displayedColumns: ClientPropertyForTableColumns[] = [];

  constructor(
    private readonly busyService: EuiLoadingService,
    private readonly logger: ClassloggerService,
    private readonly sideSheet: EuiSidesheetService,
    private readonly translate: TranslateService,
    private readonly groupsService: GroupsService,
    settingsService: SettingsService,
    private readonly unsgroupsService: UnsgroupsService
  ) {
    this.pageSize = settingsService.DefaultPageSize;
    this.navigationState = { PageSize: this.pageSize, StartIndex: 0, filter: [] };
    this.entitySchema = this.unsgroupsService.respUnsGroupSchema;
    this.displayedColumns = [
      this.entitySchema.Columns[DisplayColumns.DISPLAY_LONG_PROPERTYNAME],
      this.entitySchema.Columns.Requestable,
      {
        ColumnName: 'edit',
        Type: ValType.String,
        afterAdditionals: true
      }
    ];
  }

  public async ngOnInit(): Promise<void> {
    this.getData();
  }

  public async getData(newState?: CollectionLoadParameters): Promise<void> {
    if (this.busyIndicator == null) {
      setTimeout(() => this.busyIndicator = this.busyService.show());
    }

    if (newState) {
      this.navigationState = newState;
      this.pageSize = newState.PageSize;
    }

    try {
      this.filterOptions = await this.groupsService.getFilterOptions(false);
      const data = await this.unsgroupsService.get(this.navigationState);
      if (data) {
        this.dstSettings = {
          dataSource: data,
          filters: this.filterOptions,
          displayedColumns: this.displayedColumns,
          entitySchema: this.entitySchema,
          navigationState: this.navigationState
        };
      } else {
        this.dstSettings = undefined;
      }
    } finally {
      if (this.busyIndicator) {
        setTimeout(() => {
          this.busyService.hide(this.busyIndicator);
          this.busyIndicator = undefined;
        });
      }
    }
  }

  public onSearch(keywords: string): Promise<void> {
    const navigationState = {
      ...this.navigationState,
      ...{
        PageSize: this.pageSize,
        StartIndex: 0,
        search: keywords
      }
    };
    return this.getData(navigationState);
  }

  public async editUnsgroup(unsgroup: PortalRespUnsgroup): Promise<void> {

    if (this.busyIndicator == null) {
      setTimeout(() => this.busyIndicator = this.busyService.show());
    }

    this.logger.trace('New selected unsgroup', unsgroup);

    let data: GroupSidesheetData;

    try {
      const objKey = DbObjectKey.FromXml(unsgroup.XObjectKey.value);

      const adsGroup = await this.groupsService.getGroupDetails(objKey);

      const uidAccProduct = unsgroup.UID_AccProduct.value;

      this.logger.trace('details of the following adsgroup loaded: ', uidAccProduct);

      data = {
        isAdmin: false,
        uidAccProduct,
        unsGroupDbObjectKey: objKey,
        group: adsGroup,
        groupServiceItem: await this.groupsService.getGroupServiceItem(uidAccProduct)
      };
    } finally {
      if (this.busyIndicator) {
        setTimeout(() => {
          this.busyService.hide(this.busyIndicator);
          this.busyIndicator = undefined;
        });
      }
    }
    const sidesheetRef = this.sideSheet.open(GroupSidesheetComponent, {
      title: await this.translate.get('#LDS#Heading Edit System Entitlement').toPromise(),
      headerColour: 'iris-blue',
      padding: '0px',
      width: '65%',
      icon: 'usergroup',
      testId: 'unsgroups-sidesheet',
      data
    });

    sidesheetRef.afterClosed().subscribe(() => this.getData());
  }
}
