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
 * Copyright 2021 One Identity LLC.
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
  CollectionLoadParameters, DataModel, DisplayColumns, EntitySchema, ExtendedTypedEntityCollection, IClientProperty, TypedEntity
} from 'imx-qbm-dbts';
import { DataModelWrapper } from './data-model/data-model-wrapper.interface';
import { createGroupData } from './data-model/data-model-helper';
import { DataSourceToolbarFilter } from './data-source-toolbar-filters.interface';
import { DataSourceToolbarGroupData } from './data-source-toolbar-groups.interface';
import { DataSourceToolbarSettings } from './data-source-toolbar-settings';

export class DataSourceWrapper<TEntity extends TypedEntity = TypedEntity, TExtendedData = any> {
  public readonly propertyDisplay: IClientProperty;

  public extendedData: TExtendedData;

  private parameters: CollectionLoadParameters;
  private readonly filterOptions: DataSourceToolbarFilter[];
  private dataModel: DataModel;
  private readonly groupData: DataSourceToolbarGroupData;

  constructor(
    private readonly getData: (parameters: CollectionLoadParameters) => Promise<ExtendedTypedEntityCollection<TEntity, TExtendedData>>,
    private readonly displayedColumns: IClientProperty[],
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

  public async getDstSettings(parameters?: CollectionLoadParameters): Promise<DataSourceToolbarSettings> {
    this.parameters = {
      ...this.parameters,
      ...parameters
    };

    const dataSource = await this.getData(this.parameters);

    this.extendedData = dataSource?.extendedData;

    if (dataSource) {
      return {
        dataSource,
        displayedColumns: this.displayedColumns,
        entitySchema: this.entitySchema,
        navigationState: this.parameters,
        filters: this.filterOptions,
        groupData: this.groupData,
        dataModel: this.dataModel,
        identifierForSessionStore: this.identifier
      };
    }

    return undefined;
  }

  public async getGroupDstSettings(parameters: CollectionLoadParameters): Promise<DataSourceToolbarSettings> {
    return {
      displayedColumns: this.displayedColumns,
      dataSource: await this.getData(parameters),
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
        ...{
          StartIndex: 0,
          PageSize: this.parameters?.PageSize
        },
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
