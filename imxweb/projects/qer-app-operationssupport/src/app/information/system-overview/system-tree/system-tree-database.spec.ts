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

import { OpsupportSystemoverview } from '@imx-modules/imx-api-qbm';
import { TypedEntityCollectionData } from '@imx-modules/imx-qbm-dbts';
import { CreateIReadValue } from 'qbm';
import { SystemTreeDatabase } from './system-tree-database';

describe('SystemTreeDatabase', () => {
  let node: SystemTreeDatabase;

  function getSysOverviewMock(cat?: string, el?: string, val?: string, qov?: number): OpsupportSystemoverview {
    return {
      Category: CreateIReadValue(cat),
      Element: CreateIReadValue(el),
      Value: CreateIReadValue(val),
      QualityOfValue: CreateIReadValue(qov),
      RecommendedValue: CreateIReadValue('Recommmended'),
      UID_QBMVSystemOverview: CreateIReadValue('14AA3338-8EEF-2ECE-9C85-D12E0E4CE3ED'),
    } as OpsupportSystemoverview;
  }

  function getMockedTypedEntityCollection(
    cat1?: string,
    el1?: string,
    val1?: string,
    qov1?: number,
    cat2?: string,
    el2?: string,
    val2?: string,
    qov2?: number,
  ): TypedEntityCollectionData<OpsupportSystemoverview> {
    const mock1 = getSysOverviewMock(cat1, el1, val1, qov1);
    const mock2 = getSysOverviewMock(cat2, el2, val2, qov2);
    return {
      tableName: 'dummyTable',
      totalCount: 10,
      Data: [mock1, mock2],
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
    expect(node.ExceededThresholdsCounter).toBe(2);
  });

  it('should export as csv-data', () => {
    node.initialize(getMockedTypedEntityCollection('Customer', 'Customer Name', 'Val1', 0.1, 'Customer', 'Customer Email', 'Val2', 0.7));
    expect(node.export().length).toBeGreaterThan(0);
    expect(node.export()).toBe(
      'Category, Element, Value, QualityOfValue, RecommendedValue\r\nCustomer,Customer Name,Val1,0.1,Recommmended\r\nCustomer,Customer Email,Val2,0.7,Recommmended\r\n',
    );
  });
});
