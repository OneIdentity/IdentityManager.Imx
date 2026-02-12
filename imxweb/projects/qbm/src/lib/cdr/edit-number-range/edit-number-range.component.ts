import { Component, ErrorHandler, EventEmitter, OnDestroy } from '@angular/core';
import { AbstractControl, UntypedFormControl, ValidatorFn, Validators } from '@angular/forms';
import { ValType, ValueRange } from '@imx-modules/imx-qbm-dbts';
import { Subscription } from 'rxjs/internal/Subscription';
import { CdrEditor, ValueHasChangedEventArg } from '../cdr-editor.interface';
import { ColumnDependentReference } from '../column-dependent-reference.interface';
import { EntityColumnContainer } from '../entity-column-container';
import { NumberRangeError } from './number-range-error.interface';
import { NumberRangeValidatorService } from './number-range-validator.service';

@Component({
  selector: 'imx-edit-number-range',
  templateUrl: './edit-number-range.component.html',
  styleUrl: './edit-number-range.component.scss',
})
export class EditNumberRangeComponent implements CdrEditor, OnDestroy {
  /**
   * The form control associated with the editor.
   */
  public readonly control = new UntypedFormControl(undefined, { updateOn: 'blur' });

  /**
   * The form control associated with the 'from' part of the range.
   */
  public readonly valueFrom = new UntypedFormControl(undefined, { updateOn: 'blur' });

  /**
   * The form control associated with the 'until' part of the range.
   */
  public readonly valueTo = new UntypedFormControl(undefined, { updateOn: 'blur' });

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

  private readonly subscribers: Subscription[] = [];

  private isWriting = false;
  private required = false;

  public constructor(
    private readonly errorHandler: ErrorHandler,
    private readonly rangeValidator: NumberRangeValidatorService,
  ) {}

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
              this.valueFrom.setValidators(Validators.required);
              this.valueTo.setValidators(Validators.required);
            }
          }),
        );
      }

      this.setupValidators();

      this.subscribers.push(
        this.valueFrom.valueChanges.subscribe(async (value) => {
          // Sync rangeOrder error to main control
          this.syncRangeOrderError();

          if (!!value) {
            this.writeValue({ from: value, to: this.valueTo.value });
          }
        }),
      );

      this.subscribers.push(
        this.valueTo.valueChanges.subscribe(async (value) => {
          // Sync rangeOrder error to main control
          this.syncRangeOrderError();

          if (!!value) {
            this.writeValue({ from: this.valueFrom.value, to: value });
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
    }
  }

  /**
   * Updates the value for the column dependent reference and writes it back to the columm.
   * @param value The range, that should be written to the column.
   */
  private async writeValue(value: { from: number; to: number } | string): Promise<void> {
    if (this.required && (this.valueFrom.errors || this.valueTo.errors)) {
      return;
    }
    let convertedValue: string;
    if (typeof value !== 'string') {
      convertedValue = new ValueRange<number>(this.columnContainer.type ?? ValType.Long, value.from, value.to).toString();
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
      // Set control as invalid while loading
      this.control.setErrors({ isLoading: true });
      await this.columnContainer.updateValue(convertedValue);
    } catch (error) {
      this.errorHandler.handleError(error);
    } finally {
      this.isLoading = false;
      this.isWriting = false;
      // Clear isLoading error
      if (this.control.errors?.['isLoading']) {
        const errors = { ...this.control.errors };
        delete errors['isLoading'];
        this.control.setErrors(Object.keys(errors).length > 0 ? errors : null);
      }
      if (this.control.value !== this.columnContainer.value) {
        this.updateControlValues();
      }
    }

    this.valueHasChanged.emit({ value: this.columnContainer.value, forceEmit: true });
  }

  private updateControlValues(): void {
    const value = this.columnContainer.value;
    this.control.setValue(value, { emitEvent: false });
    const valueRange = ValueRange.Parse(value);
    if (!!value && !valueRange.success) {
      this.valueFrom.reset();
      this.valueTo.reset();
      this.valueFrom.clearValidators();
      this.valueTo.clearValidators();
      return;
    }

    if (valueRange.success) {
      const from = valueRange.result?.Start;
      const to = valueRange.result?.End;
      this.valueFrom.setValue(from, { emitEvent: true });
      this.valueTo.setValue(to, { emitEvent: true });
      if (this.required) {
        this.valueFrom.setValidators(Validators.required);
        this.valueTo.setValidators(Validators.required);
      }
    }
  }

  private checkIntegerValue(): ValidatorFn {
    return (control: AbstractControl): NumberRangeError | null => {
      if (control == null) {
        return null;
      }

      return this.rangeValidator.validateValue(control.value, this.columnContainer.valueConstraint);
    };
  }

  private setupValidators(): void {
    const validators: ValidatorFn[] = [];

    if (this.required) {
      validators.push(Validators.required);
    }

    validators.push(this.checkIntegerValue()); // validate integer + Min/Max constraints
    validators.push(this.checkRangeOrder()); // validate from ≤ to

    this.valueFrom.setValidators(validators);
    this.valueTo.setValidators(validators);
  }

  /**
   * Validates that valueFrom <= valueTo
   */
  private checkRangeOrder(): ValidatorFn {
    return (): NumberRangeError | null => {
      return this.rangeValidator.validateRangeOrder(this.valueFrom?.value, this.valueTo?.value);
    };
  }

  /**
   * Syncs the rangeOrder error from valueFrom/valueTo to the main control
   */
  private syncRangeOrderError(): void {
    // Validate the range order immediately
    const rangeOrderError = this.rangeValidator.validateRangeOrder(this.valueFrom?.value, this.valueTo?.value);

    if (rangeOrderError) {
      this.control.setErrors({ rangeOrder: true });
      this.control.markAsTouched();
    } else {
      // Clear rangeOrder error if it doesn't exist anymore
      if (this.control.errors?.['rangeOrder']) {
        const errors = { ...this.control.errors };
        delete errors['rangeOrder'];
        this.control.setErrors(Object.keys(errors).length > 0 ? errors : null);
      }
    }
  }
}
