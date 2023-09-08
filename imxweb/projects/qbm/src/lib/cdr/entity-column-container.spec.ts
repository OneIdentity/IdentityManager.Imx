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

import { EntityColumnContainer } from './entity-column-container';
import { IEntityColumn } from 'imx-qbm-dbts';

describe('EntityColumnContainer', () => {
  [
    { flags: { isReadOnly: true, canEdit: true }, expectedEdit: false },
    { flags: { isReadOnly: false, canEdit: true }, expectedEdit: true },
    { flags: { isReadOnly: true, canEdit: false }, expectedEdit: false },
    { flags: { isReadOnly: false, canEdit: false }, expectedEdit: false },
  ].forEach(testcase => {
    it('determines canEdit', () => {
      const columnContainer = new EntityColumnContainer();
      columnContainer.init({
        column: {
          GetDisplayValue: () => undefined,
          GetValue: () => undefined,
          GetMetadata: () => ({
            CanEdit: () => testcase.flags.canEdit,
            GetLimitedValues: () => undefined
          })
        } as IEntityColumn,
        isReadOnly: () => testcase.flags.isReadOnly
      });

      expect(columnContainer.canEdit).toEqual(testcase.expectedEdit);
    }
    );
  });

  it('provides displayValue', () => {
    const columnContainer = new EntityColumnContainer();
    expect(columnContainer.displayValue).toBeUndefined();
    const displayValue = 'Some displayvalue';
    columnContainer.init({
      column: {
        GetValue: () => undefined,
        GetDisplayValue: () => displayValue,
        GetMetadata: () => undefined
      } as IEntityColumn,
      isReadOnly: () => false
    });
    expect(columnContainer.displayValue).toEqual(displayValue);
  });

  it('provides value', () => {
    const columnContainer = new EntityColumnContainer();
    expect(columnContainer.value).toBeUndefined();
    const value = 'Some value';
    columnContainer.init({
      column: {
        GetValue: () => value,
        GetDisplayValue: () => undefined,
        GetMetadata: () => undefined
      } as IEntityColumn,
      isReadOnly: () => false
    });
    expect(columnContainer.value).toEqual(value);
  });
});
