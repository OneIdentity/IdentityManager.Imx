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

@Component({
  selector: 'imx-timeline',
  templateUrl: './timeline.component.html',
  styleUrls: ['./timeline.component.scss']
})
export class TimelineComponent implements OnInit, OnChanges {

  @Input() public data: ExtendedObjectHistoryEvent[];
  /**from input can be in the following form: 'Invalid data', '01/01/2000', '01/01/2000 00:00:00' */
  @Input() public from: string;
  /**to input can be in the following form: 'Invalid data', '01/01/2000', '01/01/2000 00:00:00' */
  @Input() public to: string;

  public eventsGroupedByDate: TimelineEventsGroupedByDate[] = [];

  constructor() { }

  /**
   * Inits table
   */
  ngOnInit(): void {
    this.loadEvents(this.data);
  }

  /**
   * Filtering and reloading based on the paramater
   * @param changes SimpleChanges event what detects when the input data is changing
   */
  ngOnChanges(changes: SimpleChanges): void {
    if (changes.data) this.loadEvents(this.data);
    if (changes.from || changes.to) this.filterByTime();
  }

  /**
   * Loads all input data and creates eventsGroupedByDate
   */
  public loadEvents(data: ExtendedObjectHistoryEvent[]): void {
    this.eventsGroupedByDate = [];

    data.forEach((elem) => {
      const date = moment(elem.ChangeTime).format("L");

      elem.Time = moment(elem.ChangeTime).format("HH:mm:ss");
      if (this.eventsGroupedByDate.some((event) => event.date === date)) {
        this.eventsGroupedByDate.find((event) => event.date === date).events.push(elem);
      } else {
        this.eventsGroupedByDate.push({
          date: date,
          events: [elem]
        });
      }
    });
  }

  /**
   * Handles from and to filtering and loads the result after filtering
   */
  public filterByTime(): void {
    let results = [];

    if (this.from === 'Invalid date' && this.to === 'Invalid date') {
      this.loadEvents(this.data);
      return;
    }

    results = this.data.filter((elem) => {
      const isFromValid = this.from !== 'Invalid date';
      const isToValid = this.to !== 'Invalid date';
      const fromValidation = moment(elem.ChangeTime).isAfter(moment(this.from), 'minute');
      const toValidation = moment(elem.ChangeTime).isBefore(moment(this.to), 'minute');

      if (isFromValid && !isToValid) return fromValidation;
      if (!isFromValid && isToValid) return toValidation;

      return fromValidation && toValidation;
    });

    this.loadEvents(results);
  }

}
