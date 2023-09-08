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

import { SelectionContainer } from './selection-container';

describe('SelectionContainer', () => {
  [
    {
      assigned: [],
      selected: [],
      expected: { adds: 0, removes: 0 }
    },
    {
      assigned: [0],
      selected: [],
      expected: { adds: 0, removes: 1 }
    },
    {
      assigned: [0],
      selected: [0],
      expected: { adds: 0, removes: 0 }
    },
    {
      assigned: [],
      selected: [0],
      expected: { adds: 1, removes: 0 }
    },
    {
      assigned: [1],
      selected: [0],
      expected: { adds: 1, removes: 1 }
    },
    {
      assigned: [0,1],
      selected: [0,1],
      expected: { adds: 0, removes: 0 }
    },
    {
      assigned: [0,1],
      selected: [],
      expected: { adds: 0, removes: 2 }
    }
  ].forEach(testcase =>
  it('creates the correct changeSet, assigned ' + testcase.assigned + ', selected ' + testcase.selected, () => {
    const selected = new SelectionContainer<{ id: string }>(item => item.id);
    selected.init(testcase.assigned.map(id => ({ id: id.toString() })));
    selected.selected = testcase.selected.map(id => ({ id: id.toString() }));
    const change = selected.getChangeSet();
    expect(change.add.length).toEqual(testcase.expected.adds);
    expect(change.remove.length).toEqual(testcase.expected.removes);
  }));
});