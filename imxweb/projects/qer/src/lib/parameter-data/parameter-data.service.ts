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

import { Injectable } from '@angular/core';
import {
  ParameterData,
  ReadWriteExtTypedEntity,
  EntityCollectionData, EntityWriteDataColumn, FkProviderItem, IClientProperty, IEntity, IEntityColumn, FilterTreeData,
  IFkCandidateProvider,
} from 'imx-qbm-dbts';
import { ClassloggerService, EntityService, ImxTranslationProviderService } from 'qbm';
import { ExtendedCollectionData, ExtendedDataWrapper } from './extended-collection-data.interface';
import { ParameterCategoryColumn } from './parameter-category-column.interface';
import { ParameterCategory } from './parameter-category.interface';
import { ParameterContainer } from './parameter-container';
import { ParameterDataContainer } from './parameter-data-container';
import { ParameterDataFkProviderItem } from './parameter-data-fk-provider-item';
import { ParameterDataLoadParameters } from './parameter-data-load-parameters.interface';
import { ParameterDataWrapper } from './parameter-data-wrapper.interface';

// todo: move to QBM!

type CategoryParameterWrite = { [id: string]: EntityWriteDataColumn[][] };

@Injectable({
  providedIn: 'root'
})
export class ParameterDataService {
  constructor(public readonly entityService: EntityService,
    private readonly translator: ImxTranslationProviderService,
    public readonly logger: ClassloggerService
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
    getCandidates: (loadParameters: ParameterDataLoadParameters) => Promise<EntityCollectionData>,
    getFilterTree: (loadParameters:ParameterDataLoadParameters) => Promise<FilterTreeData>
  ): ExtendedDataWrapper<TData> {
    const parameterWrapper = this.createContainer(
      entity,
      extendedCollectionData,
      getCandidates,
      getFilterTree
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

  /** Builds a set of entity columns for a simple array of parameters. */
  public createInteractiveParameterColumns(
    parameters: ParameterData[],
    getFkProvider: (parameter: ParameterData) => IFkCandidateProvider,
    typedEntity: ReadWriteExtTypedEntity<ParameterData[][], EntityWriteDataColumn[][]>
  ): IEntityColumn[] {
    const columns: IEntityColumn[] = [];
    const container = new ParameterContainer(this.translator, getFkProvider, this.logger, typedEntity);

    typedEntity.onChangeExtendedDataRead(() => {
      // new parameters from server --> sync local entity
      const newParameters: ParameterData[] = typedEntity.extendedDataRead[0];

      newParameters.forEach(parameter => {
        container.update(parameter.Property.ColumnName, parameter);
        // TODO: remove parameters not returned by the server
      });
    });

    parameters.forEach(parameter => {
      const extendedDataGenerator = newValue => [[{
        Name: parameter.Property.ColumnName,
        Value: newValue
      }]];
      const column = container.add(parameter.Property.ColumnName, parameter, extendedDataGenerator);
      columns.push(column);
    });

    return columns;
  }

  /** Builds a set of entity columns for parameters, when parameters are organized in categories. */
  public createInteractiveParameterCategoryColumns(
    parameterCategories: ParameterCategory[],
    getFkProvider: (parameter: ParameterData) => IFkCandidateProvider,
    typedEntity: ReadWriteExtTypedEntity<{ Parameters?: { [key: string]: ParameterData[][]; } }, CategoryParameterWrite>,
    callbackOnChange?: () => void
  ): ParameterCategoryColumn[] {
    const columns = [];
    const container = new ParameterContainer(this.translator, getFkProvider, this.logger, typedEntity);

    typedEntity.onChangeExtendedDataRead(() => {
      // new parameters from server --> sync local entity
      const newParameters = typedEntity.extendedDataRead.Parameters;
      const newCategories = this.createParameterCategories({ Parameters: newParameters, index: 0 });
      newCategories.forEach(category =>
        category.parameters.forEach(parameter => {
          const lookupKey = category.name + "_" + parameter.Property.ColumnName;
          container.update(lookupKey, parameter);
          // TODO: remove parameters not returned by the server
        }));

      if (callbackOnChange)
        callbackOnChange();
    });

    parameterCategories.forEach(category =>
      category.parameters.forEach(parameter => {

        const extendedDataGenerator = newValue => {
          const extendedData: CategoryParameterWrite = {};
          extendedData[category.name] = [[{
            Name: parameter.Property.ColumnName,
            Value: newValue
          }]];
          return extendedData;
        };

        const column = container.add(category.name + "_" + parameter.Property.ColumnName, parameter, extendedDataGenerator);
        columns.push({
          parameterCategoryName: category.name,
          column: column
        });
      })
    );

    return columns;
  }

  public createContainer<TData>(
    entity: IEntity,
    extendedCollectionData: ExtendedCollectionData<TData>,
    getCandidates: (loadParameters: ParameterDataLoadParameters) => Promise<EntityCollectionData>,
    getFilterTree: (loadParameters:ParameterDataLoadParameters) => Promise<FilterTreeData>
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
              loadParameters => getCandidates(loadParameters),
              treeParameters => getFilterTree(treeParameters)
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
    getCandidates: (loadParameters: ParameterDataLoadParameters) => Promise<EntityCollectionData>,
    getFilterTree: (loadParameters:ParameterDataLoadParameters) => Promise<FilterTreeData>
  ): IEntityColumn[] {
    return parameters.map(parameterData =>
      this.entityService.createLocalEntityColumn(
        parameterData.Property,
        this.createItems(
          entity,
          parameterData.Property,
          loadParameters => getCandidates(loadParameters),
          treeparameters =>getFilterTree(treeparameters)
        ),
        parameterData.Value
      )
    );
  }

  private createItems(
    entity: IEntity,
    property: IClientProperty,
    getCandidates: (loadParameters: ParameterDataLoadParameters) => Promise<EntityCollectionData>,
    getFilterTree: (loadParameters:ParameterDataLoadParameters) => Promise<FilterTreeData>
  ): FkProviderItem[] {
    if (property.FkRelation) {
      return [
        new ParameterDataFkProviderItem(property.ColumnName, property.FkRelation.ParentTableName, entity, getCandidates , getFilterTree)
      ];
    }

    if (property.ValidReferencedTables) {
      return property.ValidReferencedTables.map(parentTableRef =>
        new ParameterDataFkProviderItem(property.ColumnName, parentTableRef.TableName, entity, getCandidates , getFilterTree)
      );
    }

    return [];
  }
}
