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

import { Component, Input, OnInit } from '@angular/core';
import _ from 'lodash';

import { BusyService, ClassloggerService, DataSourceToolbarGroupData, DataSourceToolbarSettings, createGroupData } from 'qbm';
import { CollectionLoadParameters, DataModel, DisplayColumns, EntitySchema } from 'imx-qbm-dbts';
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
  public groupData: DataSourceToolbarGroupData;

  private dataModel: DataModel;
  private reportColumns: string[];
  private navigationState: CollectionLoadParameters = {};

  constructor(private logger: ClassloggerService) {}

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
   * Updates the search parameter and navigates
   * @param key: the keyword, that should be searched for
   */
  public async onSearch(key: string): Promise<void> {
    this.navigationState = { ...this.navigationState, StartIndex: 0, search: key };
    return this.navigate();
  }

  /**
   * Updates the navigation state and navigates
   * @param newState: the new navigation state
   */
  public async onNavigationStateChanged(newState: CollectionLoadParameters): Promise<void> {
    this.navigationState = newState;
    return this.navigate();
  }

  /**
   * Is called, if the grouping changed.
   * Updates the grouping navigation state and navigates
   * @param groupKey the gouping keyword
   */
  public async onGroupingChange(groupInfo: { key: string; isInitial: boolean }): Promise<void> {
    const isBusy = this.busyService.beginBusy();

    try {
      const groupedData = this.groupData[groupInfo.key];
      const navigationState = { ...groupedData.navigationState };
      groupedData.data = groupInfo.isInitial ? { totalCount: 0, Data: [] } : await this.dataService.get(navigationState);
      groupedData.settings = {
        displayedColumns: this.dstSettings.displayedColumns,
        dataModel: this.dstSettings.dataModel,
        dataSource: groupedData.data,
        entitySchema: this.dstSettings.entitySchema,
        navigationState,
      };
    } finally {
      isBusy.endBusy();
    }
  }

  /**
   * navigates the list report data
   */
  private async navigate(): Promise<void> {
    const isBusy = this.busyService.beginBusy();
    try {
      const data = await this.dataService.get({ ...this.navigationState });

      //Apply new schema to data
      data.Data.forEach((elem) => elem.GetEntity().ApplySchema(this.entitySchema));

      const displayedColumns = this.reportColumns.map((elem) => this.entitySchema.Columns[elem]).filter((elem) => !!elem);
      if (displayedColumns.length === 0) {
        displayedColumns.push(DisplayColumns.DISPLAY_PROPERTY);
        this.logger.warn(this, 'There was a problem, loading the columns. The displays of the objects will be shown instead');
      }

      this.dstSettings = {
        dataSource: data,
        entitySchema: this.entitySchema,
        navigationState: this.navigationState,
        displayedColumns,
        dataModel: this.dataModel,
        groupData: this.groupData,
        filters: this.dataModel.Filters,
      };
    } finally {
      isBusy.endBusy();
    }
  }

  /**
   * Initializes the data, that is used for the view
   */
  private async initData(): Promise<void> {
    this.dataModel = await this.dataService.getDataModel();

    const data = await this.dataService.get({ PageSize: -1 });
    this.reportColumns = data.extendedData.Columns;

    // create a copy of listReportSchema and add additional columns to it (because the schema only provides the display at this point)
    this.entitySchema = _.cloneDeep(this.dataService.entitySchema) as any;

    for (const column of this.reportColumns) {
      (this.entitySchema.Columns[column] as any) = data.extendedData.AdditionalProperties.find((elem) => elem.ColumnName === column);
    }

    this.navigationState = { ...this.navigationState };

    if (this.reportParameter) {
      this.navigationState.parameters = this.reportParameter;
    }

    this.groupData = createGroupData(
      this.dataModel,
      (parameters) =>
        this.dataService.getGroupInfo({
          ...{
            PageSize: this.navigationState.PageSize,
            StartIndex: 0,
          },
          ...parameters,
        }),
      []
    );
  }
}
