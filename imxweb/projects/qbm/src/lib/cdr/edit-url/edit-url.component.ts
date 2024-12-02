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

import { UrlValidatorService } from './url-validator.service';
import { CdrEditor, ValueHasChangedEventArg } from '../cdr-editor.interface';
import { ColumnDependentReference } from '../column-dependent-reference.interface';
import { EntityColumnContainer } from '../entity-column-container';

/**
 * Provides a {@link CdrEditor | CDR editor} for editing / viewing url columns.
 * 
 * To change its value, it uses the input type 'url'.
 * When set to read-only, it uses a {@link ViewPropertyComponent | view property component} to display the content.
 */
@Component({
  selector: 'imx-edit-url',
  templateUrl: './edit-url.component.html',
  styleUrls: ['./edit-url.component.scss'],
})
export class EditUrlComponent implements CdrEditor, OnDestroy {
  /**
   * The form control associated with the editor.
   */
  public readonly control = new UntypedFormControl('', { updateOn: 'blur' });

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

  /**   *
   * Creates a new EditUrlComponent
   * @param urlValidator The {@link UrlValidatorService} used for validation.
   */
  constructor(private readonly urlValidator: UrlValidatorService) {}

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
      this.control.setValue(this.columnContainer.value, { emitEvent: false });

      const validators = this.urlValidator.validators.slice();

      if (this.columnContainer.isValueRequired && this.columnContainer.canEdit) {
        validators.push(Validators.required);
      }

      if (cdref.minlengthSubject) {
        this.subscribers.push(
          cdref.minlengthSubject.subscribe((elem) => {
            const validators = this.urlValidator.validators.slice();

            if (this.columnContainer.isValueRequired && this.columnContainer.canEdit) {
              validators.push(Validators.required);
            }
            this.control.setValidators(validators);
          }),
        );
      }

      this.subscribers.push(
        this.columnContainer.subscribe(() => {
          if (this.isWriting) {
            return;
          }
          if (this.control.value !== this.columnContainer.value) {
            this.control.setValue(this.columnContainer.value, { emitEvent: false });
          }
          this.valueHasChanged.emit({ value: this.control.value });
        }),
      );

      this.control.setValidators(validators);

      this.subscribers.push(this.control.valueChanges.subscribe(async (value) => this.writeValue(value)));
    }
  }

  private async writeValue(value: any): Promise<void> {
    if (this.control.errors) {
      return;
    }

    if (!this.columnContainer.canEdit || this.columnContainer.value === value) {
      return;
    }
    try {
      this.isWriting = true;
      await this.columnContainer.updateValue(value);
    } finally {
      this.isWriting = false;
      if (this.control.value !== this.columnContainer.value) {
        this.control.setValue(this.columnContainer.value, { emitEvent: false });
      }
      this.valueHasChanged.emit({ value: this.control.value, forceEmit: true });
    }
  }
}
