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
import { TypedEntityCollectionData } from '@imx-modules/imx-qbm-dbts';
import { TranslateService } from '@ngx-translate/core';
import { ClientPropertyForTableColumns, DataViewSource } from 'qbm';
import { ChartDataTyped } from '../chart-data-typed';
import { ChartTableService } from './chart-table-service.service';

@Component({
  selector: 'imx-chart-table',
  templateUrl: './chart-table.component.html',
  styleUrls: ['./chart-table.component.scss'],
  providers: [DataViewSource],
})
export class ChartTableComponent implements OnInit {
  @Input() public tableData: TypedEntityCollectionData<ChartDataTyped>;
  @Input() public hasUniqueObjectDisplay: boolean;

  public pageSize = 50;

  constructor(
    public chartTableService: ChartTableService,
    public dataSource: DataViewSource<ChartDataTyped>,
    private translate: TranslateService,
  ) {}

  public async ngOnInit(): Promise<void> {
    const schema = ChartDataTyped.GetEntitySchema();
    const displayedColumns: ClientPropertyForTableColumns[] = [
      schema.Columns.Name,
      schema.Columns.Value,
      schema.Columns.Percentage,
      schema.Columns.Date,
    ];
    if (this.hasUniqueObjectDisplay) {
      displayedColumns.splice(1, 0, schema.Columns.ObjectDisplay);
    }
    for await (const column of displayedColumns) {
      column.Display = column.Display == null ? '' : await this.translate.get(column.Display).toPromise();
    }
    this.dataSource.initLocal({
      data: this.tableData.Data,
      schema,
      columnsToDisplay: displayedColumns,
    });
  }
}
