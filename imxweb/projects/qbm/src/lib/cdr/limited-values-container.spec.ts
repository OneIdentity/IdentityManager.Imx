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


import { ValType, IValueMetadata, LimitedValueData } from 'imx-qbm-dbts';
import { LimitedValuesContainer } from './limited-values-container';

describe('LimitedValuesContainer', () => {
    function buildLimitedValues(limited: any[]): ReadonlyArray<LimitedValueData> {
        return limited.map(element => ({ Value: element, Description: `${element}` }));
    }

  [
    { value: { limited: ['a', 'b', 'c'], minLength: 0, type: ValType.String }, description: 'with string allowing null', expected: true },
    { value: { limited: [null, 'b', 'c'], minLength: 1, type: ValType.String }, description: 'with string allowing null', expected: false },
    { value: { limited: ['a', 'b', 'c'], minLength: 1, type: ValType.String }, description: 'with string not allowing null', expected: false },
    { value: { limited: [1, 2, 3], minLength: 0, type: ValType.Int }, description: 'with number allowing null', expected: true },
    { value: { limited: [0, 2, 3], minLength: 0, type: ValType.Int }, description: 'with number allowing null', expected: false },
    { value: { limited: [1, 2, 3], minLength: 1, type: ValType.Int }, description: 'with number not allowing null', expected: false },
  ].forEach(testcase => {
    it(`should have a "null" option ${testcase.description}`, () => {
        const container = new LimitedValuesContainer({
            GetLimitedValues: () => buildLimitedValues(testcase.value.limited),
            GetMinLength: () => testcase.value.minLength,
            GetType: () => testcase.value.type
        } as IValueMetadata);
        
        expect(container.hasNullOption()).toEqual(testcase.expected);
    });
  });

  [
    {
      metadata: { limited: ['a', 'b', 'c'], type: ValType.String },
      value: 'd',
      description: 'for string not in limited values',
      expected: true
    },
    {
      metadata: { limited: ['a', 'b', 'c'], type: ValType.String },
      value: 'a',
      description: 'for string in limited values',
      expected: false
    },
    {
      metadata: { limited: ['a', 'b', 'c'], type: ValType.String },
      description: 'for string null',
      expected: false
    },
    {
      metadata: { limited:  [1, 2, 3], type: ValType.Int },
      description: 'for number not in limited values',
      value: 4,
      expected: true
    },
    {
      metadata: { limited:  [1, 2, 3], type: ValType.Int },
      description: 'for number in limited value',
      value: 1,
      expected: false
    },
    {
      metadata: { limited:  [1, 2, 3], type: ValType.Int },
      description: 'for number 0',
      value: 0,
      expected: true
    },
  ].forEach(testcase => {
    it(`isNotInLimitedValueRange ${testcase.description}`, () => {
        const container = new LimitedValuesContainer({
            GetLimitedValues: () => buildLimitedValues(testcase.metadata.limited),
            GetType: () => testcase.metadata.type
        } as IValueMetadata);

        expect(container.isNotInLimitedValueRange(testcase.value)).toEqual(testcase.expected);
    });
  });
});
