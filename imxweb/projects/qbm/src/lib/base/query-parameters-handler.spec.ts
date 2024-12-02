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

import { ActivatedRouteSnapshot } from '@angular/router';

import { clearStylesFromDOM } from '../testing/clear-styles.spec';
import { QueryParametersHandler } from './query-parameters-handler';

function CreateActiveRouteSnapshot(queryParams: { [key: string]: string }): ActivatedRouteSnapshot {
  return { queryParamMap: { keys: Object.keys(queryParams), get: (key: string) => queryParams[key] } } as unknown as ActivatedRouteSnapshot;
}

describe('QueryParametersHandler', () => {
  afterAll(() => {
    clearStylesFromDOM();
  });

  [
    {
      search: '',
      expected: undefined,
    },
    {
      search: '?',
      expected: undefined,
    },
    {
      search: '?a',
      expected: { a: '' },
    },
    {
      search: '?a=1',
      expected: { a: '1' },
    },
    {
      search: '?a=1&b=2',
      expected: { a: '1', b: '2' },
    },
    {
      search: '?a=1&b=2',
      route: CreateActiveRouteSnapshot({ c: '3' }),
      expected: { a: '1', b: '2', c: '3' },
    },
    {
      search: '?a=1&b=2',
      route: CreateActiveRouteSnapshot({ c: '3' }),
      filter: (key: string) => key === 'c',
      expected: { c: '3' },
    },
  ].forEach((testcase) =>
    it('can parse querystrings correctly', () => {
      const handler = new QueryParametersHandler(testcase.search, testcase.route);
      expect(handler.GetQueryParameters(testcase.filter)).toEqual(testcase.expected);
    }),
  );
});
