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

import * as TypeMoq from 'typemoq';

import { OpsupportSystemoverview } from "imx-api-qbm";
import { SystemTreeDatabase } from "./system-tree-database";
import { CreateIReadValue } from 'qbm';
import { TypedEntityCollectionData } from 'imx-qbm-dbts';

describe('SystemTreeDatabase', () => {
  let node: SystemTreeDatabase;

  function getSysOverviewMock(cat?: string, el?: string, val?: string, qov?: number): OpsupportSystemoverview {
    const mock = TypeMoq.Mock.ofType<OpsupportSystemoverview>();
    mock.setup(d => d.Category).returns(() => CreateIReadValue(cat));
    mock.setup(d => d.Element).returns(() => CreateIReadValue(el));
    mock.setup(d => d.Value).returns(() => CreateIReadValue(val));
    mock.setup(d => d.QualityOfValue).returns(() => CreateIReadValue(qov));
    mock.setup(d => d.RecommendedValue).returns(() => CreateIReadValue('Recommmended'));
    mock.setup(d => d.UID_QBMVSystemOverview).returns(() => CreateIReadValue('14AA3338-8EEF-2ECE-9C85-D12E0E4CE3ED'));
    return mock.object;
  }

  function getMockedTypedEntityCollection(
    cat1?: string,
    el1?: string,
    val1?: string,
    qov1?: number,
    cat2?: string,
    el2?: string,
    val2?: string,
    qov2?: number
  ): TypedEntityCollectionData<OpsupportSystemoverview> {
    const mock1 = getSysOverviewMock(cat1, el1, val1, qov1);
    const mock2 = getSysOverviewMock(cat2, el2, val2, qov2);
    return {
      tableName: 'dummyTable',
      totalCount: 10,
      Data: [mock1, mock2]
    };
  }

  beforeEach(() => {
    node = new SystemTreeDatabase();
  });

  it('should create with defaults', () => {
    expect(node.CustomerEmail).toBe('');
    expect(node.CustomerName).toBe('');
  });

  it('should get if the node is expandable', () => {
    node.initialize(getMockedTypedEntityCollection());
    expect(node.isExpandable('bla')).toBeFalsy();
  });

  it('should get if isExpandable', () => {
    node.initialize(getMockedTypedEntityCollection());
    expect(node.getChildren('bla')).toBeFalsy();
  });

  it('should run initialization completely', () => {
    node.initialize(getMockedTypedEntityCollection('DB', 'DB Name', 'Val1', 0.1, 'DB', 'DB Queue', 'Val1', 0.1));
    expect(node.ExceededTresholdsCounter).toBe(2);
  });

  it('should export as csv-data', () => {
    node.initialize(getMockedTypedEntityCollection('Customer', 'Customer Name', 'Val1', 0.1, 'Customer', 'Customer Email', 'Val2', 0.7));
    expect(node.export().length).toBeGreaterThan(0);
    expect(node.export()).toBe(
      'Category, Element, Value, QualityOfValue, RecommendedValue\r\nCustomer,Customer Name,Val1,0.1,Recommmended\r\nCustomer,Customer Email,Val2,0.7,Recommmended\r\n'
    );
  });
});