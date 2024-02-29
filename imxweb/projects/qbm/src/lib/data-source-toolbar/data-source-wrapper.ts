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

import {
  ApiRequestOptions,
  CollectionLoadParameters, DataModel, DisplayColumns, EntitySchema, ExtendedTypedEntityCollection, IClientProperty, TypedEntity
} from 'imx-qbm-dbts';
import { DataModelWrapper } from './data-model/data-model-wrapper.interface';
import { createGroupData } from './data-model/data-model-helper';
import { DataSourceToolbarFilter } from './data-source-toolbar-filters.interface';
import { DataSourceToolbarGroupData } from './data-source-toolbar-groups.interface';
import { DataSourceToolbarSettings } from './data-source-toolbar-settings';
import { ClientPropertyForTableColumns } from './client-property-for-table-columns';

export class DataSourceWrapper<TEntity extends TypedEntity = TypedEntity, TExtendedData = any> {
  public readonly propertyDisplay: IClientProperty;

  public extendedData: TExtendedData;

  private parameters: CollectionLoadParameters;
  private readonly filterOptions: DataSourceToolbarFilter[];
  private dataModel: DataModel;
  private readonly groupData: DataSourceToolbarGroupData;

  constructor(
    private readonly getData: (parameters: CollectionLoadParameters, requestOpts?: ApiRequestOptions) => Promise<ExtendedTypedEntityCollection<TEntity, TExtendedData>>,
    private readonly displayedColumns: ClientPropertyForTableColumns[],
    private readonly entitySchema: EntitySchema,
    dataModelWrapper?: DataModelWrapper,
    private readonly identifier?: string
  ) {
    this.propertyDisplay = this.entitySchema.Columns[DisplayColumns.DISPLAY_PROPERTYNAME];

    if (dataModelWrapper) {
      this.dataModel = dataModelWrapper.dataModel;
      this.filterOptions = dataModelWrapper.dataModel.Filters;
      this.groupData = this.createGroupData(dataModelWrapper);
    }
  }

  public async getDstSettings(parameters?: CollectionLoadParameters, requestOpts?: ApiRequestOptions ): Promise<DataSourceToolbarSettings> {
    this.parameters = {
      ...this.parameters,
      ...parameters
    };

    const dataSource = await this.getData(this.parameters, requestOpts);

    this.extendedData = dataSource?.extendedData;

    if (dataSource) {
      return {
        dataSource,
        displayedColumns: this.displayedColumns,
        entitySchema: this.entitySchema,
        navigationState: this.parameters,
        filters: this.filterOptions,
        groupData: this.groupData,
        dataModel: this.dataModel
      };
    }

    return undefined;
  }

  public async getGroupDstSettings(parameters: CollectionLoadParameters, requestOpts?: ApiRequestOptions): Promise<DataSourceToolbarSettings> {
    return {
      displayedColumns: this.displayedColumns,
      dataModel: this.dataModel,
      dataSource: await this.getData(parameters, requestOpts),
      entitySchema: this.entitySchema,
      navigationState: parameters
    };
  }

  private createGroupData(dataModelWrapper: DataModelWrapper): DataSourceToolbarGroupData {
    return createGroupData(
      dataModelWrapper.dataModel,
      parameters => dataModelWrapper.getGroupInfo({
        ...parameters,
        ...this.getGroupingFilterOptionParameters(dataModelWrapper.groupingFilterOptions),
      }),
      dataModelWrapper.groupingExcludedColumns
    );
  }

  private getGroupingFilterOptionParameters(groupingFilterOptions: string[]): { [parameterName: string]: string } {
    const parameters = {};

    groupingFilterOptions?.forEach(filterOptionName =>
      parameters[filterOptionName] = this.filterOptions.find(item => item.Name === filterOptionName)?.CurrentValue
    );

    return parameters;
  }
}
