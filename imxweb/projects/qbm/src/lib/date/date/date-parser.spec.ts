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

import { ClassloggerService } from '../../classlogger/classlogger.service';
import { DateParser } from './date-parser';
import moment from 'moment-timezone';

describe('DateParser', () => {

  const mockLogger: ClassloggerService = jasmine.createSpyObj<ClassloggerService>("ClassloggerService", ["debug"]);

  beforeEach(() => {
    // set en-US as default locale
    moment.locale('en-US');
  })

  it('should create an instance', () => {
    expect(new DateParser(mockLogger, true)).toBeTruthy();
  });

  // ==================================================
  // Tests for function format()
  // ==================================================

  it('should cast away seconds in full format', () => {
    let parser = new DateParser(mockLogger, true);

    // note: month unlike the other nmbers is zero based, so december is month 11.
    let m = moment({year: 2100, month:11, day: 31, hour:23, minute: 47, second: 42});

    expect(parser.format(m)).toEqual('12/31/2100 11:47 PM');
  });

  it('should cast away whole time in full format when no time mode', () => {
    let parser = new DateParser(mockLogger, false);
    let m = moment({year: 2100, month:11, day: 31, hour:23, minute: 47, second: 42});
    let actual = parser.format(m);
    expect(actual).toEqual('12/31/2100');
  });

  it('should yield an empty string as format for undefined or null moment', () => {
    let parser = new DateParser(mockLogger, false);

    expect(parser.format(null)).toEqual('');
    expect(parser.format(undefined)).toEqual('');
  });

  // ==================================================
  // Tests for function parseDate()
  // ==================================================

  [
    { text: '12/31/2100', valid: true, year: 2100, month: 11, day: 31 },
    { text: '01/31/2100', valid: true, year: 2100, month: 0, day: 31},
    { text: '01/02/2100', valid: true, year: 2100, month: 0, day: 2},
    { text: '01/02/2100 11:42 AM', valid: true, year: 2100, month: 0, day: 2},
    { text: '1/02/2100', valid: true, year: 2100, month: 0, day: 2},
    { text: '01/2/2100', valid: true, year: 2100, month: 0, day: 2},
    { text: '12/2100', valid: true, year: 2000, month: 11, day: 21 },
    { text: '13/22/2100 11:47', valid: false},
  ].forEach(testcase => it(`should ${testcase.valid ? '' : 'not '}parse as date: ${testcase.text}`, () => {
      let result = DateParser.parseDate(testcase.text);

      expect(result).toBeDefined();
      expect(result.isValid()).toBe(testcase.valid);

      if (testcase.valid) {
        expect(result.year()).toBe(testcase.year);
        expect(result.month()).toBe(testcase.month);
        expect(result.date()).toBe(testcase.day);
        expect(result.hour()).toBe(0);
        expect(result.minute()).toBe(0);
        expect(result.seconds()).toBe(0);
      }
    }));

  // ==================================================
  // Tests for function parseTime()
  // ==================================================

  [
    { text: '07:45', valid: true, hour: 7, minute: 45},
    { text: '7:45', valid: true, hour: 7, minute: 45},
    { text: '07:4', valid: false },
    { text: '7:4', valid: false },
    { text: '07:45 PM', valid: true, hour: 19, minute: 45},
    { text: '12/22/2100', valid: false},
    { text: '12/22', valid: false},
    { text: '12/22/2100 11:47', valid: true, hour: 11, minute: 47},
    // date broken (month 13) and time broken (AM/PM missing) here we reach the limits of 'fixing' the input
    { text: '13/22/2100 11:47', valid: true, hour: 13, minute: 47},
  ].forEach(testcase => it(`should ${testcase.valid ? '' : 'not '}parse as time: ${testcase.text}`, () => {
      let result = DateParser.parseTime(testcase.text);

      expect(result).toBeDefined();
      expect(result.isValid()).toBe(testcase.valid);

      if (testcase.valid) {
        const now = moment();
        expect(result.year()).toBe(now.year());
        expect(result.month()).toBe(now.month());
        expect(result.date()).toBe(now.date());
        expect(result.hour()).toBe(testcase.hour);
        expect(result.minute()).toBe(testcase.minute);
        expect(result.seconds()).toBe(0);
        expect(result.milliseconds()).toBe(0);
      }
    }));

  // ==================================================
  // Tests for function parseDateAndTimeString()
  // ==================================================

  it('should return undefined for null, undefined or empty string', () => {
    let parser = new DateParser(mockLogger, true);
    expect(parser.parseDateAndTimeString(null)).toBeUndefined();
    expect(parser.parseDateAndTimeString(undefined)).toBeUndefined();
    expect(parser.parseDateAndTimeString('')).toBeUndefined();
    expect(parser.parseDateAndTimeString('     ')).toBeUndefined();
    expect(parser.parseDateAndTimeString('\t')).toBeUndefined();
  });

  [
    { text: '12/22/2100 11:47', valid: true, year: 2100, month: 11, day: 22, hour: 11, minute: 47},
    { text: '12/22/2100 14:47', valid: true, year: 2100, month: 11, day: 22, hour: 14, minute: 47},
    { text: '12/22/2100 2:47 PM', valid: true, year: 2100, month: 11, day: 22, hour: 14, minute: 47},
    { text: '12/22/2100 8:15', valid: true, year: 2100, month: 11, day: 22, hour: 8, minute: 15},
    { text: '12/22/2100 8:15 AM', valid: true, year: 2100, month: 11, day: 22, hour: 8, minute: 15},
    { text: '12/22/2100 8:15 PM', valid: true, year: 2100, month: 11, day: 22, hour: 20, minute: 15},
    { text: '13/22/2100 11:47', valid: false},
    { locale: 'de-DE', text: '22.12.2100 11:47', valid: true, year: 2100, month: 11, day: 22, hour: 11, minute: 47},
    { locale: 'de-DE', text: '22.12.2100 14:47', valid: true, year: 2100, month: 11, day: 22, hour: 14, minute: 47},
    { locale: 'de-DE', text: '22.12.2100 2:47', valid: true, year: 2100, month: 11, day: 22, hour: 2, minute: 47},
    { locale: 'de-DE', text: '22.12.2100 2:47', valid: true, year: 2100, month: 11, day: 22, excludeTime: true},
    { locale: 'de-DE', text: '1.2.03 4:5', valid: true, year: 2003, month: 1, day: 1, excludeTime: true},
    { locale: 'de-DE', text: '22.12.2100', valid: true, year: 2100, month: 11, day: 22, hour: 0, minute: 0}, // because the time is added internally
  ].forEach(testcase => it(`should ${testcase.valid ? '' : 'not '}parse as date and time: ${testcase.text}`, () => {

      if (testcase.locale) {
        moment.locale(testcase.locale);
      }

      let withTime =! testcase.excludeTime;
      let result = new DateParser(mockLogger, withTime).parseDateAndTimeString(testcase.text);

      expect(result).toBeDefined();
      expect(result.isValid()).toBe(testcase.valid);

      if (testcase.valid) {
        expect(result.year()).toBe(testcase.year);
        expect(result.month()).toBe(testcase.month);
        expect(result.date()).toBe(testcase.day);
        expect(result.hour()).toBe(withTime ? testcase.hour : 0);
        expect(result.minute()).toBe(withTime ? testcase.minute: 0);
        expect(result.seconds()).toBe(0);
        expect(result.milliseconds()).toBe(0);
      }
    }));
});
