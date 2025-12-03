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
import { CollectionLoadParameters, DataModel, EntitySchema, IClientProperty, TypedEntityCollectionData, ValType } from '@imx-modules/imx-qbm-dbts';
import { BusyService, DataViewInitParameters, DataViewSource, HELP_CONTEXTUAL, HelpContextualValues, SideNavigationComponent } from 'qbm';
import { PortalDgeNodes } from '../TypedClient';
import { AuditingGovernedDataService } from './auditing-governed-data.service';

@Component({
  selector: 'imx-auditing-governed-data',
  templateUrl: './auditing-governed-data.component.html',
  styleUrl: './auditing-governed-data.component.scss',
  providers: [DataViewSource],
})
export class AuditingGovernedDataComponent implements OnInit{
  
  public busyService = new BusyService();
  public entitySchema : EntitySchema;
  public uidNode: string = '';
  public isGovernedDataView:boolean = false;
  

  private displayedColumns: IClientProperty[] = [];
  private dataModel: DataModel;

  constructor(public readonly aditingDUGService: AuditingGovernedDataService, public dataSource: DataViewSource<PortalDgeNodes>,) {}

  public async ngOnInit(): Promise<void> {
    const isBusy = this.busyService.beginBusy();
    try {
      this.entitySchema = this.aditingDUGService.getNodesSchema;
      this.displayedColumns = [
        this.entitySchema.Columns.DisplayValue,
        this.entitySchema.Columns.NodeType,
        this.entitySchema.Columns.TotalDuGResources,
        this.entitySchema.Columns.TotalPointsOfInterest,
        {
          ColumnName: 'actions',
          Type: ValType.String
        },
      ];
      const dataViewInitParameters: DataViewInitParameters<PortalDgeNodes> = {
            execute: async (params: CollectionLoadParameters,
              signal: AbortSignal,): Promise<TypedEntityCollectionData<PortalDgeNodes>> => {
              const data = await this.aditingDUGService.getData(params, signal);
              return data;
            },
            dataModel: this.dataModel,
            schema: this.entitySchema,
            columnsToDisplay: this.displayedColumns,
          };
      this.dataSource.init(dataViewInitParameters);
    } finally {
      isBusy.endBusy();
    }
  }

  public showGovernedData(item: PortalDgeNodes): void {
    this.uidNode = item?.UID_QAMNode?.value;
    this.isGovernedDataView = true;
  }

  public closeGovernedDataView(): void {
    this.isGovernedDataView = false;
    this.uidNode = '';
  }

}
