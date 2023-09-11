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
import moment from 'moment-timezone';
import { Moment } from 'moment-timezone';


/**
 * Internally used date parser for strings representing date and (optionally) time
 * using "L LT" format for date and time and "L" format for date only.
 *
 * See {@link https://momentjs.com/docs/#/parsing/|Moment.js parsing}.
 */
export class DateParser {

  /**
   * @ignore
   * The format for the date part.
   */
  private static readonly FORMAT_DATE = 'L';

  /**
   * @ignore
   * The format for the time part.
   */
  private static readonly FORMAT_TIME = 'LT';

  /**
   * @ignore
   * The combined date and time format.
   */
  private static readonly FORMAT_DATEANDTIME = 'L LT';

  /**
   * @ignore
   * The separator between date format and time format in FORMAT_DATEANDTIME.
   */
  private static readonly SEPARATOR_BETWEEN_DATE_AND_TIME = ' ';


  /**
   * Creates a new DateParser.
   *
   * @param logger The logger
   * @param withTime Whether the string should contain a time part.
   */
  constructor(private logger: ClassloggerService, private withTime: boolean) { }

  /**
   * Returns the formatted value for a given date (and time).
   * @param date The date (and time).
   * @returns The string representation of the date (and time).
   */
  public format(date: Moment): string {
    return date?.format(this.fullFormat) ?? '';
  }

  /**
   * Parses the date and time of a string representation of a date (and time).
   *
   * If parsing fails the return value will not be undefined but {@link https://momentjs.com/docs/#/parsing/|invalid}.
   *
   * @param text The string representation
   * @returns A moment according to the date and time part.
   */
  public parseDateAndTimeString(dateAndTimeString: string): Moment {
    try {

      if (!dateAndTimeString || dateAndTimeString.trim().length === 0) {
        return undefined;
      }

      const date = DateParser.parseDate(dateAndTimeString);
      if (!date.isValid()) {
        this.logger.debug(this, `Invalid date: '${dateAndTimeString}': does not define a valid date.`);
        return moment.invalid();
      }

      if (!this.withTime) {
        return moment(date.format(DateParser.FORMAT_DATE), DateParser.FORMAT_DATE, true);
      }

      const time = DateParser.parseTime(dateAndTimeString);
      if (!time.isValid()) {
        return moment(date.format(DateParser.FORMAT_DATEANDTIME), DateParser.FORMAT_DATEANDTIME, true);
      }

      // date and time have not necessarily been evaluated in 'strict' mode.
      // that's ok, but at least their separate values need to match the combined value then.
      const combined = moment(dateAndTimeString, DateParser.FORMAT_DATEANDTIME, false);

      if (!combined.isValid()
        || combined.year() !== date.year()
        || combined.month() !== date.month()
        || combined.date() !== date.date()
        || combined.hour() !== time.hour()
        || combined.seconds() !== time.seconds()) {
        return moment.invalid();

      }

      // We cannot simply parse the date and time string, since the moment.js documentation suggests
      // that this is not guaranteed to work in a pleasant manner.
      // So we create the moment with just the date parts we need (no milliseconds or so).
      let m = moment({ year: date.year(), month: date.month(), day: date.date(), hour: time.hour(), minute: time.minute() });

      // Right now the moment instance is missing the right formatting information.
      // Reconstruction with the parsing constructor helps.
      m = moment(m.format(DateParser.FORMAT_DATEANDTIME), DateParser.FORMAT_DATEANDTIME, true);

      return m;

    } catch (error) {
      this.logger.debug(this, `Invalid date string '${dateAndTimeString}': ${error}`);
      return moment('invalid');
    }
  }

  /**
   * Takes some momemt and returns a clean new moment
   * - containing only the date part (only years, months and days, no hours, minutes etc.)
   * - set to the right date format
   *
   * NOTE: if the input is invalid the return value will be undefined.
   *
   * @param value a moment possibly containing more than date
   * @returns a clean date only moment
   */
  public static asDateOnly(value: Moment): Moment {
    return value?.isValid() ? moment(moment(value).format(DateParser.FORMAT_DATE), DateParser.FORMAT_DATE, true) : undefined;
  }

  /**
   * Takes some momemt and returns a clean new moment
   * - containing only the time part (only hours and minutes)
   * - set to the right date format
   *
   * NOTE: if the input is invalid the return value will be undefined.
   *
   * @param value a moment possibly containing more than time
   * @returns a clean time only moment
   */
  public static asTimeOnly(value: Moment): Moment {
    return value?.isValid() ? moment(moment(value).format(DateParser.FORMAT_TIME), DateParser.FORMAT_TIME, true) : undefined;
  }

  /**
   * Parses the date part of a string representation of a date (and time).
   *
   * This function is half-strict.
   * The start if the string should be a strictly valid date but the rest of the
   * string doesn't care as long as it is clearly {@link SEPARATOR_BETWEEN_DATE_AND_TIME|separated}.
   *
   * If parsing fails the return value will not be undefined but {@link https://momentjs.com/docs/#/parsing/|invalid}.
   * @param text The string representation
   * @returns A moment according to the date part.
   */
     public static parseDate(text: string): Moment {
      const s = (text ?? '').trim();
      let date = moment(s, DateParser.FORMAT_DATE, true);

    if (!date.isValid()) {

        // maybe it's s.th. like 3/4/21 instead of 04/04/2021
        // we look for that.
        const generous = moment(s, DateParser.FORMAT_DATE, false);

        // TODO: Reactivate
        // if (generous.isValid() && (! generous.unusedInput || generous.unusedInput.length === 0)) {
        if (generous.isValid()) {
          date = generous;
        }
      }

      return date;
    }


  /**
   * Parses the time part of a string representation of a date (and time).
   *
   * This function is half-strict.
   * The end of the string should be a strictly valid time but the start of the
   * string doesn't care as long as it is clearly {@link SEPARATOR_BETWEEN_DATE_AND_TIME|separated}.
   *
   * If parsing fails the return value will not be undefined but {@link https://momentjs.com/docs/#/parsing/|invalid}.
   * @param text The string representation
   * @returns A moment according to the time part.
   */
  public static parseTime(text: string): Moment {
    const s = (text ?? '').trim();
    let time = moment(s, DateParser.FORMAT_TIME, true);

    // if invalid, maybe the time part is prefixed by a valid date?
    if (!time.isValid() && DateParser.parseDate(s).isValid()) {
      const separatorIndex = s.indexOf(DateParser.SEPARATOR_BETWEEN_DATE_AND_TIME);

      const suffix = separatorIndex > 0 ? s.substring(separatorIndex + 1).trim() : '';
      if (suffix.length === 0) {
        // if there is no suffix, there is no time
        return moment.invalid();
      } else {
        // try to parse the rest as time - this could still be invalid though
        time = moment(suffix, DateParser.FORMAT_TIME, false);
      }
    }

    // if still invalid, try being generous
    if (!time.isValid()) {
      time = moment(s, DateParser.FORMAT_TIME, false);
    }

    return time;
  }

  /**
   * @ignore
   *
   * Returns the format for a complete date string depending on whether time shoul be included or not.
   */
  private get fullFormat(): string {
    return this.withTime ? DateParser.FORMAT_DATEANDTIME : DateParser.FORMAT_DATE;
  }

}
