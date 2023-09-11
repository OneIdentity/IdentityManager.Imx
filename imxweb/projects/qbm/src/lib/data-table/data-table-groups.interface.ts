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

import { CollectionLoadParameters, TypedEntity } from 'imx-qbm-dbts';
import { DataSourceToolbarSettings } from '../data-source-toolbar/data-source-toolbar-settings';

export function getParameterSubsetForGrouping(original: CollectionLoadParameters): CollectionLoadParameters {
  return {
    by: original.by,
    def: original.def,
    PageSize: original.PageSize,
    StartIndex: original.StartIndex,
    filter: original.filter,
  };
}

export interface DataTableGroupedData {
  /**
   * The data that has the groupedBy filter applied to it
   */
  data: any;

  /**
   * The DataSourceToolbarSettings for the grouped data
   */
  settings: DataSourceToolbarSettings;

  /**
   * The navigationState for the grouped data
   */
  navigationState: CollectionLoadParameters;

  /**
   * Keeps track if the nested group data is currently visible (expanded) or not
   */
  isExpanded?: boolean;

  /**
   * The currently selected items
   */
  selected?: TypedEntity[];
}
