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


import { ElementRef } from '@angular/core';
import * as links from 'chap-timeline';

import { TimelineLocales } from './timeline-locales';
import { MultiLanguageCaptions } from '../base/multi-language-captions';

export interface ImxTimelineItem {
  start: Date;
  rows: string[];
  className?: string;
}

export interface ImxTimelineOptions {
  width?: string;
  height?: string;
  editable?: boolean;
  style?: string;
  locale?: string;
  cluster?: string;
  clusterMaxItems?: number;
  unselectable?: boolean;
  minHeight?: number;
  animate?: boolean;
  animateZoom?: boolean;
  axisOnTop?: boolean;
  min?: Date;
  max?: Date;
  MONTHS?: string[];
}

export class ImxTimeline {

  private timeline: any;

  private currentOptions: ImxTimelineOptions = {
    width: '100%',
    height: 'auto',
    editable: false,
    style: 'box',
    locale: 'en-US',
    cluster: 'cluster',
    clusterMaxItems: 20,
    unselectable: true,
    minHeight: 250,
    animate: false, // animation is slow for large number of events
    animateZoom: false, // animation is slow for large number of events
    axisOnTop: false
  };

  constructor(
    elementRef: ElementRef,
    options: ImxTimelineOptions,
    captions: MultiLanguageCaptions
  ) {
    // todo: reuse timeline js from Runtime
    this.timeline = new links.Timeline(elementRef.nativeElement);

    const mergedOptions = { ...this.currentOptions, ...options };

    const locale = TimelineLocales.GetLocale(mergedOptions.locale, captions);

    this.currentOptions = { ...mergedOptions, ...locale };
    this.timeline.setOptions(this.currentOptions);
  }

  public Draw(items: ImxTimelineItem[]): void {
    this.timeline.draw(items.map(item => ({
      start: item.start,
      content: item.rows.map(row => `<p>${row}</p>`).join(''),
      className: item.className
    })));
  }


  public setDateRange(min: Date, max: Date, redraw: boolean): void {
    this.timeline.setOptions({ ...this.currentOptions, ...{ min, max }});
    this.timeline.setVisibleChartRange(min, max, redraw);
  }
}
