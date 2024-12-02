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

import { Component, ErrorHandler, EventEmitter, OnDestroy } from '@angular/core';
import { UntypedFormControl, Validators } from '@angular/forms';
import moment from 'moment-timezone';
import { Subscription } from 'rxjs';

import { EuiSelectOption } from '@elemental-ui/core';
import { DateRangeType, DateRangeTypeLabels, ValType, ValueRange } from '@imx-modules/imx-qbm-dbts';
import { ImxTranslationProviderService } from '../../translation/imx-translation-provider.service';
import { CdrEditor, ValueHasChangedEventArg } from '../cdr-editor.interface';
import { ColumnDependentReference } from '../column-dependent-reference.interface';
import { EntityColumnContainer } from '../entity-column-container';

/**
 * Provides a {@link CdrEditor | CDR editor} for editing / viewing date range columns.
 *
 * The user can choose between these two options:
 * It displays either two {@link DateComponent | date components} or a dynamic time frame like 'two weeks ago'.
 * When set to read-only, it uses a {@link ViewPropertyComponent | view property component} to display the content.
 */
@Component({
  selector: 'imx-date-range',
  templateUrl: './date-range.component.html',
  styleUrls: ['./date-range.component.scss'],
})
export class DateRangeComponent implements CdrEditor, OnDestroy {
  /**
   * The form control associated with the editor.
   */
  public readonly control = new UntypedFormControl(undefined, { updateOn: 'blur' });

  /**
   * The form control associated with the 'from' part of the range.
   */
  public readonly dateFrom = new UntypedFormControl(undefined, { updateOn: 'blur' });

  /**
   * The form control associated with the 'until' part of the range.
   */
  public readonly dateUntil = new UntypedFormControl(undefined, { updateOn: 'blur' });

  /**
   * The form control associated with a dynamic date range.
   */
  public readonly dynamicDateControl = new UntypedFormControl(undefined, { updateOn: 'blur' });

  /**
   * The container that wraps the column functionality.
   */
  public readonly columnContainer = new EntityColumnContainer<string>();

  /**
   * Event that is emitted, after a value has been changed.
   */
  public readonly valueHasChanged = new EventEmitter<ValueHasChangedEventArg>();

  /**
   * Indicator that the component is loading data from the server.
   */
  public isLoading = false;

  /**
   * @ignore only used in templates
   * Indicator, if a dynamic time frame is used.
   */
  public dateRangeTypeDynamic = false;

  /**
   * @ignore only used in templates
   * The options available for a dynamic date range.
   */
  public dynamicDateRangeOptions: EuiSelectOption[] = [];

  private readonly subscribers: Subscription[] = [];

  private isWriting = false;

  private dateRangeTypeEnum = DateRangeType;

  private required = false;

  public constructor(
    private readonly errorHandler: ErrorHandler,
    private translateProviderService: ImxTranslationProviderService,
  ) {
    this.translateProviderService.GetCultures().then(() => this.updateOptions());
  }

  /**
   * Unsubscribes all events, after the 'OnDestroy' hook is triggered.
   */
  public ngOnDestroy(): void {
    this.subscribers.forEach((s) => s.unsubscribe());
  }

  /**
   * Binds a column dependent reference to the component.
   * Subscribes to subjects from the column dependent reference and its container.
   * @param cdref a column dependent reference.
   */
  public bind(cdref: ColumnDependentReference): void {
    if (cdref && cdref.column) {
      this.columnContainer.init(cdref);
      if (this.columnContainer.isValueRequired && this.columnContainer.canEdit) {
        this.required = true;
      }
      this.updateControlValues();

      if (cdref.minlengthSubject) {
        this.subscribers.push(
          cdref.minlengthSubject.subscribe(() => {
            if (this.columnContainer.isValueRequired && this.columnContainer.canEdit) {
              this.dateFrom.setValidators(Validators.required);
              this.dateUntil.setValidators(Validators.required);
            } else {
              this.dateFrom.setValidators(null);
              this.dateUntil.setValidators(null);
            }
          }),
        );
      }

      this.subscribers.push(
        this.dateFrom.valueChanges.subscribe(async (value) => {
          if (!!value) {
            this.writeValue({ from: value?.toDate(), until: this.dateUntil.value?.toDate() });
          }
        }),
      );

      this.subscribers.push(
        this.dateUntil.valueChanges.subscribe(async (value) => {
          if (!!value) {
            this.writeValue({ from: this.dateFrom.value?.toDate(), until: value?.toDate() });
          }
        }),
      );

      this.subscribers.push(
        this.columnContainer.subscribe(() => {
          if (this.isWriting) {
            return;
          }
          if (this.control.value !== this.columnContainer.value) {
            this.updateControlValues();
          }
          this.valueHasChanged.emit({ value: this.control.value });
        }),
      );

      this.subscribers.push(
        this.dynamicDateControl.valueChanges.subscribe((value: string) => {
          if (!!value) {
            this.writeValue(value);
          }
        }),
      );
    }
  }

  /**
   * Updates the value for the column dependent reference and writes it back to the columm.
   * @param value The date range, that should be written to the column.
   */
  private async writeValue(value: { from: Date; until: Date } | string): Promise<void> {
    if (
      (this.required && this.dateRangeTypeDynamic && this.dynamicDateControl.errors) ||
      (this.required && !this.dateRangeTypeDynamic && (this.dateFrom.errors || this.dateUntil.errors))
    ) {
      return;
    }
    let convertedValue: string;
    if (typeof value !== 'string') {
      convertedValue = new ValueRange<Date>(ValType.Date, value.from, value.until).toString();
    } else {
      convertedValue = value;
    }
    if (!this.columnContainer.canEdit || this.columnContainer.value === convertedValue) {
      return;
    }

    this.control.setValue(this.columnContainer.value, { emitEvent: false });
    this.control.markAsDirty();

    try {
      this.isLoading = true;
      this.isWriting = true;
      await this.columnContainer.updateValue(convertedValue);
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
    const value = this.columnContainer.value;
    this.control.setValue(value, { emitEvent: false });
    if (!!value && value in this.dateRangeTypeEnum) {
      this.dateRangeTypeDynamic = true;
      this.dynamicDateControl.setValue(value, { emitEvent: true });
      if (this.required) {
        this.dynamicDateControl.setValidators(Validators.required);
      }
      this.dateFrom.reset();
      this.dateUntil.reset();
      this.dateFrom.clearValidators();
      this.dateUntil.clearValidators();
      return;
    }
    const valueRange = ValueRange.Parse(value);
    if (valueRange.success) {
      const from = valueRange.result?.Start ? moment(valueRange.result.Start) : null;
      const until = valueRange.result?.End ? moment(valueRange.result.End) : null;
      this.dateFrom.setValue(from, { emitEvent: true });
      this.dateUntil.setValue(until, { emitEvent: true });
      if (this.required) {
        this.dateFrom.setValidators(Validators.required);
        this.dateUntil.setValidators(Validators.required);
      }
      this.dynamicDateControl.reset(null);
      this.dynamicDateControl.clearValidators();
    }
  }

  private updateOptions(): void {
    DateRangeTypeLabels.forEach((label, index) => {
      this.dynamicDateRangeOptions.push({
        display: this.translateProviderService.GetTranslation({ UidColumn: 'RESOURCES', Key: label }),
        value: this.dateRangeTypeEnum[index],
      });
    });
  }
}
