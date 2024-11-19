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

import { Component, ErrorHandler, EventEmitter, OnDestroy } from '@angular/core';
import { UntypedFormControl } from '@angular/forms';
import { Subject, Subscription } from 'rxjs';
import { CdrEditor, ValueHasChangedEventArg } from '../cdr-editor.interface';
import { ColumnDependentReference } from '../column-dependent-reference.interface';
import moment from 'moment-timezone';
import { Moment } from 'moment-timezone';

import { EntityColumnContainer } from '../entity-column-container';
import { ClassloggerService } from '../../classlogger/classlogger.service';
import { DateFormat } from 'imx-qbm-dbts';

/**
 * Provides a {@link CdrEditor | CDR editor} for editing / viewing date value columns
 * 
 * It uses a {@link DateComponent | date component} for editing the value.
 * When set to read-only, it uses a {@link ViewPropertyComponent | view property component} to display the content.
 */
@Component({
  selector: 'imx-edit-date',
  templateUrl: './edit-date.component.html',
  styleUrls: ['./edit-date.component.scss'],
})
export class EditDateComponent implements CdrEditor, OnDestroy {
  /**
   * The form control associated with the editor.
   */
  public readonly control = new UntypedFormControl(undefined, { updateOn: 'blur' });

  /**
   * The container that wraps the column functionality.
   */
  public readonly columnContainer = new EntityColumnContainer<Date>();

  /**
   * Event that is emitted, after a value has been changed.
   */
  public readonly valueHasChanged = new EventEmitter<ValueHasChangedEventArg>();

  /**
   * A subject for triggering an update of the editor.
   */
  public readonly updateRequested = new Subject<void>();

  /**
   * Indicator that the component is loading data from the server.
   */
  public isBusy = false;

  private readonly subscribers: Subscription[] = [];
  private isWriting = false;

  /**
   * Determines, if a time control should be added.
   */
  public get withTime(): boolean {
    // try to get the date format detail from metadata; defaulting to DateTime.
    const dateFormat = this.columnContainer.metaData?.GetDateFormat() ?? DateFormat.DateTime;

    return dateFormat === DateFormat.DateTime || dateFormat === DateFormat.UtcDateTime;
  }

  public constructor(private readonly errorHandler: ErrorHandler, private logger: ClassloggerService) {}

  /**
   * Unsubscribes all events, after the 'OnDestroy' hook is triggered.
   */
  public ngOnDestroy(): void {
    this.subscribers.forEach((s) => s.unsubscribe());
  }

  /**
   * Binds a column dependent reference to the component.
   * Subscribes to subjects from the column dependent reference and its container.
   * @param cdref a column dependent reference
   */
  public bind(cdref: ColumnDependentReference): void {
    if (cdref && cdref.column) {
      this.columnContainer.init(cdref);

      this.resetControlValue();

      if (cdref.minlengthSubject) {
        this.subscribers.push(
          cdref.minlengthSubject.subscribe(() => {
            this.resetControlValue();
          })
        );
      }

      this.subscribers.push(this.control.valueChanges.subscribe(async () => this.writeValue(this.control.value)));

      // bind to entity change event
      this.subscribers.push(
        this.columnContainer.subscribe(() => {
          if (!this.isWriting) {
            this.logger.trace(this, 'Control set to new value');
            this.resetControlValue();
            this.valueHasChanged.emit({ value: this.control.value });
            this.control.updateValueAndValidity({ onlySelf: true, emitEvent: true });
          }
        })
      );

      this.setValidators();

      this.subscribers.push(
        this.updateRequested.subscribe(() => {
          setTimeout(() => {
            try {
              this.setValidators();
              this.control.updateValueAndValidity({ onlySelf: true, emitEvent: false });
              this.resetControlValue();
            } finally {
            }
            this.valueHasChanged.emit({ value: this.control.value });
          });
        })
      );
    }
  }

  /**
   * Sets Validators.required, if the control is mandatory, else it's set to null.
   * @ignore used internally
   */
  private setValidators() {
    if (this.columnContainer.isValueRequired && this.columnContainer.canEdit) {
      this.control.addValidators((control) => (control.value == undefined || control.value.length === 0 ? { required: true } : null));
    } else {
      this.control.setValidators(null);
    }
  }

  private resetControlValue(): void {
    const value = this.columnContainer.value ? moment(this.columnContainer.value) : undefined;
    this.updateControlValue(value);
  }

  private updateControlValue(value: Moment): void {
    if (this.control.value !== value) {
      this.control.setValue(value, { emitEvent: false });
    }
  }

  /**
   * Updates the value for the CDR.
   * @param value The Moment object, that is used as the new value for the control.
   */
  private async writeValue(value: Moment): Promise<void> {
    if (this.control.errors) {
      return;
    }

    // Beware: the columnContainer used date while the date editor uses moment!!
    const date = value == null ? undefined : value.toDate();
    const resetValue = this.columnContainer.value;
    this.logger.debug(this, 'writeValue called with value', date);
    if (!this.columnContainer.canEdit || this.columnContainer.value === date) {
      return;
    }

    this.updateControlValue(value);

    this.isBusy = true;
    try {
      this.isWriting = true;
      await this.columnContainer.updateValue(date);
    } catch (error) {
      this.errorHandler.handleError(error);
      this.control?.setValue(resetValue ? moment(resetValue) : undefined);
    } finally {
      this.isBusy = false;
      this.isWriting = false;

      // Writing could fail or not but in the end the columns value (date) and the controls value (moment) should be "equal".
      this.resetControlValue();
    }

    this.valueHasChanged.emit({ value: this.columnContainer.value, forceEmit: true });
  }
}
