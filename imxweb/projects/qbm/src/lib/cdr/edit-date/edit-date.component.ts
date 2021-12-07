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
 * Copyright 2021 One Identity LLC.
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
import { FormControl, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { CdrEditor } from '../cdr-editor.interface';
import { ColumnDependentReference } from '../column-dependent-reference.interface';
import * as moment from 'moment-timezone';

import { EntityColumnContainer } from '../entity-column-container';
import { ClassloggerService } from '../../classlogger/classlogger.service';
/**
 * A component for viewing / editing date columns
 */
@Component({
  selector: 'imx-edit-date',
  templateUrl: './edit-date.component.html',
  styleUrls: ['./edit-date.component.scss']
})
export class EditDateComponent implements CdrEditor, OnDestroy {
  public readonly control = new FormControl(undefined, { updateOn: 'blur' });

  public readonly columnContainer = new EntityColumnContainer<Date>();

  public readonly valueHasChanged = new EventEmitter<Date>();

  public isBusy = false;

  private readonly subscribers: Subscription[] = [];

  public constructor(
    private readonly errorHandler: ErrorHandler,
    private logger: ClassloggerService,
  ) {}

  public ngOnDestroy(): void {
    this.subscribers.forEach(s => s.unsubscribe());
  }

  /**
   * Binds a column dependent reference to the component
   * @param cdref a column dependent reference
   */
  public bind(cdref: ColumnDependentReference): void {
    if (cdref && cdref.column) {
      this.columnContainer.init(cdref);

      this.setControlValue();

      if (this.columnContainer.isValueRequired && this.columnContainer.canEdit) {
        this.control.setValidators(Validators.required);
      }

      this.subscribers.push(this.control.valueChanges.subscribe(async value =>
        this.writeValue(this.control.value)
      ));

    }
  }

  private setControlValue(): void {
    this.control.setValue(this.columnContainer.value, { emitEvent: false });
    if (this.columnContainer.isValueRequired && this.columnContainer.canEdit) {
      this.control.setValidators(Validators.required);
    }
  }

  /**
   * updates the value for the CDR
   * @param value the new value
   */
  private async writeValue(value: moment): Promise<void> {
    if (this.control.errors) {
      return;
    }

    const date = value.toDate();
    this.logger.debug(this, 'writeValue called with value', date);
    if (!this.columnContainer.canEdit || this.columnContainer.value === date) {
      return;
    }

    this.control.setValue(date, { emitEvent: false });

    this.isBusy = true;
    try {
      await this.columnContainer.updateValue(date);
    } catch (error) {
      this.errorHandler.handleError(error);
    } finally {
      this.isBusy = false;
      if (this.control.value !== this.columnContainer.value) {
        this.control.setValue(this.columnContainer.value, { emitEvent: false });
      }
    }

    this.valueHasChanged.emit(this.columnContainer.value);
  }

}


