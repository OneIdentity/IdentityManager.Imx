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
import { DisplayColumns, EntitySchema, IClientProperty } from '@imx-modules/imx-qbm-dbts';
import { DataSourceToolbarSettings } from 'qbm';
import { PortalDgeResourcesActivity } from '../../TypedClient';

@Component({
  selector: 'imx-dug-activity',
  templateUrl: './dug-activity.component.html',
  styleUrls: ['./dug-activity.component.scss'],
})
export class DugActivityComponent implements OnInit {
  @Input() public interval: number;
  @Input() public activities: PortalDgeResourcesActivity[];

  private displayedColumns: IClientProperty[] = [];
  public readonly DisplayColumns = DisplayColumns;
  public entitySchema: EntitySchema;
  public dstSettings: DataSourceToolbarSettings;

  constructor() {
    this.entitySchema = PortalDgeResourcesActivity.GetEntitySchema();
    this.displayedColumns = [
      this.entitySchema.Columns.UID_QAMTrustee,
      this.entitySchema.Columns.Operation,
      this.entitySchema.Columns.Resources,
      this.entitySchema.Columns.Activities,
    ];
  }

  public async ngOnInit(): Promise<void> {
    this.dstSettings = {
      dataSource: { Data: this.activities, totalCount: this.activities.length },
      entitySchema: this.entitySchema,
      navigationState: {},
      displayedColumns: this.displayedColumns,
    };
  }
}
