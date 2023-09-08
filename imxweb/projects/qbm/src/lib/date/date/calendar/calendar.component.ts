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

import { AfterViewInit, Component, EventEmitter, HostListener, Input, OnInit, Output, ViewChild } from '@angular/core';
import { AbstractControl } from '@angular/forms';
import { MatCalendar, MatCalendarUserEvent } from '@angular/material/datepicker';
import { DbVal } from 'imx-qbm-dbts';
import moment from 'moment-timezone';
import { Moment } from 'moment-timezone';

/**
 * Internal wrapper component around material calendar to pick a Moment date value.
 */
@Component({
  selector: 'imx-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.scss']
})
export class CalendarComponent implements OnInit, AfterViewInit {

  /**
   * The input control holding a Moment value.
   *
   * If the value is set then this date is used as the initial date of the calendar.
   *
   * Once the user picks a date from the calendar that date will be stored as Moment in the controls value.
   */
  @Input() public control: AbstractControl;

  /**
   * Optional value defining a minimun valid value for the date to pick.
   *
   * Note: Though the value of {@link #control|control} will be a Moment, this value is of type Date.
   */
  @Input() public min: Date;

  /**
   * Optional value defining a maximum valid value for the date to pick.
   *
   * Note: Though the value of {@link #control|control} will be a Moment, this value is of type Date.
   */
  @Input() public max: Date;

  /**
   * Output event emitted when the user clicks the close button of the calendar.
   *
   * Note: this wrapper is intened to be used inside an overlay BUT does not define this overlay.
   * As a consequence the overlay must be "closed" outside of this component.
   * Hence the button and this event.
   */
  @Output() public close = new EventEmitter();

  /**
   * @ignore only public because of internal databinding
   *
   * Represents the min date from our db layer.
   * Will be used as minium value if min input is undefined.
   */
  public readonly dbValMinDate = DbVal.MinDate;

  /**
   * @ignore only public because of internal databinding
   *
   * Represents the current value of the calendar.
   * Defaults to "today" but will be set to the current control's value if that is defined.
   */
  public datePickerDate = moment().clone();

  /**
   * @ignore only used in ngAfterViewInit()
   *
   * the wrapped material calendar.
   */
  @ViewChild(MatCalendar) private calendar: MatCalendar<Moment>;

  /**
   * @ignore AfterViewInit lifecycle hook.
   */
  public ngAfterViewInit(): void {
    this.calendar?.focusActiveCell();
  }

  /**
   * @ignore OnInit lifecycle hook
   */
  public ngOnInit(): void {
    // if control has a value change preselection for the calendar to that value
    if (this.control?.value) {
      this.datePickerDate = moment(this.control.value).clone();
    }
  }

  /**
   * @ignore only public because of internal databinding
   *
   * Handler for the dateChanged event of the material calendar.
   */
  public onDateChanged(event: MatCalendarUserEvent<Moment>): void {
    this.datePickerDate = moment(event.value).clone();
    this.control.setValue(this.datePickerDate);
  }

  /**
   * @ignore
   *
   * Emits close event, when ESC keyboard has been pressed.
   */
  @HostListener('keydown.Esc', ['$event'])
  private onEscapeKeyPress(event: KeyboardEvent): void {
    event.stopPropagation();
    this.close.emit();
  }

}
