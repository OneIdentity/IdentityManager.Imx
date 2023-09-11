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
import { EuiLoadingService } from '@elemental-ui/core';

import { CollectionLoadParameters, EntitySchema, IClientProperty, DisplayColumns } from 'imx-qbm-dbts';
import { DataSourceToolbarSettings } from 'qbm';
import { DbQueueService } from './db-queue.service';

@Component({
  selector: 'imx-db-queue',
  templateUrl: './db-queue.component.html',
  styleUrls: ['./db-queue.component.scss'],
})
export class DbQueueComponent implements OnInit {

  public dstSettings: DataSourceToolbarSettings;
  public readonly entitySchema: EntitySchema;
  public readonly DisplayColumns = DisplayColumns;

  private navigationState: CollectionLoadParameters;
  private readonly displayedColumns: IClientProperty[];

  constructor(private readonly dbService: DbQueueService, private readonly busyService: EuiLoadingService) {
    this.entitySchema = dbService.DbSchema;
    this.displayedColumns = [
      this.entitySchema.Columns.UID_Task,
      this.entitySchema.Columns.CountProcessing,
      this.entitySchema.Columns.CountWaiting
    ];
  }

  public async ngOnInit(): Promise<void> {
    await this.getData({});
  }


  public onSearch(keywords: string): Promise<void> {
    return this.getData({ StartIndex: 0, search: keywords });
  }

  public async getData(navigationState: CollectionLoadParameters): Promise<void> {
    this.navigationState = { ...navigationState, ...{ OrderBy: 'SortOrder desc' } };

    let overlayRef: OverlayRef;
    setTimeout(() => (overlayRef = this.busyService.show()));
    try {
      const searchKeyword = this.navigationState.search || '';
      const dbQueue = await this.dbService.get(this.navigationState);

      dbQueue.Data = dbQueue.Data.filter((row) => {
        for (const column of this.displayedColumns) {
          const cellValue = row.GetEntity().GetColumn(column.ColumnName).GetDisplayValue().toLowerCase();
          if (cellValue.includes(searchKeyword.toLowerCase())) {
            return true;
          }
        }
        return false;
      });

      this.dstSettings = {
        displayedColumns: this.displayedColumns,
        dataSource: dbQueue,
        entitySchema: this.entitySchema,
        navigationState: this.navigationState,
      };
    } finally {
      setTimeout(() => this.busyService.hide(overlayRef));
    }
  }
}
