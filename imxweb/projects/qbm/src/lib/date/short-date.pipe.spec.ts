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

import { TestBed  } from '@angular/core/testing';
import { TranslateService } from '@ngx-translate/core';
import { configureTestSuite } from 'ng-bullet';

import { ShortDatePipe } from './short-date.pipe';

describe('ShortDatePipe', () => {

  let translateService: TranslateService;
  let browserLang: string;

  configureTestSuite(() => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: TranslateService,
          useValue: {
            getBrowserCultureLang: jasmine.createSpy('getBrowserCultureLang').and.callFake(() => browserLang)
          }
        }
      ]
    });
  });

  beforeEach(() => {
    translateService = TestBed.get(TranslateService);
    browserLang = 'de';
    translateService.currentLang = browserLang;
  });

  it('should create', () => {
    const pipe = new ShortDatePipe(translateService);
    expect(pipe).toBeDefined();
  });

  for (const testcase of [
    { description: 'german', date: '2020-01-01', culture: 'de', expected: '1.1.2020' },
    { description: 'english', date: '2020-01-01', culture: 'en', expected: '1/1/2020' },
    { description: 'german (with time)', date: '11/20/2020, 5:37:06 PM', culture: 'de', expected: '20.11.2020' },
    { description: 'english (with time)', date: '11/20/2020, 5:37:06 PM', culture: 'en', expected: '11/20/2020' },
    { description: 'invalid', date: 'xxx', culture: 'en', expected: 'xxx' },
  ]) {
    it(`should transform the ${testcase.description} date to a shortDate`, () => {
      browserLang = testcase.culture;
      translateService.currentLang = browserLang;

      const pipe = new ShortDatePipe(translateService);
      expect(pipe.transform(testcase.date)).toBe(testcase.expected);
    });
  }

});
