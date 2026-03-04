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
 * Copyright 2025 One Identity LLC.
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
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatMenuModule } from '@angular/material/menu';
import { MatRadioModule } from '@angular/material/radio';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTreeModule } from '@angular/material/tree';
import { EuiCoreModule, EuiMaterialModule } from '@elemental-ui/core';
import { DisplayColumns, EntitySchema } from '@imx-modules/imx-qbm-dbts';
import { TranslateModule } from '@ngx-translate/core';
import { BusyIndicatorModule, BusyService, ClientPropertyForTableColumns, DataViewModule, DataViewSource, HelpContextualModule, LdsReplaceModule, LocalDataViewInitParameters } from 'qbm';
import { PortalDgeClassificationSummary } from '../TypedClient'; // Adjust import as needed
import { DugResourceOverviewService } from './dug-resource-overview.service';


@Component({
  selector: 'imx-dug-resource-overview',
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatExpansionModule,
    MatMenuModule,
    MatRadioModule,
    MatTabsModule,
    MatTooltipModule,
    MatTreeModule,
    TranslateModule,
    EuiCoreModule,
    EuiMaterialModule,
    BusyIndicatorModule,
    HelpContextualModule,
    LdsReplaceModule,
    DataViewModule
  ],
  providers: [DataViewSource],
  templateUrl: './dug-resource-overview.component.html',
  styleUrl: './dug-resource-overview.component.scss'
})
export class DugResourceOverviewComponent implements OnInit {
  public readonly DisplayColumns = DisplayColumns;
  public displayedColumns: ClientPropertyForTableColumns[] = [];
  public entitySchema: EntitySchema;
  public busyService = new BusyService();

  constructor(
    private readonly dugResourceOverviewService: DugResourceOverviewService,
    public dataSource: DataViewSource<PortalDgeClassificationSummary>
  ) {
    this.entitySchema = this.dugResourceOverviewService.DugResourceOverviewSchema;
    this.displayedColumns = [
      this.entitySchema.Columns.DisplayValue,
      this.entitySchema.Columns.CountResources,
      this.entitySchema.Columns.CountResourcesNotOwned,
      this.entitySchema.Columns.CountResourcesOwned,
      this.entitySchema.Columns.PercentResourcesNotOwned,
      this.entitySchema.Columns.CountResourceOwners
    ];
  }

  public async ngOnInit(): Promise<void> {
    const isBusy = this.busyService.beginBusy();
    try {
      await this.getData();
    } finally {
      isBusy.endBusy();
    }
  }

  public async getData(): Promise<void> {
    const data = await this.dugResourceOverviewService.getData();
    const dataViewInitParameters: LocalDataViewInitParameters<PortalDgeClassificationSummary> = {
      data: data.Data,
      columnsToDisplay: this.displayedColumns,
      schema: this.entitySchema,
    };
    this.dataSource.initLocal(dataViewInitParameters);
  }
}