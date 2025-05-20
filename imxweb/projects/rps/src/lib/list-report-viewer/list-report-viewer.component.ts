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

import { ListReportContentData, PortalReportData } from '@imx-modules/imx-api-rps';
import {
  CollectionLoadParameters,
  DataModel,
  DisplayColumns,
  EntitySchema,
  ExtendedTypedEntityCollection,
  TypedEntity,
} from '@imx-modules/imx-qbm-dbts';
import {
  BusyService,
  ClassloggerService,
  DataSourceToolbarSettings,
  DataTableGroupedData,
  DataViewInitParameters,
  DataViewSource,
} from 'qbm';
import { ListReportDataProvider } from './list-report-data-provider.interface';

/**
 * A component, that displays the data of a list report
 *
 * Example:
 * code behind:
 *          dataService:ListReportDataProvider = {...};
 *          reportParameter:{ [key: string]: any } = {...};
 * html:
 *          <imx-list-report-viewer [dataService]="dataService" [reportParameter]="reportParameter"></imx-list-report-viewer>
 */
@Component({
  selector: 'imx-list-report-viewer',
  templateUrl: './list-report-viewer.component.html',
  styleUrls: ['./list-report-viewer.component.scss'],
  providers: [DataViewSource],
})
export class ListReportViewerComponent implements OnInit {
  /**
   * the data service, that is used for API communication
   */
  @Input() public dataService: ListReportDataProvider;

  /**
   * Report parameter, that are necessary for the report generation
   */
  @Input() public reportParameter: { [key: string]: any };

  public busyService = new BusyService();
  public dstSettings: DataSourceToolbarSettings;
  public entitySchema: EntitySchema;
  public groupedData: { [key: string]: DataTableGroupedData } = {};

  private dataModel: DataModel;
  private reportColumns: string[];
  private navigationState: CollectionLoadParameters = {};

  constructor(
    private logger: ClassloggerService,
    public dataSource: DataViewSource,
  ) {}

  public async ngOnInit(): Promise<void> {
    const isBusy = this.busyService.beginBusy();
    try {
      await this.initData();
      await this.navigate();
    } finally {
      isBusy.endBusy();
    }
  }

  /**
   * navigates the list report data
   */
  private async navigate(): Promise<void> {
    const columnsToDisplay = this.reportColumns.map((elem) => this.entitySchema.Columns[elem]).filter((elem) => !!elem);
    if (columnsToDisplay.length === 0) {
      columnsToDisplay.push(DisplayColumns.DISPLAY_PROPERTY);
      this.logger.warn(this, 'There was a problem, loading the columns. The displays of the objects will be shown instead');
    }
    const dataViewInitParameters: DataViewInitParameters<TypedEntity> = {
      execute: async (
        params: CollectionLoadParameters,
      ): Promise<ExtendedTypedEntityCollection<PortalReportData, ListReportContentData>> => {
        this.navigationState = { ...this.navigationState, ...params };
        const data = await this.dataService.get(this.navigationState);

        //Apply new schema to data
        data.Data.forEach((elem) => elem.GetEntity().ApplySchema(this.entitySchema));
        return data;
      },
      groupExecute: (column: string, params: CollectionLoadParameters, signal: AbortSignal) => {
        return this.dataService.getGroupInfo({
          ...{ by: column },
          ...params,
        });
      },
      schema: this.entitySchema,
      columnsToDisplay,
      dataModel: this.dataModel,
      exportFunction: this.dataService.exportReports?.(),
    };
    await this.dataSource.init(dataViewInitParameters);
  }

  /**
   * Initializes the data, that is used for the view
   */
  private async initData(): Promise<void> {
    this.dataModel = await this.dataService.getDataModel();

    const data = await this.dataService.get({ PageSize: -1 });
    if (data.extendedData?.Columns) {
      this.reportColumns = data.extendedData.Columns;
    }

    // create a copy of listReportSchema and add additional columns to it (because the schema only provides the display at this point) and update the TypeName property
    this.entitySchema = { ...this.dataService.entitySchema, TypeName: data.tableName };

    for (const column of this.reportColumns) {
      (this.entitySchema.Columns[column] as any) = data.extendedData?.AdditionalProperties?.find((elem) => elem.ColumnName === column);
    }

    this.navigationState = { ...this.navigationState };

    if (this.reportParameter) {
      this.navigationState.parameters = this.reportParameter;
    }
  }
}
