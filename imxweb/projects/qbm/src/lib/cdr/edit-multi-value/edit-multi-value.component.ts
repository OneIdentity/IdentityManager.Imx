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

import { Component, EventEmitter, OnDestroy } from '@angular/core';
import { UntypedFormControl, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';

import { ColumnDependentReference } from '../column-dependent-reference.interface';
import { ClassloggerService } from '../../classlogger/classlogger.service';
import { EntityColumnContainer } from '../entity-column-container';
import { CdrEditor, ValueHasChangedEventArg } from '../cdr-editor.interface';
import { MultiValueService } from '../../multi-value/multi-value.service';

/**
 * A component for viewing / editing multi value columns
 */
@Component({
  selector: 'imx-edit-multi-value',
  templateUrl: './edit-multi-value.component.html',
  styleUrls: ['./edit-multi-value.component.scss'],
})
export class EditMultiValueComponent implements CdrEditor, OnDestroy {
  public readonly control = new UntypedFormControl(undefined, { updateOn: 'blur' });

  public readonly columnContainer = new EntityColumnContainer<string>();

  public readonly valueHasChanged = new EventEmitter<ValueHasChangedEventArg>();

  private readonly subscribers: Subscription[] = [];
  private isWriting = false;

  constructor(private readonly logger: ClassloggerService, private readonly multiValueProvider: MultiValueService) {}

  public ngOnDestroy(): void {
    this.subscribers.forEach((subscriber) => subscriber.unsubscribe());
  }

  /**
   * Binds a column dependent reference to the component
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
          })
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
        })
      );
      this.subscribers.push(this.control.valueChanges.subscribe(async (value) => this.writeValue(this.fromTextArea(value))));
      this.logger.trace(this, 'Control initialized');
    } else {
      this.logger.error(this, 'The Column Dependent Reference is undefined');
    }
  }

  /**
   * updates the value for the CDR
   * @param values the new value
   */
  private async writeValue(value: string): Promise<void> {
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

  private toTextArea(value: string): string {
    const values = this.multiValueProvider.getValues(value);
    return values && values.length > 0 ? values.join('\r\n') : undefined;
  }

  private fromTextArea(value: string): string {
    return value ? this.multiValueProvider.getMultiValue(value.replace(/\r\n/g, '\n').split('\n')) : undefined;
  }
}
