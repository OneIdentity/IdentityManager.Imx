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
 * Copyright 2024 One Identity LLC.
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

import { Component, EventEmitter } from '@angular/core';
import { UntypedFormControl, Validators } from '@angular/forms';
import { EuiSelectOption } from '@elemental-ui/core';
import { Subject, Subscription } from 'rxjs';
import { ClassloggerService } from '../../classlogger/classlogger.service';
import { CdrEditor, ValueHasChangedEventArg } from '../cdr-editor.interface';
import { ColumnDependentReference } from '../column-dependent-reference.interface';
import { EntityColumnContainer } from '../entity-column-container';

@Component({
  selector: 'imx-edit-bitmask',
  templateUrl: './edit-bitmask.component.html',
  styleUrls: ['./edit-bitmask.component.scss'],
})
export class EditBitmaskComponent implements CdrEditor {
  /**
   * The form control associated with the editor.
   */
  public readonly control = new UntypedFormControl(undefined, { updateOn: 'blur' });

  /**
   * The container that wraps the column functionality.
   */
  public readonly columnContainer = new EntityColumnContainer<Number>();

  /**
   * Event that is emitted, after a value has been changed.
   */
  public readonly valueHasChanged = new EventEmitter<ValueHasChangedEventArg>();

  /**
   * A subject for triggering an update of the editor.
   */
  public readonly updateRequested = new Subject<void>();

  /**
   * The list of selectable bitmask options.
   */
  public options: EuiSelectOption[] = [];

  private readonly subscribers: Subscription[] = [];
  private isWriting = false;

  constructor(private readonly logger: ClassloggerService) {}

  /**
   * Binds a column dependent reference to the component.
   * Subscribes to subjects from the column dependent reference and its container.
   * @param cdref a column dependent reference
   */
  public bind(cdref: ColumnDependentReference): void {
    if (cdref && cdref.column) {
      this.columnContainer.init(cdref);
      const value = this.toArray(this.columnContainer.value);
      this.control.setValue(value, { emitEvent: false });
      if (this.columnContainer.isValueRequired && this.columnContainer.canEdit) {
        this.logger.debug(this, 'value is required');
        this.control.setValidators(Validators.required);
      }

      if (cdref.minlengthSubject) {
        this.subscribers.push(
          cdref.minlengthSubject.subscribe(() => {
            if (this.columnContainer.isValueRequired && this.columnContainer.canEdit) {
              this.logger.debug(this, 'value is required');
              this.control.setValidators(Validators.required);
            } else {
              this.control.setValidators(null);
            }
          }),
        );
      }

      this.subscribers.push(
        this.columnContainer.subscribe(() => {
          if (!this.isWriting) {
            return;
          }
          if (this.control.value !== this.columnContainer.value) {
            this.control.setValue(this.toArray(this.columnContainer.value));
          }
          this.valueHasChanged.emit({ value: this.control.value });
        }),
      );
      this.subscribers.push(this.control.valueChanges.subscribe(async (value) => this.writeValue(this.fromArray(value))));
      this.initOptions();
      this.logger.trace(this, 'Control initialized');
    } else {
      this.logger.error(this, 'The Column Dependent Reference is undefined');
    }
  }

  /**
   * Updates the value for the CDR.
   * @param values The values, that will be used as a new value.
   */
  private async writeValue(value: Number): Promise<void> {
    this.logger.debug(this, 'writeValue called with value', value);

    if (!this.columnContainer.canEdit || this.columnContainer.value === value) {
      return;
    }

    try {
      this.isWriting = true;
      this.logger.debug(this, 'writeValue - PutValue...');
      await this.columnContainer.updateValue(value);
    } catch (e) {
      this.logger.error(this, e);
    } finally {
      this.isWriting = false;
      const valueAfterWrite = this.toArray(this.columnContainer.value);
      if (this.control.value !== valueAfterWrite) {
        this.control.setValue(valueAfterWrite, { emitEvent: false });
      }
    }

    this.valueHasChanged.emit({ value, forceEmit: true });
  }

  private toArray(value: Number): Number[] {
    let array: number[] = [];
    let binaryRepresentation = parseInt(value.toString(), 10).toString(2);
    binaryRepresentation = binaryRepresentation.split('').reverse().join('');

    // You need to reverse the string to get the power of 2 corresponding
    for (let i = binaryRepresentation.length - 1; i >= 0; i--) {
      if (Number(binaryRepresentation[i]) === 1) {
        array.push(Math.pow(2, i));
      }
    }
    return array;
  }

  private fromArray(values: number[]): Number {
    let result = 0;
    for (let idx = 0; idx < values.length; idx++) {
      result += values[idx];
    }
    return result;
  }

  protected getBinaryNumber(idx: number): number {
    return Math.pow(2, idx);
  }

  private async initOptions(): Promise<void> {
    const bitMaskCaptions = this.columnContainer?.metaData?.GetBitMaskCaptions();
    const allOptions = bitMaskCaptions?.map((elem, idx): EuiSelectOption => ({ display: elem, value: this.getBinaryNumber(idx) })) || [];
    // filter out deactivated captions, these are empty strings
    this.options = allOptions?.filter((option: EuiSelectOption) => !!option?.display.length);
  }
}
