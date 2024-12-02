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

import { FilterData } from '@imx-modules/imx-qbm-dbts';
import { FilterTreeParameter } from '../../data-model/filter-tree-parameter';

/**
 * Provides information for the selection of a filter tree.
 * It is used to unify the information, that is provided by the tree and a loaded configuration
 */
export interface FilterTreeSelectionParameter {
  /**
   * The text, that is displayed on chips.
   */
  display?: string;
  /**
   * The real filter information.
   */
  filter?: FilterData;
}

/**
 * Provides the information, that are used to describe a tree node in a
 *  {@link FilterTreeSidesheetComponent | filter tree side sheet component }
 */
export interface FilterTreeNode {
  /**
   * the level of the node
   */
  level: number;

  /**
   * Represents, whether the node has children or not.
   */
  hasChildren: boolean;

  /**
   * Represents the display of the node
   */
  nodeDisplay: string;

  /**
   * Represents the filter data, associated with the node.
   */
  filterData?: FilterData;

  /**
   * Represents the children of the tree node
   */
  children?: FilterTreeNode[];

  /**
   * Represents an object key, that can be used, to identify the node.
   */
  objectKey?: string;

  /**
   * Represents, whether the node is loading or not
   */
  isLoading?: boolean;

  /**
   * Represents, whether the node is shown as selected or not
   */
  isSelected?: boolean;
}

/**
 * Provides information for the filter tree sidesheet component
 */
export interface FilterTreeParameterData {
  /**
   * The parameter, that contains the filter method and other options.
   */
  filterTreeParameter: FilterTreeParameter;

  /**
   * A list of preselected elements
   */
  preSelection: FilterTreeSelectionParameter;

  /**
   * the type of the tree filter
   */
  type: string;
}
