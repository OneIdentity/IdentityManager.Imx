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

import { Component, OnInit, ViewChild } from '@angular/core';

import { PortalTargetsystemAadgroupSubsku } from 'imx-api-aad';
import { CollectionLoadParameters, DisplayColumns, EntitySchema, IClientProperty } from 'imx-qbm-dbts';
import {
  ClassloggerService,
  DataSourceToolbarFilter,
  DataSourceToolbarSettings, DataTableComponent,
  DynamicTabDataProviderDirective,
  SettingsService
} from 'qbm';
import { AzureAdService } from '../azure-ad.service';

@Component({
  selector: 'imx-aad-group-subscriptions',
  templateUrl: './aad-group-subscriptions.component.html',
  styleUrls: ['../azure-ad-common.scss']
})
export class AadGroupSubscriptionsComponent implements OnInit {

  @ViewChild('dataTable', { static: false }) public dataTable: DataTableComponent<PortalTargetsystemAadgroupSubsku>;
  public dstSettings: DataSourceToolbarSettings;
  public navigationState: CollectionLoadParameters;
  public filterOptions: DataSourceToolbarFilter[] = [];
  public readonly entitySchemaAadGroupSub: EntitySchema;
  public readonly DisplayColumns = DisplayColumns;

  private displayedColumns: IClientProperty[] = [];
  private referrer: { objecttable: string; objectuid: string; };

  constructor(
    private readonly logger: ClassloggerService,
    private readonly aadService: AzureAdService,
    settings: SettingsService,
    dataProvider: DynamicTabDataProviderDirective
  ) {
    this.navigationState = { PageSize: settings.DefaultPageSize, StartIndex: 0 };
    this.entitySchemaAadGroupSub = this.aadService.aadGroupSubSchema;
    this.referrer = dataProvider.data;
  }

  public async ngOnInit(): Promise<void> {
    this.displayedColumns = [
      this.entitySchemaAadGroupSub.Columns.UID_AADSubSku,
      this.entitySchemaAadGroupSub.Columns.XOrigin
    ];
    await this.navigate();
  }

  public async onNavigationStateChanged(newState?: CollectionLoadParameters): Promise<void> {
    if (newState) {
      this.navigationState = newState;
    }
    await this.navigate();
  }

  public async onSearch(keywords: string): Promise<void> {
    this.logger.debug(this, `Searching for: ${keywords}`);
    this.navigationState.StartIndex = 0;
    this.navigationState.search = keywords;
    await this.navigate();
  }


  private async navigate(): Promise<void> {
    this.aadService.handleOpenLoader();
    try {
      const data = await this.aadService.getAadGroupSubscriptions(this.referrer.objectuid, this.navigationState);
      this.dstSettings = {
        displayedColumns: this.displayedColumns,
        dataSource: data,
        entitySchema: this.entitySchemaAadGroupSub,
        navigationState: this.navigationState,
        filters: this.filterOptions,
      };
      this.logger.debug(this, `Head at ${data.Data.length + this.navigationState.StartIndex} of ${data.totalCount} item(s)`);
    } finally {
      this.aadService.handleCloseLoader();
    }
  }
}
