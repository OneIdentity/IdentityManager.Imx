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

import { Component, OnInit } from '@angular/core';
import { EuiLoadingService } from '@elemental-ui/core';
import { DugActivitiesService } from './dug-activities.service';
import { ResourceActivityData, TrusteeActivityData } from '../TypedClient';
import { DugActivityEntity } from './dug-activity-entity';
import { TranslateService } from '@ngx-translate/core';
import { DisplayColumns, EntitySchema } from '@imx-modules/imx-qbm-dbts';
import { DataSourceToolbarSettings } from 'qbm';

@Component({
  selector: 'imx-dug-activities',
  templateUrl: './dug-activities.component.html',
  styleUrls: ['./dug-activities.component.scss'],
})
export class DugActivitiesComponent implements OnInit {
  private mostActiveTrustees: TrusteeActivityData[];
  private mostActiveResources: ResourceActivityData[];

  public entitySchemaTrustee: EntitySchema;
  public entitySchemaResource: EntitySchema;

  public dstSettingsTrustee: DataSourceToolbarSettings;
  public dstSettingsResource: DataSourceToolbarSettings;
  public DisplayColumns = DisplayColumns;

  private displayColumnsTrustee;
  private displayColumnsResource;

  public topCountResource: number = 10;
  public topCountTrustee: number = 10;

  public interval: number = 0;

  constructor(
    public readonly activityService: DugActivitiesService,
    private readonly loadingServiceEui: EuiLoadingService,
    private readonly translateService: TranslateService,
  ) {}

  public async ngOnInit(): Promise<void> {
    const over = this.loadingServiceEui.show();
    try {
      this.entitySchemaTrustee = DugActivityEntity.GetEntitySchema('Trustee', '#LDS#Trustee', this.translateService);
      this.entitySchemaResource = DugActivityEntity.GetEntitySchema('Resources', '#LDS#Resources', this.translateService);
      this.mostActiveTrustees = await this.activityService.getMostActiveTrustees();
      this.mostActiveResources = await this.activityService.getMostActiveResources();
      const config = await this.activityService.getConfig();
      this.interval = config.ActivityAggregationIntervalDays;
      this.displayColumnsTrustee = [
        this.entitySchemaTrustee.Columns[DisplayColumns.DISPLAY_PROPERTYNAME],
        this.entitySchemaTrustee.Columns['CountActivities'],
      ];
      this.displayColumnsResource = [
        this.entitySchemaResource.Columns[DisplayColumns.DISPLAY_PROPERTYNAME],
        this.entitySchemaResource.Columns['CountActivities'],
      ];
      this.initTrustee();
      this.initResources();

    } finally {
      this.loadingServiceEui.hide(over);
    }
  }

  public initTrustee() {
    const data = DugActivityEntity.buildEntities(
      DugActivityEntity.buildEntityDataTrustee(this.mostActiveTrustees),
      this.entitySchemaTrustee,
    );
    this.dstSettingsTrustee = {
      displayedColumns:this.displayColumnsTrustee,
      dataSource: data,
      entitySchema: this.entitySchemaTrustee,
      navigationState: {},
    };
  }

  public initResources() {
    const data = DugActivityEntity.buildEntities(
      DugActivityEntity.buildEntityDataTrustee(this.mostActiveResources),
      this.entitySchemaResource,
    );
    this.dstSettingsResource = {
      displayedColumns:this.displayColumnsResource,
      dataSource: data,
      entitySchema: this.entitySchemaResource,
      navigationState: {},
    };
  }
}
