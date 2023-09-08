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
  CollectionLoadParameters,
  DataModel,
  DataModelFilterOption,
  DataModelGroupInfo,
  DataModelProperty,
  GroupInfoData,
} from 'imx-qbm-dbts';
import { DataSourceToolbarGroupData } from 'qbm';

export function createGroupData(
  dataModel: DataModel,
  getGroupInfo: (parameters: { by?: string; def?: string } & CollectionLoadParameters) => Promise<GroupInfoData>,
  disableGroupingFor: string[]
): DataSourceToolbarGroupData {
  const groups = [];
  const groupingCategories = [];

  if (dataModel.Properties) {
    for (const property of dataModel.Properties.filter(
      (p) => p.IsGroupable && disableGroupingFor.every((elem) => elem !== p.Property?.ColumnName)
    )) {
      groups.push({
        property,
        getData: async (parameters) => await getGroupInfo({ ...{ by: property.Property.ColumnName }, ...parameters }),
      });
    }
  }

  const getGroupInfoGroups = (options: DataModelFilterOption[]) =>
    options.map((property) => ({
      property: property as DataModelProperty & DataModelGroupInfo,
      getData: async (parameters) => {
        const original = await getGroupInfo({ ...{ def: property.Value }, ...parameters });
        const groupDisplay = original.Groups.map((item) => {
          item.Display.forEach((display) =>
            item.Filters.forEach((filter) => {
              if (filter.Value1 != null) {
                display.Display = display.Display.replace(`%${filter.ColumnName}%`, filter.Value1);
              }
            })
          );
          return item;
        });
        return { Groups: groupDisplay, TotalCount: original.TotalCount };
      },
    }));

  if (dataModel.GroupInfo?.length === 1) {
    getGroupInfoGroups(dataModel.GroupInfo[0].Options).forEach((group) => groups.push(group));
  } else {
    dataModel.GroupInfo?.forEach((dataModelGroupInfo) =>
      groupingCategories.push({
        property: dataModelGroupInfo,
        groups: getGroupInfoGroups(dataModelGroupInfo.Options),
      })
    );
  }

  if (groups.length > 0 || groupingCategories.length > 0) {
    return { groups, groupingCategories };
  }

  return undefined;
}
