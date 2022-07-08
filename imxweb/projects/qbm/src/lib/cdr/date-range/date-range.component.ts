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
import * as moment from 'moment-timezone';

import { ValType, ValueRange } from 'imx-qbm-dbts';
import { CdrEditor, ValueHasChangedEventArg } from '../cdr-editor.interface';
import { ColumnDependentReference } from '../column-dependent-reference.interface';
import { EntityColumnContainer } from '../entity-column-container';
import { ParsedHostBindings } from '@angular/compiler';

@Component({
  selector: 'imx-date-range',
  templateUrl: './date-range.component.html',
  styleUrls: ['./date-range.component.scss']
})
export class DateRangeComponent implements CdrEditor, OnDestroy {
  public readonly control = new FormControl(undefined, { updateOn: 'blur' });

  public readonly dateFrom = new FormControl(undefined, { updateOn: 'blur' });

  public readonly dateUntil = new FormControl(undefined, { updateOn: 'blur' });

  public readonly columnContainer = new EntityColumnContainer<string>();

  public readonly valueHasChanged = new EventEmitter<ValueHasChangedEventArg>();

  public isLoading = false;

  private readonly subscribers: Subscription[] = [];

  private isWriting = false;

  public constructor(private readonly errorHandler: ErrorHandler) { }

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

      this.updateControlValues();

      if (this.columnContainer.isValueRequired && this.columnContainer.canEdit) {
        this.dateFrom.setValidators(Validators.required);
        this.dateUntil.setValidators(Validators.required);
      }

      this.subscribers.push(this.dateFrom.valueChanges.subscribe(async value =>
        this.writeValue({ from: value?.toDate(), until: this.dateUntil.value?.toDate() })
      ));

      this.subscribers.push(this.dateUntil.valueChanges.subscribe(async value =>
        this.writeValue({ from: this.dateFrom.value?.toDate(), until: value?.toDate() })
      ));

      this.subscribers.push(this.columnContainer.subscribe(() => {
        if (this.isWriting) { return; }
        if (this.control.value !== this.columnContainer.value) {
          this.updateControlValues();
        }
        this.valueHasChanged.emit({ value: this.control.value });
      }));
    }
  }

  /**
   * updates the value for the CDR
   * @param value the new value
   */
  private async writeValue(value: { from: Date; until: Date; }): Promise<void> {
    if (this.dateFrom.errors || this.dateUntil.errors) {
      return;
    }

    const valueRange = new ValueRange<Date>(ValType.Date, value.from, value.until).toString();

    if (!this.columnContainer.canEdit || this.columnContainer.value === valueRange) {
      return;
    }

    this.control.setValue(this.columnContainer.value, { emitEvent: false });
    this.control.markAsDirty();

    try {
      this.isLoading = true;
      this.isWriting = true;
      await this.columnContainer.updateValue(valueRange);
    } catch (error) {
      this.errorHandler.handleError(error);
    } finally {
      this.isLoading = false;
      this.isWriting = false;
      if (this.control.value !== this.columnContainer.value) {
        this.updateControlValues();
      }
    }

    this.valueHasChanged.emit({ value: this.columnContainer.value, forceEmit: true });
  }

  private updateControlValues(): void {
    this.control.setValue(this.columnContainer.value, { emitEvent: false });

    const valueRange = ValueRange.Parse(this.columnContainer.value);

    if (valueRange.success) {
      const from = valueRange.result.Start ? moment(valueRange.result.Start) : undefined;
      const until = valueRange.result.End ? moment(valueRange.result.End) : undefined;
      this.dateFrom.setValue(from, { emitEvent: true });
      this.dateUntil.setValue(until, { emitEvent: true });
    }
  }
}
