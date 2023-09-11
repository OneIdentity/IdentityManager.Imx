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

import { Component, Input, EventEmitter, Output, HostListener } from '@angular/core';
import { AbstractControl, FormControl } from '@angular/forms';
import { Moment } from 'moment-timezone';

/**
 * Internal wrapper component around elemental time picker to pick a Moment time value.
 */
@Component({
  selector: 'imx-time-picker',
  templateUrl: './time-picker.component.html',
  styleUrls: ['./time-picker.component.scss']
})
export class TimePickerComponent {

  /**
   * The input control for the time.
   *
   * When a time is picked it will be stored into the value of this control.
   */

  // TODO: Check Upgrade
  @Input() public control: AbstractControl;

  /**
   * This event will be emitted when the user clicks on the close button.
   */
  @Output() public close = new EventEmitter();

  /**
   * @ignore only public because of internal databinding
   *
   * Handles the value change event of the time picker.
   */
  public onValueChange(value: Moment): void {
    this.control.setValue(value);
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
