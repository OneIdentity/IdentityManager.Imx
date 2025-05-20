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
import { TranslateService } from '@ngx-translate/core';


import { BusyService, DataSourceToolbarSettings } from 'qbm';
import { DisplayColumns, EntitySchema, IClientProperty, ValType } from '@imx-modules/imx-qbm-dbts';
import { DugReportEntity } from './dug-report-entity';
import { DugReportService } from './dug-reports.service';

@Component({
  selector: 'imx-dug-reports',
  templateUrl: './dug-reports.component.html',
  styleUrls: ['./dug-reports.component.scss'],
})
export class DugReportsComponent implements OnInit {
  @Input() public dugUid: string;
  public busyService = new BusyService();
  public dstSettings: DataSourceToolbarSettings;
  public entitySchema: EntitySchema;
  private displayedColumns: IClientProperty[] = [];
  public readonly DisplayColumns = DisplayColumns;

  constructor(private readonly dugReportService: DugReportService, translateService: TranslateService) {
    this.entitySchema = DugReportEntity.GetEntitySchema(translateService);
    this.displayedColumns = [this.entitySchema.Columns.ReportDisplayName, this.entitySchema.Columns.Description, {ColumnName: 'action', Type: ValType.String}];
  }

  public async ngOnInit(): Promise<void> {
    return this.getData();
  }

  private async getData(): Promise<void> {
    const isBusy = this.busyService.beginBusy();
    try {
      const data = await this.dugReportService.getReports(this.dugUid);

      this.dstSettings = {
        displayedColumns: this.displayedColumns,
        dataSource: data,
        entitySchema: this.entitySchema,
        navigationState: {},
      };
    } finally {
      isBusy.endBusy();
    }
  }
}
