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

import { MultiValueService } from './multi-value.service';
import { MultiValueProperty } from 'imx-qbm-dbts';

describe('MultiValueService', () => {
  let service: MultiValueService;

  configureTestSuite(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MultiValueService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  [
    { input: undefined, output: undefined },
    { input: '', output: [] },
    { input: 'a', output: ['a'] },
    { input: 'a' + MultiValueProperty.DefaultSeparator, output: ['a'] },
    { input: 'a' + MultiValueProperty.DefaultSeparator + 'b', output: ['a', 'b'] }
  ].forEach(testcase =>
  it('should convert multiValue to array of strings', () => {
    expect(service.getValues(testcase.input)).toEqual(testcase.output);
  }));

  [
    { input: undefined, output: undefined },
    { input: [], output: '' },
    { input: [''], output: '' },
    { input: ['a'], output: 'a' },
    { input: ['a', ''], output: 'a' },
    { input: ['a', undefined], output: 'a' },
    { input: ['a', 'b'], output: 'a' + MultiValueProperty.DefaultSeparator + 'b' }
  ].forEach(testcase =>
  it('should convert array of strings to multiValue', () => {
    expect(service.getMultiValue(testcase.input)).toEqual(testcase.output);
  }));
});
