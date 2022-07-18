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

import { Component, ElementRef, HostBinding, NgZone, Input, OnChanges, SimpleChanges } from '@angular/core';

import { ObjectHistoryEvent } from 'imx-qbm-dbts';
import { ImxTimeline } from '../../timeline/imx-timeline';
import { ImxTranslationProviderService } from '../../translation/imx-translation-provider.service';

@Component({
  selector: 'imx-object-history-timeline',
  templateUrl: './object-history-timeline.component.html',
  styles: []
})
export class ObjectHistoryTimelineComponent implements OnChanges {
  @Input() public historyData: ObjectHistoryEvent[];
  private timeline: ImxTimeline;


  @HostBinding('class.imx-loader-hidden') private hideWhileLoading: boolean;

  constructor(
    elementRef: ElementRef,
    translationProvider: ImxTranslationProviderService,
    private zone: NgZone
  ) {
    // initially hide
    this.hideWhileLoading = true;

    this.zone.runOutsideAngular(() => {
      this.timeline = new ImxTimeline(
        elementRef,
        {
          locale: translationProvider.Culture,
          clusterMaxItems: 3
        },
        translationProvider.MultiLanguageCaptions
      );
    });
  }

  public ngOnChanges(changes: SimpleChanges): void {
    if (changes && changes['historyData']) {
      this.timeline.setDateRange(this.getDate('min'), this.getDate('max'), false);

      this.refresh(this.historyData);
    }
  }

  private refresh(data?: ObjectHistoryEvent[]): void {
    this.zone.runOutsideAngular(async () => {

      this.timeline.Draw(
        data.map((item: ObjectHistoryEvent) => {
          const changeTime = new Date(item.ChangeTime);
          return {
            className: 'imx-timeline-event imx-timeline-event-' + item.ChangeType.toLocaleLowerCase(),
            start: changeTime,
            rows: [
              `${changeTime.toLocaleString()}: ${this.getThisOrNothing(item.ChangeType)}`,
              `${this.getThisOrNothing(item.Property, ': ')}${this.getThisOrNothing(item.LongDisplay, '', item.Display)}`
            ]
          };
        })

      );


      this.hideWhileLoading = false;
    });
  }

  private getThisOrNothing(value: string, suffix?: string, alternativeValue?: string): string {
    suffix = suffix ? suffix : '';
    alternativeValue = alternativeValue ? alternativeValue + suffix : '';
    return value ? value + suffix : alternativeValue;
  }

  private getDate(type: 'min' | 'max'): Date {
    const dates = this.historyData.map(elem => new Date(elem.ChangeTime));
    const minMax = new Date(type === 'min' ? Math.min.apply(null, dates) : Math.max.apply(null, dates));
    // increase or decrease the year by 2 for better visualization
    minMax.setFullYear(minMax.getFullYear() + (type === 'min' ? -2 : 2));
    return minMax;
  }
}
