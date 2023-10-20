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
import { OnDestroy, Component, EventEmitter, ErrorHandler } from '@angular/core';
import { AbstractControl, Validators } from '@angular/forms';
import { Subject, Subscription } from 'rxjs';

import { CdrEditor, ValueHasChangedEventArg } from './cdr-editor.interface';
import { ColumnDependentReference } from './column-dependent-reference.interface';
import { ClassloggerService } from '../classlogger/classlogger.service';
import { EntityColumnContainer } from './entity-column-container';
import { ServerError } from '../base/server-error';
import { ValType } from 'imx-qbm-dbts';

@Component({ template: '' })
export abstract class EditorBase<T = any> implements CdrEditor, OnDestroy {
  /**
   * The form element, that is used in the template for the component
   */
  public abstract readonly control: AbstractControl;

  public readonly columnContainer = new EntityColumnContainer<T>();

  public readonly valueHasChanged = new EventEmitter<ValueHasChangedEventArg>();

  public readonly updateRequested = new Subject<void>();

  public isBusy = false;
  public lastError: ServerError;
  public get maxlength(): number | undefined {
    return this.columnContainer?.metaData?.GetMaxLength();
  }

  private readonly subscribers: Subscription[] = [];
  private isWriting = false;

  public constructor(protected readonly logger: ClassloggerService, protected readonly errorHandler?: ErrorHandler) {}

  public ngOnDestroy(): void {
    this.subscribers.forEach((s) => s.unsubscribe());
  }

  public get validationErrorMessage(): string {
    if (this.control.errors?.['generalError']) {
      return this.lastError.toString();
    }
  }

  /**
   * Binds a column dependent reference to the component
   * @param cdref a column dependent reference
   */
  public bind(cdref: ColumnDependentReference): void {
    if (cdref && cdref.column) {
      this.columnContainer.init(cdref);

      this.setControlValue();

      this.subscribers.push(this.control.valueChanges.subscribe(async (value) => this.writeValue(value)));

      if (cdref.minlengthSubject) {
        this.subscribers.push(
          cdref.minlengthSubject.subscribe((elem) => {
            this.setControlValue();
          })
        );
      }

      // bind to entity change event
      this.subscribers.push(
        this.columnContainer.subscribe(() => {
          if (this.isWriting) {
            return;
          }

          if (this.control.value !== this.columnContainer.value) {
            this.logger.trace(
              this,
              `Control (${this.columnContainer.name}) set to new value:`,
              this.columnContainer.value,
              this.control.value
            );
            this.setControlValue();
          }
          this.valueHasChanged.emit({ value: this.control.value });
        })
      );

      this.subscribers.push(
        this.updateRequested.subscribe(() => {
          setTimeout(() => {
            try {
              this.setControlValue();
              this.control.updateValueAndValidity({ onlySelf: true, emitEvent: false });
            } finally {
            }
            this.valueHasChanged.emit({ value: this.control.value });
          });
        })
      );

      this.logger.trace(this, 'Control initialized');
    } else {
      this.logger.error(this, 'The Column Dependent Reference is undefined');
    }
  }

  private setControlValue(): void {
    this.control.setValue(this.columnContainer.value, { emitEvent: false });
    if (
      this.columnContainer.isValueRequired &&
      this.columnContainer.canEdit &&
      this.columnContainer.type !== ValType.Bool // because bool is always valid
    ) {
      this.logger.debug(this, `A value for column "${this.columnContainer.name}" is required`);
      this.control.setValidators(Validators.required);
    } else {
      this.control.setValidators(null);
    }
  }

  /**
   * updates the value for the CDR
   * @param value the new value
   */
  private async writeValue(value: any): Promise<void> {
    if (this.control.errors) {
      this.logger.debug(this, 'writeValue - validation failed');
      return;
    }

    this.logger.debug(this, 'writeValue called with value', value);

    if (!this.columnContainer.canEdit || this.columnContainer.value === value) {
      return;
    }

    this.isBusy = true;
    this.isWriting = true;
    try {
      this.logger.debug(this, 'writeValue - PutValue...');
      await this.columnContainer.updateValue(value);
    } catch (e) {
      this.lastError = e;
      this.logger.error(this, e);
      this.control.setErrors({ generalError: true });
    } finally {
      this.isBusy = false;
      this.isWriting = false;
      if (this.control.value !== this.columnContainer.value) {
        this.control.setValue(this.columnContainer.value, { emitEvent: false });
        this.logger.debug(this, 'form control value is set to', this.control.value);
      }
    }

    this.valueHasChanged.emit({ value, forceEmit: true });
  }
}
