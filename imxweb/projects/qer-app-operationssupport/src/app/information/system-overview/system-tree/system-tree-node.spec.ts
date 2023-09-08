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

import { SystemTreeNode } from './system-tree-node';
import { OpsupportSystemoverview } from 'imx-api-qbm';
import { CreateIReadValue } from 'qbm';

describe('SystemTreeNode', () => {
  const dummyName = 'name';
  let sysOverviewObjMock: TypeMoq.IMock<OpsupportSystemoverview>;

  beforeEach(() => {
    sysOverviewObjMock = TypeMoq.Mock.ofType<OpsupportSystemoverview>();
  });

  it('should be use name as Display', () => {
    const node = new SystemTreeNode(null, dummyName, 0, true, 1);
    expect(node.display).toBe(dummyName);
    expect(node.level).toBe(0);
    expect(node.hasExceeededTresholds).toBe(1);
    expect(node.expandable).toBe(true);
  });

  it('should be use name as Display and defaults for level, expandable, ...', () => {
    const node = new SystemTreeNode(null, dummyName);
    expect(node.display).toBe(dummyName);
    expect(node.level).toBe(1);
    expect(node.hasExceeededTresholds).toBe(0);
    expect(node.expandable).toBe(false);
  });

  it('should be use item.Element as Display', () => {
    const dummyDisplay = 'Person';
    sysOverviewObjMock.setup(d => d.Element).returns(() => CreateIReadValue(dummyDisplay));
    const node = new SystemTreeNode(sysOverviewObjMock.object, dummyName);
    expect(node.display).toBe(dummyDisplay);
  });
});




