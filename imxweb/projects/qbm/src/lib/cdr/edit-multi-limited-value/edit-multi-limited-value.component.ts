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

import { ChangeDetectorRef, Component, EventEmitter, OnDestroy } from '@angular/core';
import { UntypedFormArray, UntypedFormControl } from '@angular/forms';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, tap } from 'rxjs/operators';

import { LimitedValueData } from 'imx-qbm-dbts';
import { ColumnDependentReference } from '../column-dependent-reference.interface';
import { ClassloggerService } from '../../classlogger/classlogger.service';
import { CdrEditor, ValueHasChangedEventArg } from '../cdr-editor.interface';
import { EntityColumnContainer } from '../entity-column-container';
import { MultiValueService } from '../../multi-value/multi-value.service';

/**
 * A component for viewing / editing multi limited value columns
 */
@Component({
  selector: 'imx-edit-multi-limited-value',
  templateUrl: './edit-multi-limited-value.component.html',
  styleUrls: ['./edit-multi-limited-value.component.scss'],
})
export class EditMultiLimitedValueComponent implements CdrEditor, OnDestroy {
  public readonly updateRequested = new Subject<void>();

  // TODO: Check Upgrade
  public control = new UntypedFormArray([]);

  public readonly columnContainer = new EntityColumnContainer<string>();
  public readonly valueHasChanged = new EventEmitter<ValueHasChangedEventArg>();
  public readonly pendingChanged = new EventEmitter<boolean>();

  private readonly subscriptions: Subscription[] = [];
  private isWriting = false;

  constructor(
    private readonly logger: ClassloggerService,
    private readonly changeDetectorRef: ChangeDetectorRef,
    private readonly multiValueProvider: MultiValueService
  ) {}

  public ngOnDestroy(): void {
    this.subscriptions.forEach((s) => s.unsubscribe());
  }

  /**
   * Binds a column dependent reference to the component
   * @param cdref a column dependent reference
   */
  public bind(cdref: ColumnDependentReference): void {
    if (cdref && cdref.column) {
      this.columnContainer.init(cdref);
      this.initValues();
      this.subscriptions.push(
        this.control.valueChanges
        .pipe(
          tap(() => this.pendingChanged.emit(true)),
          debounceTime(1400),
          distinctUntilChanged(),
        )
        .subscribe(
          async (values) => await this.writeValue(values)
        )
      );
      this.subscriptions.push(
        this.columnContainer.subscribe(() => {
          if (this.isWriting) {
            return;
          }
          if (this.getSelectedNamesMultiValue(this.control.value) !== this.columnContainer.value) {
            this.initValues();
          }

          if (cdref.minlengthSubject) {
            this.subscriptions.push(
              cdref.minlengthSubject.subscribe(() => {
                this.initValues();
              })
            );
          }

          this.subscriptions.push(
            this.updateRequested.subscribe(() =>
              setTimeout(() => {
                this.initValues();
                this.control.updateValueAndValidity({ onlySelf: true, emitEvent: false });
              })
            )
          );
          this.valueHasChanged.emit({ value: this.columnContainer.value });
        })
      );
      this.logger.trace(this, 'Control initialized');
    } else {
      this.logger.error(this, 'The Column Dependent Reference is undefined');
    }
  }

  public initValues(): void {
    if (this.control.controls?.length > 0) {
      return;
    }
    const selectedValues = this.multiValueProvider.getValues(this.columnContainer.value);
    this.columnContainer.limitedValuesContainer.values.forEach((limitedValueData) =>
      this.control.push(new UntypedFormControl(this.isSelected(limitedValueData, selectedValues)))
    );
    if (this.columnContainer.isValueRequired && this.columnContainer.canEdit) {
      this.control.setValidators((control: UntypedFormArray) =>
        control.controls.find((checkBox) => checkBox.value) ? null : { required: true }
      );
    }
  }

  /**
   * updates the value for the CDR
   * @param values the new values
   */
  private async writeValue(values: boolean[]): Promise<void> {
    this.logger.debug(this, 'writeValue called with value', values);

    if (!this.columnContainer.canEdit) {
      return;
    }

    const value = this.multiValueProvider.getMultiValue(this.getSelectedNames(values));

    if (this.columnContainer.value === value || (!this.columnContainer.value && value === '')) {
      this.pendingChanged.emit(false);
      return;
    }

    this.valueHasChanged.emit({ value, forceEmit: true });

    try {
      this.logger.debug(this, 'writeValue - updateCdrValue...');
      this.isWriting = true;
      this.control.disable({ emitEvent: false });
      this.changeDetectorRef.detectChanges();
      await this.columnContainer.updateValue(value);
    } catch (e) {
      this.logger.error(this, e);
    } finally {
      this.isWriting = false;
      this.control.enable({ emitEvent: false });
      this.pendingChanged.emit(false);
      this.changeDetectorRef.detectChanges();
      if (this.getSelectedNamesMultiValue(this.control.value) !== this.columnContainer.value) {
        const selectedValues = this.multiValueProvider.getValues(this.columnContainer.value);
        this.control.controls.forEach((checkBox, index) =>
          checkBox.setValue(this.isSelected(this.columnContainer.limitedValuesContainer.values[index], selectedValues), {
            emitEvent: false,
          })
        );
      }
    }
  }

  
  /**
   * Gets the MultiValue of the selected values.
   * @param values The array of booleans provided by the checkboxes
   */
  private getSelectedNamesMultiValue(values: boolean[]): string {
    return this.multiValueProvider.getMultiValue(this.getSelectedNames(values));
  }

  /**
   * Gets the names of the selected values.
   * @param values The array of booleans provided by the checkboxes
   */
  private getSelectedNames(values: boolean[]): string[] {
    const selectedValues: string[] = [];
    values.forEach((value, index) => {
      if (value) {
        selectedValues.push(this.columnContainer.limitedValuesContainer.values[index]?.Value);
      }
    });
    return selectedValues;
  }

  private isSelected(limitedValueData: LimitedValueData, selectedValues: string[]): boolean {
    return selectedValues && selectedValues.indexOf(limitedValueData.Value + '') > -1;
  }
}
