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
import { AbstractControl, ValidatorFn, Validators } from '@angular/forms';
import { Subject, Subscription } from 'rxjs';

import { CdrEditor, ValueHasChangedEventArg } from './cdr-editor.interface';
import { ColumnDependentReference } from './column-dependent-reference.interface';
import { ClassloggerService } from '../classlogger/classlogger.service';
import { EntityColumnContainer } from './entity-column-container';
import { ServerError } from '../base/server-error';
import { ValType } from 'imx-qbm-dbts';

/**
 * A base class for CDR editors, that handles simple dataTypes like string, boolean or integer.
 * To extend the component, the AbstractControl 'control' has to be implemented, as well as a template.
 * The component itself has no template attached.
 * For more complex editors, like our {@link EditFkComponent | FK editor} it might be more sufficient, to implement CdrEditor itself
 */
@Component({ template: '' })
export abstract class EditorBase<T = any> implements CdrEditor, OnDestroy {
  /**
   * The form element, that is used in the template for the component
   */
  public abstract readonly control: AbstractControl;

  /**
   * The {@link EntityColumnContainer | entity column container} that handles column <-> editor communication.
   */
  public readonly columnContainer = new EntityColumnContainer<T>();

  /**
   * Event, that is emitted, if the value of the component is changed.
   */
  public readonly valueHasChanged = new EventEmitter<ValueHasChangedEventArg>();

  /**
   * A subject, that is used to signal changes in the column.
   * Mainly used to signal that the editor needs to be updated.
   */
  public readonly updateRequested = new Subject<void>();

  /**
   * @ignore
   * used for the template to signal, that the component is loading content from the server.
   */
  public isBusy = false;

  /**
   * @ignore
   * Used for the template and displays the last server error, that occured while loading content.
   */
  public lastError: ServerError | undefined;

  /**
   * The maximal length a string could have.
   * The value depends on the meta data of the column.
   */
  public get maxlength(): number | undefined {
    return this.columnContainer?.metaData?.GetMaxLength();
  }

  private readonly subscribers: Subscription[] = [];
  private isWriting = false;

  public constructor(protected readonly logger: ClassloggerService, protected readonly errorHandler?: ErrorHandler) {}

  /**
   * Unsubscribes all events, as soon as the component is destroyed.
   */
  public ngOnDestroy(): void {
    this.subscribers.forEach((s) => s.unsubscribe());
  }

  /**
   * If an error occured, it returns its message
   */
  public get validationErrorMessage(): string {
    return this.lastError?.toString() || '';
  }

  /**
   * Binds a column dependent reference to the component, by setting the control value and subscribing to the events,
   * the CDR or the ColumnContainer emits
   * @param cdref a column dependent reference
   */
  public bind(cdref: ColumnDependentReference): void {
    if (cdref && cdref.column) {
      this.columnContainer.init(cdref);

      this.control.addValidators(EditorBase.hasServerError(this));

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

          if (!this.control.hasError('generalError') && this.control.value !== this.columnContainer.value) {
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
              if (!this.control.hasError('generalError') && this.control.value !== this.columnContainer.value) {
                 this.logger.trace(
                   this,
                   `Control (${this.columnContainer.name}) set to new value:`,
                   this.columnContainer.value,
                   this.control.value
                 );
                this.setControlValue();
                this.control.updateValueAndValidity({ onlySelf: true, emitEvent: false });
              }
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

  /**
   * Updates the value of the form control as well as its validators.
   */
  private setControlValue(): void {
    this.control.setValue(this.columnContainer.value, { emitEvent: false });
    if (
      this.columnContainer.isValueRequired &&
      this.columnContainer.canEdit &&
      this.columnContainer.type !== ValType.Bool // because bool is always valid
    ) {
      this.logger.debug(this, `A value for column "${this.columnContainer.name}" is required`);
      this.control.setValidators([Validators.required, EditorBase.hasServerError(this)]);
    } else {
      this.control.setValidators(EditorBase.hasServerError(this));
    }
  }

  /**
   * Updates the value for the CDR and writes them back to the column.
   * @param value the new value
   */
  private async writeValue(value: any): Promise<void> {
    if (this.control.errors && Object.keys(this.control.errors).some((elem) => elem !== 'generalError')) {
      this.logger.debug(this, 'writeValue - client validation failed');
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
      this.lastError = undefined;
    } catch (e) {
      this.lastError = e;
      this.logger.error(this, e);
    } finally {
      this.isBusy = false;
      this.isWriting = false;
      if (!this.lastError && this.control.value !== this.columnContainer.value) {
        this.control.setValue(this.columnContainer.value, { emitEvent: false });
        this.logger.debug(this, 'form control value is set to', this.control.value);
      }
      this.control.updateValueAndValidity({ emitEvent: false });
    }

    this.valueHasChanged.emit({ value, forceEmit: true });
  }

  private static hasServerError(base: any): ValidatorFn {
    return (_: AbstractControl): { [key: string]: boolean } | null => {
      return !base.lastError ? null : { generalError: true };
    };
  }
}
