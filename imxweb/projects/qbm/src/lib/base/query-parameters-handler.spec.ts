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


import { ActivatedRouteSnapshot, ParamMap } from '@angular/router';
import * as TypeMoq from 'typemoq';

import { QueryParametersHandler } from './query-parameters-handler';
import { clearStylesFromDOM } from '../testing/clear-styles.spec';

function CreateActiveRouteSnapshot(queryParams: { [key: string]: any }): ActivatedRouteSnapshot {
  const mock = TypeMoq.Mock.ofType<ActivatedRouteSnapshot>();
  mock
    .setup(item => item.queryParamMap)
    .returns(() => {
      const mockParamMap = TypeMoq.Mock.ofType<ParamMap>();
      mockParamMap.setup(item => item.keys).returns(() => Object.keys(queryParams));
      mockParamMap.setup(item => item.get(TypeMoq.It.isAnyString())).returns((key: string) => queryParams[key]);
      return mockParamMap.object;
    });
  return mock.object;
}

describe('QueryParametersHandler', () => {

  afterAll(() => {
    clearStylesFromDOM();
  });

  [
    {
      search: '',
      expected: undefined
    },
    {
      search: '?',
      expected: undefined
    },
    {
      search: '?a',
      expected: { 'a': '' }
    },
    {
      search: '?a=1',
      expected: { 'a': '1' }
    },
    {
      search: '?a=1&b=2',
      expected: { 'a': '1', 'b': '2' }
    },
    {
      search: '?a=1&b=2',
      route: CreateActiveRouteSnapshot({ 'c': '3' }),
      expected: { 'a': '1', 'b': '2', 'c': '3' }
    },
    {
      search: '?a=1&b=2',
      route: CreateActiveRouteSnapshot({ 'c': '3' }),
      filter: (key: string) => key === 'c',
      expected: { 'c': '3' }
    }
  ].forEach(testcase =>
    it('can parse querystrings correctly', () => {
      const handler = new QueryParametersHandler(testcase.search, testcase.route);
      expect(handler.GetQueryParameters(testcase.filter)).toEqual(testcase.expected);
    })
  );
});
