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

import { DataModelFilterOption, DataModelProperty, ValType } from 'imx-qbm-dbts';
import { createGroupData } from './data-model-helper';

describe('DataModelHelper', () => {
  it('should createGroupData - undefined if no data', () => {
    const groupData = createGroupData(
      { },
      undefined
    );

    expect(groupData).toBeUndefined();
  });

  it('should createGroupData groups based on Properties', () => {
    const groupData = createGroupData(
      {
        Properties: [
          { IsGroupable: false, Property: { Type: ValType.String, ColumnName: 'some columnName not groupable' } },
          { IsGroupable: true, Property: { Type: ValType.String, ColumnName: 'some columnName excluded' } },
          { IsGroupable: true, Property: { Type: ValType.String, ColumnName: 'some columnName' } }
        ] as DataModelProperty[]
      },
      __ => Promise.resolve({ TotalCount: 0 }),
      ['some columnName excluded']
    );

    expect(groupData.groups.length).toEqual(1);
    expect(groupData.groups[0].property.Property.ColumnName).toEqual('some columnName');
    expect(groupData.groupingCategories.length).toEqual(0);
  });

  it('should createGroupData groups based on GroupInfo with length === 1', () => {
    const groupData = createGroupData(
      {
        GroupInfo: [
          { Options: [{ Value: 'option1' }] }
        ]
      },
      __ => Promise.resolve({ TotalCount: 0 })
    );

    expect(groupData.groups.length).toEqual(1);
    expect((groupData.groups[0].property as DataModelFilterOption).Value).toEqual('option1');
    expect(groupData.groupingCategories.length).toEqual(0);
  });

  it('should createGroupData groupingCategories based on GroupInfo with length > 1', () => {
    const groupData = createGroupData(
      {
        GroupInfo: [
          { Options: [{ Value: 'option1' }] },
          { Options: [{ Value: 'option2' }] }
        ]
      },
      __ => Promise.resolve({ TotalCount: 0 })
    );

    expect(groupData.groups.length).toEqual(0);
    expect(groupData.groupingCategories.length).toEqual(2);
    expect(groupData.groupingCategories[0].property.Options[0].Value).toEqual('option1');
    expect((groupData.groupingCategories[0].groups[0].property as DataModelFilterOption).Value).toEqual('option1');
    expect(groupData.groupingCategories[1].property.Options[0].Value).toEqual('option2');
    expect((groupData.groupingCategories[1].groups[0].property as DataModelFilterOption).Value).toEqual('option2');
  });

  it('should createGroupData groups based on Properties and GroupInfo length === 1', () => {
    const groupData = createGroupData(
      {
        Properties: [
          { IsGroupable: true, Property: { Type: ValType.String, ColumnName: 'some columnName' } }
        ] as DataModelProperty[],
        GroupInfo: [
          { Options: [{ Value: 'option1' }] }
        ]
      },
      __ => Promise.resolve({ TotalCount: 0 })
    );

    expect(groupData.groups.length).toEqual(2);
    expect(groupData.groups[0].property.Property.ColumnName).toEqual('some columnName');
    expect((groupData.groups[1].property as DataModelFilterOption).Value).toEqual('option1');
    expect(groupData.groupingCategories.length).toEqual(0);
  });

  it('should createGroupData groups and groupingCategories based on Properties and GroupInfo with length > 1', () => {
    const groupData = createGroupData(
      {
        Properties: [
          { IsGroupable: true, Property: { Type: ValType.String, ColumnName: 'some columnName' } }
        ] as DataModelProperty[],
        GroupInfo: [
          { Options: [{ Value: 'option1' }] },
          { Options: [{ Value: 'option2' }] }
        ]
      },
      __ => Promise.resolve({ TotalCount: 0 })
    );

    expect(groupData.groups.length).toEqual(1);
    expect(groupData.groups[0].property.Property.ColumnName).toEqual('some columnName');
    expect(groupData.groupingCategories.length).toEqual(2);
    expect(groupData.groupingCategories[0].property.Options[0].Value).toEqual('option1');
    expect((groupData.groupingCategories[0].groups[0].property as DataModelFilterOption).Value).toEqual('option1');
    expect(groupData.groupingCategories[1].property.Options[0].Value).toEqual('option2');
    expect((groupData.groupingCategories[1].groups[0].property as DataModelFilterOption).Value).toEqual('option2');
  });
});
