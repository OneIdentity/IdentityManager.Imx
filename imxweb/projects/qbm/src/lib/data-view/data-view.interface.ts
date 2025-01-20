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

import {
  CollectionLoadParameters,
  DataModel,
  EntitySchema,
  GroupInfo,
  GroupInfoData,
  IClientProperty,
  SqlWizardExpression,
  TypedEntityCollectionData,
} from '@imx-modules/imx-qbm-dbts';
import { FilterTreeParameter } from '../data-source-toolbar/data-model/filter-tree-parameter';
import { DataSourceToolbarExportMethod } from '../data-source-toolbar/data-source-toolbar-export-method.interface';
import { DataSourceToolbarViewConfig } from '../data-source-toolbar/data-source-toolbar-view-config.interface';

// Extends entity schema with a local column object to updates columns
export interface WritableEntitySchema extends EntitySchema {
  LocalColumns: {
    [id: string]: IClientProperty;
  };
}
// Type for execute function.
export type ExecuteFunction<T = any> = {
  (params: CollectionLoadParameters, signal: AbortSignal): Promise<TypedEntityCollectionData<T> | undefined>;
};
// Type for group execute function.
export type ExecuteGroupFunction = {
  (columnName: string, params: CollectionLoadParameters, signal: AbortSignal): Promise<GroupInfoData>;
};
// Type for table selection change function.
export type SelectionChangeFunction<T = any> = {
  (selection: readonly T[]): void;
};
// Type for table row highlight function.
export type HightlightEntityFunction<T = any> = {
  (entity: T): void;
};
// Enum for the data table filter
export enum SelectedFilterType {
  None,
  Keyword, // search keyword
  Custom, // expression filter
}

export interface KeywordFilter {
  type: SelectedFilterType.Keyword;
  value: string;
}

export interface ExpressionFilter {
  type: SelectedFilterType.Custom;
  value: SqlWizardExpression;
}
// Combined keyword and expression filter type.
export type SelectedFilter = KeywordFilter | ExpressionFilter;
// Group info interface with an expanded extension to handle group expanded actions.
export interface GroupInfoRow extends GroupInfo {
  expanded?: boolean;
}

// Interface for initialize data view.
export interface DataViewInitParameters<T = any> {
  execute: ExecuteFunction<T>;
  schema: EntitySchema;
  columnsToDisplay: IClientProperty[];
  dataModel?: DataModel;
  groupExecute?: ExecuteGroupFunction;
  exportFunction?: DataSourceToolbarExportMethod;
  viewConfig?: DataSourceToolbarViewConfig;
  uniqueConfig?: boolean;
  selectionChange?: SelectionChangeFunction<T>;
  filterTree?: FilterTreeParameter;
  highlightEntity?: HightlightEntityFunction<T>;
  localSource?: boolean;
  customIdentifier?: string;
}

/**
 * Interface for initialize data view with local data.
 */
export interface LocalDataViewInitParameters<T = any> extends Partial<DataViewInitParameters<T>> {
  /**
   * Local data to display.
   */
  data: T[];
  schema: EntitySchema;
  columnsToDisplay: IClientProperty[];
}
