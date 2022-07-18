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
 * Copyright 2022 One Identity LLC.
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

import { TestBed } from '@angular/core/testing';

import { configureTestSuite } from 'ng-bullet';
import { ParameterizedTextService } from './parameterized-text.service';

describe('ParameterizedTextService', () => {
  let service: ParameterizedTextService;

  const replacements = {
    p2: 'display2',
    SomeOther: 'SomeOtherDisplay',
    SomeThird: 'SomeThirdDisplay',
    p1: 'display1'
  };

  configureTestSuite(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ParameterizedTextService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  [
    {
      parameterizedText: 'pre fix \"%p1%\" in fix \"%p2%\" suf fix ',
      expected: [{ value: 'pre fix ' },{ value: 'display1', isParameter: true },{ value: ' in fix ' },{ value: 'display2', isParameter: true },{ value: ' suf fix ' }]
    },
    {
      parameterizedText: 'pre fix \"%p1%\" in fix \"%p2%\"',
      expected: [{ value: 'pre fix ' },{ value: 'display1', isParameter: true },{ value: ' in fix ' },{ value: 'display2', isParameter: true }]
    },
    {
      parameterizedText: 'pre fix \"%p1%\"\"%p2%\" suf fix ',
      expected: [{ value: 'pre fix ' },{ value: 'display1', isParameter: true },{ value: 'display2', isParameter: true },{ value: ' suf fix ' }]
    },
    {
      parameterizedText: '\"%p1%\" in fix \"%p2%\" suf fix ',
      expected: [{ value: 'display1', isParameter: true },{ value: ' in fix ' },{ value: 'display2', isParameter: true },{ value: ' suf fix ' }]
    },
    {
      parameterizedText: '\"%p1%\" in fix \"%p2%\"',
      expected: [{ value: 'display1', isParameter: true },{ value: ' in fix ' },{ value: 'display2', isParameter: true }]
    },
    {
      parameterizedText: '\"%p1%\"\"%p2%\"',
      expected: [{ value: 'display1', isParameter: true },{ value: 'display2', isParameter: true }]
    }
  ].forEach(testcase =>
  it('should match ' + testcase.parameterizedText, () => {
    const parameterizedText = testcase.parameterizedText;

    const expected = testcase.expected;

    const actual = service.createTextTokens({
      value: parameterizedText,
      marker: { start: '"%', end: '%"' },
      getParameterValue: name => replacements[name]
    });

    expect(actual).toEqual(expected);
  }));

  it('should match text with repeating parameters', () => {
    const parameterizedText = '\"%p1%\" text with \"%p2%\" repeating \"%p2%\" parameters \"%p1%\"\"%p2%\"';

    const expected = [
      { value: 'display1', isParameter: true },
      { value: ' text with ' },
      { value: 'display2', isParameter: true },
      { value: ' repeating ' },
      { value: 'display2', isParameter: true },
      { value: ' parameters ' },
      { value: 'display1', isParameter: true },
      { value: 'display2', isParameter: true }
    ];

    const actual = service.createTextTokens({
      value: parameterizedText,
      marker: { start: '"%', end: '%"' },
      getParameterValue: name => replacements[name]
    });

    expect(actual).toEqual(expected);
  });

  it('should match text with missing parameters', () => {
    const parameterizedText = '\"%p4%\" text with some non-existing parameters \"%p1%\"';

    const expected = [
      { value: '\"%p4%\" text with some non-existing parameters ' },
      { value: 'display1', isParameter: true }
    ];

    const actual = service.createTextTokens({
      value: parameterizedText,
      marker: { start: '"%', end: '%"' },
      getParameterValue: name => replacements[name]
    });

    expect(actual).toEqual(expected);
  });

  it('should replace text with empty parameters', () => {
    const parameterizedText = 'Here is a missing parameter: \"%p1%\"';

    const expected = [
      { value: 'Here is a missing parameter: ' },
      { value: '', isParameter: true }
    ];

    const actual = service.createTextTokens({
      value: parameterizedText,
      marker: { start: '"%', end: '%"' },
      getParameterValue: name => ""
    });

    expect(actual).toEqual(expected);
  });

  it('should match text without parameters', () => {
    const parameterizedText = 'text with missing parameters ';

    const expected = [{ value: parameterizedText }];

    const actual = service.createTextTokens({
      value: parameterizedText,
      marker: { start: '"%', end: '%"' },
      getParameterValue: name => replacements[name]
    });

    expect(actual).toEqual(expected);
  });

  it('should handle text.length === 0', () => {
    const parameterizedText = '';

    const expected = [];

    const actual = service.createTextTokens({
      value: parameterizedText,
      marker: { start: '"%', end: '%"' },
      getParameterValue: name => replacements[name]
    });

    expect(actual).toEqual(expected);
  });
});
