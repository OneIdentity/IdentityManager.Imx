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

import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

import { PortalTargetsystemAaduserDeniedserviceplans } from 'imx-api-aad';
import { CollectionLoadParameters, DbObjectKey, DisplayColumns, EntitySchema, IClientProperty } from 'imx-qbm-dbts';
import {
  ClassloggerService,
  DataSourceToolbarFilter,
  DataSourceToolbarSettings,
  DataTableComponent,
  DynamicTabDataProviderDirective,
  SettingsService
} from 'qbm';
import { AzureAdService } from '../azure-ad.service';
import { AadUserCreateDialogComponent } from './aad-user-create-dialog.component';

@Component({
  selector: 'imx-aad-user-denied-plans',
  templateUrl: './aad-user-denied-plans.component.html',
  styleUrls: ['../azure-ad-common.scss']
})
export class AadUserDeniedPlansComponent implements OnInit {

  @Input() public referrer: { objecttable: string; objectuid: string; };
  @ViewChild('dataTable', { static: false }) public dataTable: DataTableComponent<PortalTargetsystemAaduserDeniedserviceplans>;

  public dstSettings: DataSourceToolbarSettings;
  public navigationState: CollectionLoadParameters;
  public filterOptions: DataSourceToolbarFilter[] = [];
  public readonly entitySchemaAadUserDeniedPlan: EntitySchema;
  public readonly DisplayColumns = DisplayColumns;
  public selectedUserDeniedPlans: PortalTargetsystemAaduserDeniedserviceplans[] = [];

  private displayedColumns: IClientProperty[] = [];

  constructor(
    private dialog: MatDialog,
    private readonly logger: ClassloggerService,
    private readonly aadService: AzureAdService,
    settings: SettingsService,
    dataProvider: DynamicTabDataProviderDirective
  ) {
    this.navigationState = { PageSize: settings.DefaultPageSize, StartIndex: 0 };
    this.entitySchemaAadUserDeniedPlan = this.aadService.aadUserDeniedPlansSchema;
    this.referrer = dataProvider.data;
  }

  public async ngOnInit(): Promise<void> {
    this.displayedColumns = [
      this.entitySchemaAadUserDeniedPlan.Columns.UID_AADDeniedServicePlan,
      this.entitySchemaAadUserDeniedPlan.Columns.XOrigin,
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

  public onDeniedPlanSelected(selected: PortalTargetsystemAaduserDeniedserviceplans[]): void {
    this.logger.debug(this, `Selected aad user disabled plans changed`);
    this.logger.trace(`New aad user disabled plan selections`, selected);
    this.selectedUserDeniedPlans = selected;
  }

  public async showCreateModal(): Promise<void> {
    const aadDeniedPlan: PortalTargetsystemAaduserDeniedserviceplans =
      this.aadService.generateAadUserDeniedPlanEntity(this.getUserKey());
    const dialogRef = this.dialog.open(AadUserCreateDialogComponent, {
      width: '600px',
      data: {
        property: aadDeniedPlan.UID_AADDeniedServicePlan,
        title: '#LDS#Heading Assign Disabled Service Plan'
      }
    });

    dialogRef.afterClosed().subscribe(async (result) => {
      if (result) {
        try {
          this.aadService.handleOpenLoader();
          await this.aadService.createAadUserDeniedPlan(this.getUserKey(), aadDeniedPlan);
          await this.navigate();
        } finally {
          this.aadService.handleCloseLoader();
        }
      }
    });
  }

  public async removeUserDeniedPlans(): Promise<void> {
    try {
      this.aadService.handleOpenLoader();
      await this.aadService.removeAadUserDeniedPlans(this.getUserKey(), this.selectedUserDeniedPlans);
      await this.navigate();
      this.dataTable.clearSelection();
    } finally {
      this.aadService.handleCloseLoader();
    }
  }

  private async navigate(): Promise<void> {

    this.aadService.handleOpenLoader();
    try {
      const data = await this.aadService.getAadUserDeniedPlans(this.getUserKey(), this.navigationState);
      this.dstSettings = {
        displayedColumns: this.displayedColumns,
        dataSource: data,
        entitySchema: this.entitySchemaAadUserDeniedPlan,
        navigationState: this.navigationState,
        filters: this.filterOptions,
      };
      this.logger.debug(this, `Head at ${data.Data.length + this.navigationState.StartIndex} of ${data.totalCount} item(s)`);
    } finally {
      this.aadService.handleCloseLoader();
    }
  }

  private getUserKey(): string {
    return this.referrer.objectuid;
  }

}
