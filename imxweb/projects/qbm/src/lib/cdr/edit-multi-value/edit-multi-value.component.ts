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

import { Component, EventEmitter, OnDestroy } from '@angular/core';
import { UntypedFormControl, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';

import { ClassloggerService } from '../../classlogger/classlogger.service';
import { MultiValueService } from '../../multi-value/multi-value.service';
import { CdrEditor, ValueHasChangedEventArg } from '../cdr-editor.interface';
import { ColumnDependentReference } from '../column-dependent-reference.interface';
import { EntityColumnContainer } from '../entity-column-container';

/**
 * Provides a {@link CdrEditor | CDR editor} for editing / viewing multi valued columns.
 *
 * To change its value, it uses a text area. Each line represents a part of the multi value.
 * When set to read-only, it uses a {@link ViewPropertyComponent | view property component} to display the content.
 */
@Component({
  selector: 'imx-edit-multi-value',
  templateUrl: './edit-multi-value.component.html',
  styleUrls: ['./edit-multi-value.component.scss'],
})
export class EditMultiValueComponent implements CdrEditor, OnDestroy {
  /**
   * The form control associated with the editor.
   */
  public readonly control = new UntypedFormControl(undefined, { updateOn: 'blur' });

  /**
   * The container that wraps the column functionality.
   */
  public readonly columnContainer = new EntityColumnContainer<string>();

  /**
   * Event that is emitted, after a value has been changed.
   */
  public readonly valueHasChanged = new EventEmitter<ValueHasChangedEventArg>();

  private readonly subscribers: Subscription[] = [];
  private isWriting = false;

  constructor(
    private readonly logger: ClassloggerService,
    private readonly multiValueProvider: MultiValueService,
  ) {}

  /**
   * Unsubscribes all events, after the 'OnDestroy' hook is triggered.
   */
  public ngOnDestroy(): void {
    this.subscribers.forEach((subscriber) => subscriber.unsubscribe());
  }

  /**
   * Binds a column dependent reference to the component.
   * Subscribes to subjects from the column dependent reference and its container.
   * @param cdref a column dependent reference
   */
  public bind(cdref: ColumnDependentReference): void {
    if (cdref && cdref.column) {
      this.columnContainer.init(cdref);
      this.control.setValue(this.toTextArea(this.columnContainer.value), { emitEvent: false });
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
            this.control.setValue(this.columnContainer.value);
          }
          this.valueHasChanged.emit({ value: this.control.value });
        }),
      );
      this.subscribers.push(this.control.valueChanges.subscribe(async (value) => this.writeValue(this.fromTextArea(value))));
      this.logger.trace(this, 'Control initialized');
    } else {
      this.logger.error(this, 'The Column Dependent Reference is undefined');
    }
  }

  /**
   * Updates the value for the CDR.
   * @param values The values, that will be used as a new value.
   */
  private async writeValue(value: string | undefined): Promise<void> {
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
      const valueAfterWrite = this.toTextArea(this.columnContainer.value);
      if (this.control.value !== valueAfterWrite) {
        this.control.setValue(valueAfterWrite, { emitEvent: false });
      }
    }

    this.valueHasChanged.emit({ value, forceEmit: true });
  }

  private toTextArea(value: string): string | undefined {
    const values = this.multiValueProvider.getValues(value);
    return values && values.length > 0 ? values.join('\r\n') : undefined;
  }

  private fromTextArea(value: string): string | undefined {
    return value ? this.multiValueProvider.getMultiValue(value.replace(/\r\n/g, '\n').split('\n')) : undefined;
  }
}
