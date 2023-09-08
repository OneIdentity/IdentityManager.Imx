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

import { TranslateService } from '@ngx-translate/core';
import { of } from 'rxjs';

import { Paginator } from './paginator';
import { LdsReplacePipe } from '../lds-replace/lds-replace.pipe';
import { clearStylesFromDOM } from '../testing/clear-styles.spec';

export class TranslateServiceStub {
	public get(key: any): any {
		return of(key);
	}
}

describe('Paginator', () => {
  const translationService = new TranslateServiceStub() as TranslateService;
  const mockLdsReplacePipe = new LdsReplacePipe();

  afterAll(() => {
    clearStylesFromDOM();
  });

  it('can be created', () => {
    expect(Paginator.Create(translationService, mockLdsReplacePipe)).toBeDefined();
  });

  [
    {
      page: 0, pageSize: 0, length: 1,
      expected: [
        { index: 0, value: '0' },
        { index: 2, value: '1' }
      ]
    },
    {
      page: 0, pageSize: 1, length: 0,
      expected: [
        { index: 0, value: '0' },
        { index: 2, value: '0' }
      ]
    },
    {
      page: 0, pageSize: 1, length: 2,
      expected: [
        { index: 0, value: '1' },
        { index: 2, value: '1' },
        { index: 4, value: '2' }
      ]
    },
    {
      page: 2, pageSize: 1, length: 2,
      expected: [
        { index: 0, value: '3' },
        { index: 2, value: '3' },
        { index: 4, value: '2' }
      ]
    }
  ].forEach(testcase => it('displays correct page info', () => {
    const paginator = Paginator.Create(translationService, mockLdsReplacePipe);
    const rangelabelTokens = paginator.getRangeLabel(testcase.page, testcase.pageSize, testcase.length).replace('#LDS#', '').split(' ');
    testcase.expected.forEach(result => expect(rangelabelTokens[result.index]).toEqual(result.value));
  }));
});
