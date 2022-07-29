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

import { NumberValidatorService } from './number-validator.service';

describe('NumberValidatorService', () => {
  let service: NumberValidatorService;

  configureTestSuite(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NumberValidatorService);
  });

  [
    0, '0'
  ].forEach(value =>
  it('validate returns no error if value is a valid number and no range is specified', () => {
    const result = service.validate(value, undefined);
    expect(result).toEqual(null);
  }));

  it('validate returns no error if value is within range', () => {
    const result = service.validate(0, { MinValue: 0 });
    expect(result).toEqual(null);
  });
  
  it('validate returns { invalidInteger: true } if value is not a valid number', () => {
    const result = service.validate('a', undefined);
    expect(result).toEqual({ invalidInteger: true });
  });

  it('validate returns { rangeMin: true } if value is below range min', () => {
    const result = service.validate(-1, { MinValue: 0 });
    expect(result).toEqual({ rangeMin: true });
  });

  it('validate returns { rangeMax: true } if value is above range max', () => {
    const result = service.validate(1, { MaxValue: 0 });
    expect(result).toEqual({ rangeMax: true });
  });
});
