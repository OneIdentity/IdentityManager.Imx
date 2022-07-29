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
import { MultiLanguageCaptions } from '../base/multi-language-captions';

export class TimelineLocales {
  public static GetLocale(culture: string, captions: MultiLanguageCaptions): { [key: string]: any } {
    const shortMonths = new Intl.DateTimeFormat(culture, { month: 'short' });
    const longMonths = new Intl.DateTimeFormat(culture, { month: 'long' });
    const shortWeekdays = new Intl.DateTimeFormat(culture, { weekday: 'short' });
    const longWeekdays = new Intl.DateTimeFormat(culture, { weekday: 'long' });

    const months = Array.apply(null, Array(12));
    const days = Array.apply(null, Array(7));

    return {
      MONTHS: months.map((_, month: number) => longMonths.format(new Date(1999, month, 1))),
      MONTHS_SHORT: months.map((_, month: number) => shortMonths.format(new Date(1999, month, 1))),

      // Janurary 3th, 1999 was a Sunday. start from there to obtain week day names. not currently possible otherwise
      DAYS: days.map((_, day: number) => longWeekdays.format(new Date(1999, 0, 3 + day))),
      DAYS_SHORT: days.map((_, day: number) => shortWeekdays.format(new Date(1999, 0, 3 + day))),
      ZOOM_IN: captions.Timeline_ZoomIn,
      ZOOM_OUT: captions.Timeline_ZoomOut,
      MOVE_LEFT: captions.Timeline_MoveLeft,
      MOVE_RIGHT: captions.Timeline_MoveRight,
      CLUSTER_DESCRIPTION: captions.Timeline_ClusterDescription,
      CLUSTER_TITLE: captions.Timeline_ClusterTitle,
      NEW: captions.Timeline_New,
      CREATE_NEW_EVENT: captions.Timeline_CreateNewEvent,
    };
  }
}
