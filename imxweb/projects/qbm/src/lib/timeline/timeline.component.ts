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

import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { TimelineEventsGroupedByDate, ExtendedObjectHistoryEvent } from './timeline';
import moment from 'moment-timezone';
import { ObjectHistoryService } from '../object-history/object-history.service';

@Component({
  selector: 'imx-timeline',
  templateUrl: './timeline.component.html',
  styleUrls: ['./timeline.component.scss']
})
export class TimelineComponent implements OnInit, OnChanges {
  @Input() public data: ExtendedObjectHistoryEvent[];

  public eventsGroupedByDate: TimelineEventsGroupedByDate[] = [];

  constructor() { }

  /**
   * Inits table
   */
  ngOnInit(): void {
    this.loadEvents();
  }

  /**
   * Filtering and reloading based on the paramater
   */
  ngOnChanges(): void {
    this.loadEvents();
  }

  /**
   * Loads all input data and creates eventsGroupedByDate
   */
  public loadEvents(): void {
    this.eventsGroupedByDate = [];

    this.data.forEach((elem) => {
      const date = moment(elem.ChangeTime).format("L");

      elem.Time = moment(elem.ChangeTime).format("HH:mm:ss");
      if (this.eventsGroupedByDate.some((event) => event.date === date)) {
        const dateEvents = this.eventsGroupedByDate.find((event) => event.date === date).events;
        dateEvents.push(elem);
        dateEvents.sort((a, b) => b.Time.localeCompare(a.Time));
      } else {
        this.eventsGroupedByDate.push({
          date: date,
          events: [elem]
        });
      }
    });
  }
}
