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

import { CollectionLoadParameters, DataModelFilterOption, DataModelGroupInfo, GroupInfoData, IClientProperty } from 'imx-qbm-dbts';

export interface DataSourceToolbarGroupData {
  /**
   * The list of available grouping categories
   */
  groupingCategories?: DataSourceToolBarGroupingCategory[];

  /**
   * The list of available grouping data
   */
  groups?: DataSourceToolBarGroup[];

  /**
   * If a group is expanded. 
   */
  isExpanded?: boolean;

  /**
   * The currently selected group
   */
  currentGrouping?: {
    display: string;
    getData: (parameter?: CollectionLoadParameters) => Promise<GroupInfoData>;
    navigationState?: CollectionLoadParameters;
  };
}

export interface DataSourceToolBarGroup {
  /**
   * A groupable property
   */
  property: { Property?: IClientProperty } & DataModelGroupInfo & DataModelFilterOption;

  /**
   * Callback for getting the corresponding GroupInfo data for the property
   */
  getData: (parameter?: CollectionLoadParameters) => Promise<GroupInfoData>;

  /**
   * The navigation state used, when loading the group elements for a grouping type
   */
  navigationState?: CollectionLoadParameters;
}

/**
 * Grouping category with nested groupings
 */
export interface DataSourceToolBarGroupingCategory {
  /**
   * Category info
   */
  property: DataModelGroupInfo;

  /**
   * The list of available grouping data
   */
  groups: DataSourceToolBarGroup[];
}
