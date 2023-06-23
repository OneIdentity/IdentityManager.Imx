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

import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { AbstractControl, FormControl, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';

import moment from 'moment-timezone';
import { Moment } from 'moment-timezone';
import { Subscription } from 'rxjs';
import { ClassloggerService } from '../../classlogger/classlogger.service';
import { DateParser } from './date-parser';

/**
 * A component for viewing / editing date and time values.
 *
 * The value to be displayed/edited needs to be supplied as
 * a {@link https://momentjs.com/docs/|Moment.js} value
 * of a {@link #control|form control input}.
 *
 */
@Component({
  selector: 'imx-date',
  templateUrl: './date.component.html',
  styleUrls: ['./date.component.scss']
})
export class DateComponent implements OnInit, OnDestroy {
  // ######################################################################################################
  // INTERNAL REMARKS
  // This component utilizes three internal form fields
  // 1. a text form field bound to a text input - contains the text representation of the date (and time).
  // 2. a moment form field for the date part only bound to a calendar picker.
  // 3. a moment form field for the time part only bound to a time picker.
  //
  // @1: The text to date parsing logic (and vice versa) has been extracted to a separate DateParser class.
  // @2: The date picker is basically a wrapper around the material calendar.
  // @3: The time picker is basically a wrapper around the elemental time picker.
  //
  // Validation is done twice.
  // a) on the text input field within this form - simply necessary because this is the primary form field.
  // b) on the input control - necessary for proper integration into outside form validation.
  // ######################################################################################################

  /**
   * The input form control holding the {@link https://momentjs.com/docs/|Moment} value to be displayed / edited.
   */
  @Input() public control: AbstractControl;

  /**
   * A label for the form control.
   */
  @Input() public display: string;

  /**
   * (Optional): minimum allowed value - affects validation.
   *
   * Note: Though {@link #control|input control} holds a Moment value, this is a Date value.
   */
  @Input() public min: Date;

  /**
   * (Optional): maximum allowed value - affects validation.
   *
   * Note: Though {@link #control|input control} holds a Moment value, this is a Date value.
   */
  @Input() public max: Date;

  /**
   * Suffix for the data-imx-identitfier (infomational) attribute applied internally to the dom.
   */
  @Input() public imxIdentifierSuffix: string;

  /**
   * Whether or not the date is a required value - affects validation.
   */
  @Input() public isValueRequired: boolean;

  /**
   * Whether the value should only be displayed and not edited.
   */
  @Input() public isReadonly: boolean;

  /**
   * Whether or not the loading spinner is visible.
   */
  @Input() public isLoading: boolean;

  /**
   * Whether or not the time part should be displayed / edited.
   *
   * If true a time picker is accessible in addition to the calendar date picker.
   */
  @Input() public withTime = true;

  /**
   * @ignore only public because of databinding in template
   *
   * internal state member for whether the calendar date picker overlay shall be visible
   */
  public isDatePickerOpen = false;

  /**
   * @ignore only public because of databinding in template
   *
   * internal state member for whether the time picker overlay shall be visible
   */
  public isTimePickerOpen = false;

  /**
   * @ignore only public because of databinding in template
   *
   * internal shadow form control for the text input field
   */
  public shadowText = new FormControl('', { updateOn: 'blur' });

  /**
   * @ignore only public because of databinding in template
   *
   * internal shadow form control for the calendar date picker. Only holds the date part (i.e. without time).
   */
  public shadowDate = new FormControl();

  /**
   * @ignore only public because of databinding in template
   *
   * internal shadow form control for the time picker. Only holds the time part (i.e. without year/month/day)
   */
  public shadowTime = new FormControl();

  /**
   * @ignore
   * the result of the internal shadow form control.
   * Useful to avoid unecessay update loop when writing back the value to the input control.
   */
  private result: Moment;

  /**
   * @ignore
   *
   * The form control subscriptions. Useful for easy unsubscription.
   */
  private readonly subscriptions: Subscription[] = [];

  /**
   * @ignore
   *
   * The text <-> moment date and time parser.
   */
  private parser !: DateParser;

  /**
   * Creates a new date editor component.
   *
   * @param logger The logger service to be injected.
   */
  constructor(private logger: ClassloggerService) {
  }

  /**
   * @ignore only public because of databinding in template
   *
   * Returns the error text LDS key resulting from validation of user input.
   *
   * Note: There is no need to display this value externally as
   * there is alreay an area displaying this error within the template
   * of this component.
   */
  public get validationErrorKey(): string {
    const errors = this.shadowText.errors;

    if (errors?.['matDatepickerMin'] || errors?.['matDatepickerMax']) {
      return '#LDS#The date you entered is outside of the allowed range.';
    }

    if (errors?.['matDatepickerParse']) {
      return '#LDS#The value you entered is not a valid date.';
    }

    if (errors?.['required']) {
      return '#LDS#This field is mandatory.';
    }

    return '';
  }

  /**
   * @ignore OnInit lifecycle hook
   */
  public ngOnInit(): void {
    this.parser = new DateParser(this.logger, this.withTime);

    this.setupValidators();
    this.handleControlChanged();

    this.subscriptions.push(this.control.valueChanges.subscribe(x => this.handleControlChanged()));
    this.subscriptions.push(this.shadowText.valueChanges.subscribe(x => this.handleShadowTextChanged()));
    this.subscriptions.push(this.shadowTime.valueChanges.subscribe(x => this.handleShadowTimeChanged()));
    this.subscriptions.push(this.shadowDate.valueChanges.subscribe(x => this.handleShadowDateChanged()));
  }

  /**
   * @ignore OnDestroy lifecycle hook
   */
  public ngOnDestroy(): void {
    this.subscriptions.forEach(s => s.unsubscribe());
  }

  /**
   * @ignore only public because of databinding in template
   *
   *  Event handler method to toggle whether the calendar date picker is showing.
   *  Bound internally to the click on the calendar icon button.
   */
  public toggleDatePickerOpen(event: Event): void {
    this.isDatePickerOpen = !this.isDatePickerOpen;
    event.stopPropagation();
  }

  /**
   * @ignore only public because of databinding in template
   *
   * Event handler method to toggle whether the time picker is showing.
   *  Bound internally to the click on clock icon button.
   */
  public toggleTimePickerOpen(event: Event): void {
    this.isTimePickerOpen = !this.isTimePickerOpen;
    event.stopPropagation();
  }

  /**
   * @ignore only public because of databinding in template
   *
   * Handles a click to the backdrop of an open time picker.
   *  Necessary to distingush between two cases that are outside of the time picker.
   *  a) somewhere in the drop down of hour or minute
   *  b) somewhere else outside of the time picker.
   *
   *  In case a) the picker shall remain open while in case b) it should be closed.
   */
  public handleTimePickerOutsideClick(event: Event): void {
    const uiEvent = event as UIEvent;

    if (uiEvent) {
      const composedPath = uiEvent.composedPath();
      for (const target of composedPath) {
        const element = target as unknown as HTMLElement;
        if (element.localName === 'mat-option') {
          // the click was intended to select a time picker option
          // so: return (and do not close the time picker)
          return;
        }
      }
    }

    this.isTimePickerOpen = false;
  }

  public focusout(): void {
    this.handleShadowTimeChanged();
  }

  /**
   * Sets up the validators.
   *
   * This method is automatically called OnInit.
   * So normally it does not need to be called again unless
   * the validation relevant input values changed after OnInit.
   */
  public setupValidators(): void {
    const validators: ValidatorFn[] = [];

    if (this.isValueRequired && !this.isReadonly) {
      validators.push(Validators.required);
    }

    validators.push((control) => this.validateTextInDateRange(control.value as string));

    this.shadowText.setValidators(validators);
    this.control.addValidators((control) => this.validateMomentInDateRange(control.value as Moment));
  }

  /**
   * @ignore
   *
   * Returns the string representation of the current (outside) control value.
   */
  private getDateTextFromControl(): string {
    return this.parser.format(this.control?.value);
  }

  /**
   * @ignore
   *
   * Returns the string representation of the current (internal) shadow pickers.
   */
  private getDateTextFromShadowDateTime(): string {
    let value: Moment;

    if (this.shadowDate.value) {
      const d = moment(this.shadowDate.value);
      value = moment({year: d.year(), month: d.month(), day: d.date()});
    }

    if (this.shadowTime.value) {
      // Apply the time part to the given date part.
      // If no date has been set, use either min or today as date part.
      const t = moment(this.shadowTime.value);

      // @ts-ignore
      value = value ?? (this.min ? moment(this.min) : moment());
      value = value.hour(t.hour()).minute(t.minute());
    }

    // @ts-ignore
    return this.parser.format(value);
  }

  /**
   * @ignore
   *
   * handler for when the value of the outside control changed
   */
  private handleControlChanged(): void {
    const updatedValue = this.control.value as Moment;

    if (updatedValue !== this.result) {
      this.result = updatedValue;
      this.updateShadowText(this.getDateTextFromControl());
      this.updateShadowDate(this.control.value);

      if (this.withTime) {
        this.updateShadowTime(this.control.value);
      }
    }
  }

  /**
   * @ignore
   *
   * handler for when the value of the internal date only shadow form changed
   */
  private handleShadowDateChanged(): void {
    this.isDatePickerOpen = false;
    this.updateShadowText(this.getDateTextFromShadowDateTime());
    this.writeBackShadowTextToControl();
  }

  /**
   * @ignore
   *
   * handler for when the value of the internal time only shadow form changed
   */
  private handleShadowTimeChanged(): void {
    // note: in contrast to the date picker, we leave the time picker open
    // because editing the time is a more complex action the usually yields intermediate results
    this.updateShadowText(this.getDateTextFromShadowDateTime());
    this.writeBackShadowTextToControl();
  }

  /**
   * @ignore
   *
   * handler for when the value of the internal text shadow form changed
   */
  private handleShadowTextChanged(): void {
    const text = this.shadowText.value;

    this.updateShadowDate(DateParser.parseDate(text));
    this.updateShadowTime(DateParser.parseTime(text));
    this.writeBackShadowTextToControl();
  }

  /**
   * @ignore
   *
   * updates the value of the internal date only shadow form
   */
  private updateShadowDate(value: Moment): void {
    const shadow = DateParser.asDateOnly(value);
    this.shadowDate.setValue(shadow, { emitEvent: false });
  }

  /**
   * @ignore
   *
   * updates the value if the internal text shadow form
   */
  private updateShadowText(text: string): void {
    if (text !== this.shadowText.value) {
      this.shadowText.setValue(text, { emitEvent: false });
    }
  }

  /**
   * @ignore
   *
   * upates the value of the internal time shadow form
   */
  private updateShadowTime(value: Moment): void {
    const shadow = DateParser.asTimeOnly(value);
    this.shadowTime.setValue(shadow, { emitEvent: false });
  }

  /**
   * @ignore
   *
   * Writes back the complete date (that has been set in the shadow forms)
   * to the input form.
   */
  private writeBackShadowTextToControl(): void {
    const dateAndTimeString = this.shadowText.value as string;

    // Setting the value on the outside control needs to raise a "value changed" event.
    // Since this component listens to that event it needs a way to detect its own change in order to avoid circles.
    // To achieve that the resulting value is stored in a separate member variable (this.result).
    this.result = this.parser.parseDateAndTimeString(dateAndTimeString);
    this.control.setValue(this.result, { emitEvent: true });
    this.control.markAsDirty();
  }

  /**
   * @ignore
   *
   * validation method: validates that the text representation of a date (and time).
   */
  private validateTextInDateRange(text: string): ValidationErrors | null {
    const date = this.parser.parseDateAndTimeString(text);
    return this.validateMomentInDateRange(date);
  }

  /**
   * @ignore
   *
   * validation method: validates the moment representation of a date (and time)
   */
  private validateMomentInDateRange(date: Moment): ValidationErrors | null {
    if (date && !date.isValid()) {
      return { matDatepickerParse: true };
    }

    if (this.min && date < moment(this.min)) {
      return { matDatepickerMin: true };
    }

    if (this.max && date > moment(this.max)) {
      return { matDatepickerMax: true };
    }
  }

}
