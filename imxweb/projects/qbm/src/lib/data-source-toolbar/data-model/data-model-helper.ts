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

import { CollectionLoadParameters, DataModel, DataModelFilterOption, GroupInfo, GroupInfoData } from 'imx-qbm-dbts';
import { DataSourceToolBarGroup, DataSourceToolbarGroupData } from '../data-source-toolbar-groups.interface';
import { GroupInfoLoadParameters } from './group-info-load-parameters.interface';

export function createGroupData(
  dataModel: DataModel,
  getGroupInfo: (parameters: GroupInfoLoadParameters) => Promise<GroupInfoData>,
  excludedColumns?: string[]
): DataSourceToolbarGroupData {
  const groups = [];
  const groupingCategories = [];

  if (dataModel.Properties) {
    dataModel.Properties.filter((p) => p.IsGroupable && p.Property && !excludedColumns?.includes(p.Property.ColumnName)).forEach(
      (property) =>
        groups.push({
          property,
          getData: async (parameter: CollectionLoadParameters) => {
            return getGroupInfo({ ...parameter, by: property.Property.ColumnName });
          },
        })
    );
  }

  if (dataModel.GroupInfo?.length === 1) {
    dataModel.GroupInfo[0].Options.forEach((option) => groups.push(getDataSourceToolBarGroup(option, getGroupInfo)));
  } else {
    dataModel.GroupInfo?.forEach((property) =>
      groupingCategories.push({
        property,
        groups: property.Options.map((option) => getDataSourceToolBarGroup(option, getGroupInfo)),
      })
    );
  }

  if (groups.length > 0 || groupingCategories.length > 0) {
    return { groups, groupingCategories };
  }

  return undefined;
}

function getDataSourceToolBarGroup(
  option: DataModelFilterOption,
  getGroupInfo: (parameters: GroupInfoLoadParameters) => Promise<GroupInfoData>
): DataSourceToolBarGroup {
  return {
    property: option,
    getData: async (param: CollectionLoadParameters) => {
      const data = await getGroupInfo({ ...param, ...{ def: option.Value } });
      data.Groups = data.Groups?.map((item) => {
        setFilterDisplay(item);
        return item;
      });
      return data;
    },
  };
}

function setFilterDisplay(item: GroupInfo): void {
  item.Display.forEach((display) =>
    item.Filters.forEach((filter) => {
      if (filter.Value1 != null) {
        display.Display = display.Display.replace(`%${filter.ColumnName}%`, filter.Value1);
      }
    })
  );
}
