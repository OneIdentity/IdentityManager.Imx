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

import { Injectable } from '@angular/core';
import { ParameterData } from 'imx-api-qer';

import { EntityCollectionData, EntityWriteDataColumn, FkProviderItem, IClientProperty, IEntity, IEntityColumn, TypedEntity } from 'imx-qbm-dbts';
import { ReadWriteEntityColumn } from 'imx-qbm-dbts/dist/ReadWriteEntityColumn';
import { ClassloggerService, EntityService } from 'qbm';
import { ExtendedCollectionData, ExtendedDataWrapper } from './extended-collection-data.interface';
import { ParameterCategoryColumn } from './parameter-category-column.interface';
import { ParameterCategory } from './parameter-category.interface';
import { ParameterDataContainer } from './parameter-data-container';
import { ParameterDataFkProviderItem } from './parameter-data-fk-provider-item';
import { ParameterDataLoadParameters } from './parameter-data-load-parameters.interface';
import { ParameterDataWrapper } from './parameter-data-wrapper.interface';

@Injectable({
  providedIn: 'root'
})
export class ParameterDataService {
  constructor(private readonly entityService: EntityService,
    private readonly logger: ClassloggerService
  ) { }

  public hasParameters(parmeterDataWrapper: ParameterDataWrapper): boolean {
    return Object.values(parmeterDataWrapper.Parameters ?? {}).some(item => item[parmeterDataWrapper.index]?.length > 0);
  }

  public getEntityWriteDataColumns(
    parameterCategoryColumns: ParameterCategoryColumn[]
  ): { [parameterCategoryName: string]: EntityWriteDataColumn[][] } {
    const extendedData = {};

    parameterCategoryColumns.forEach(item => {
      if (extendedData[item.parameterCategoryName] == null) {
        extendedData[item.parameterCategoryName] = [[]];
      }

      extendedData[item.parameterCategoryName][0].push({
        Name: item.column.ColumnName,
        Value: item.column.GetValue()
      })
    });

    return extendedData;
  }

  public createExtendedDataWrapper<TData>(
    entity: IEntity,
    extendedCollectionData: ExtendedCollectionData<TData>,
    getCandidates: (loadParameters: ParameterDataLoadParameters) => Promise<EntityCollectionData>
  ): ExtendedDataWrapper<TData> {
    const parameterWrapper = this.createContainer(
      entity,
      extendedCollectionData,
      getCandidates
    );

    return {
      data: extendedCollectionData.Data?.[extendedCollectionData.index],
      parameterWrapper
    };
  }

  public createParameterCategories(parmeterDataWrapper: ParameterDataWrapper): ParameterCategory[] {
    const extendedParameterData = parmeterDataWrapper.Parameters;
    const index = parmeterDataWrapper.index;

    const parameterCategories = [];

    Object.keys(extendedParameterData).forEach(parameterCategoryName => {
      const parameterCategory = extendedParameterData[parameterCategoryName];
      if (parameterCategory && index < parameterCategory.length && parameterCategory[index]) {
        parameterCategories.push({
          name: parameterCategoryName,
          parameters: parameterCategory[index]
        });
      }
    });

    return parameterCategories;
  }

  public createParameterCategoryColumns(
    parameterCategories: ParameterCategory[],
    getFkProviderItems: (parameter: ParameterData) => FkProviderItem[]
  ): ParameterCategoryColumn[] {
    const columns = [];


    parameterCategories.forEach(category =>
      category.parameters.forEach(parameter =>
        columns.push({
          parameterCategoryName: category.name,
          column: this.entityService.createLocalEntityColumn(
            parameter.Property,
            getFkProviderItems(parameter),
            parameter.Value
          )
        })
      )
    );

    return columns;
  }

  public createInteractiveParameterCategoryColumns(
    parameterCategories: ParameterCategory[],
    getFkProviderItems: (parameter: ParameterData) => FkProviderItem[],
    typedEntity: TypedEntity
  ): ParameterCategoryColumn[] {
    const columns = [];

    const parameterObjects = new Map<string, ParameterData & { column: ReadWriteEntityColumn }>();

    parameterCategories.forEach(category =>
      category.parameters.forEach(parameter => {
        const column = <ReadWriteEntityColumn>this.entityService.createLocalEntityColumn(
          parameter.Property,
          getFkProviderItems(parameter),
          parameter.Value,
          async (oldValue, newValue) => {

            // a single value has changed -> update extendedData to send to server
            const extendedData = {};

            extendedData[category.name] = [[{
              Name: parameter.Property.ColumnName,
              Value: newValue
            }]];

            typedEntity.extendedData = extendedData;
          }
        );
        // save parameter for later use
        parameterObjects.set(category.name + "_" + parameter.Property.ColumnName, {
          ...parameter,
          column: column
        });
        columns.push({
          parameterCategoryName: category.name,
          column: column
        });
      })
    );

    typedEntity.onChangeExtendedDataRead(() => {
      // new parameters from server --> sync local entity
      const newParameters: { [key: string]: ParameterData[][]; } = typedEntity.extendedDataRead.Parameters;
      const newCategories = this.createParameterCategories({ Parameters: newParameters, index: 0 });
      newCategories.forEach(category =>
        category.parameters.forEach(parameter => {
          const lookupKey = category.name + "_" + parameter.Property.ColumnName;
          // save parameter for later use
          const existingParameter = parameterObjects.get(lookupKey);
          if (existingParameter) {
            this.logger.trace(this, "updating parameter " + lookupKey);
            // assign new value and metadata
            Object.assign(existingParameter.Property, parameter.Property);
            existingParameter.column.apply(parameter.Value);
          }
          else {
            // TODO: add parameters not previously known
            this.logger.warn(this, "Not updating unknown parameter " + lookupKey);
          }

          // TODO: remove parameters not returned by the server
        }));
    });

    return columns;
  }

  public createContainer<TData>(
    entity: IEntity,
    extendedCollectionData: ExtendedCollectionData<TData>,
    getCandidates: (loadParameters: ParameterDataLoadParameters) => Promise<EntityCollectionData>
  ): ParameterDataContainer {
    if (extendedCollectionData?.Parameters == null) {
      return undefined;
    }

    const columns = {};

    Object.keys(extendedCollectionData.Parameters).forEach(parameterCategoryName => {
      const parameterCategory = extendedCollectionData.Parameters[parameterCategoryName];
      if (parameterCategory && parameterCategory[extendedCollectionData.index]) {
        columns[parameterCategoryName] = [];
        parameterCategory[extendedCollectionData.index].forEach(parameterData =>
          columns[parameterCategoryName].push(this.entityService.createLocalEntityColumn(
            parameterData.Property,
            this.createItems(
              entity,
              parameterData.Property,
              loadParameters => getCandidates(loadParameters)
            ),
            parameterData.Value
          ))
        );
      }
    });

    return new ParameterDataContainer(columns);
  }

  public createParameterColumns(
    entity: IEntity,
    parameters: ParameterData[],
    getCandidates: (loadParameters: ParameterDataLoadParameters) => Promise<EntityCollectionData>
  ): IEntityColumn[] {
    return parameters.map(parameterData =>
      this.entityService.createLocalEntityColumn(
        parameterData.Property,
        this.createItems(
          entity,
          parameterData.Property,
          loadParameters => getCandidates(loadParameters)
        ),
        parameterData.Value
      )
    );
  }

  private createItems(
    entity: IEntity,
    property: IClientProperty,
    getCandidates: (loadParameters: ParameterDataLoadParameters) => Promise<EntityCollectionData>
  ): FkProviderItem[] {
    if (property.FkRelation) {
      return [
        new ParameterDataFkProviderItem(property.ColumnName, property.FkRelation.ParentTableName, entity, getCandidates)
      ];
    }

    if (property.ValidReferencedTables) {
      return property.ValidReferencedTables.map(parentTableRef =>
        new ParameterDataFkProviderItem(property.ColumnName, parentTableRef.TableName, entity, getCandidates)
      );
    }

    return [];
  }
}
