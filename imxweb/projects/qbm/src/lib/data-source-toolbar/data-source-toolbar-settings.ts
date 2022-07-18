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
 * Copyright 2022 One Identity LLC.
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

import { TypedEntity, TypedEntityCollectionData, CollectionLoadParameters, EntitySchema, DataModel } from 'imx-qbm-dbts';
import { ClientPropertyForTableColumns } from './client-property-for-table-columns';
import { FilterTreeParameter } from './data-model/filter-tree-parameter';
import { DataSourceToolbarFilter } from './data-source-toolbar-filters.interface';
import { DataSourceToolbarGroupData } from './data-source-toolbar-groups.interface';

/**
 * Settings of a datasource toolbar.
 */
export interface DataSourceToolbarSettings {
  /**
   * The datasource of the toolbar.
   * Basically this is a collection of typed entities.
   */
  dataSource: TypedEntityCollectionData<TypedEntity>;

  /**
   * Describes which chunk of data is currently loaded.
   */
  navigationState: CollectionLoadParameters;

  /**
   * The schema of the typed entity.
   */
  entitySchema: EntitySchema;

  /**
   * Indicates which properties should be shown.
   * If undefined, all properties of the typed entity should be visible.
   */
  displayedColumns?: ClientPropertyForTableColumns[];

  /**
   * The datamodel filters for the typed entity
   * If undefined, no filtering options will be visible
   */
  filters?: DataSourceToolbarFilter[];

  /**
   * The datamodel properties that support groouping along with their GroupInfo[] data
   * If undefined, no group by options will be visible
   */
  groupData?: DataSourceToolbarGroupData;

  /**
   * An array of additional data.
   */
  extendedData?: any[];

  /* An object, that provides information for building a filter tree
   */
  filterTree?: FilterTreeParameter;

  /**
   * The datamodel property that supports additional table and list information
   */
  dataModel?: DataModel;

  /**
   * an optional identifier, that can be used to store settings
   */
  identifierForSessionStore?: string;
}
