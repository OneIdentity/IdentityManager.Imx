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

import { Injectable } from '@angular/core';
import { ValueConstraint } from '@imx-modules/imx-qbm-dbts';
import { NumberValidatorService } from '../edit-number/number-validator.service';
import { NumberRangeError } from './number-range-error.interface';

/**
 * A service for providing number range validation.
 * Extends the NumberValidatorService with range-specific validation logic.
 */
@Injectable({
  providedIn: 'root',
})
export class NumberRangeValidatorService {
  public constructor(private readonly numberValidator: NumberValidatorService) {}

  /**
   * Validates a single value within a range context.
   * @param value The value to validate.
   * @param constraint The value constraint to validate against.
   * @returns A NumberRangeError if validation fails, otherwise null.
   */
  public validateValue(value: any, constraint: ValueConstraint | undefined): NumberRangeError | null {
    // Reuse the number validator for basic validation
    return this.numberValidator.validate(value, constraint);
  }

  /**
   * Validates that the 'from' value is less than the 'to' value (and not equal).
   * @param from The start value of the range.
   * @param to The end value of the range.
   * @returns A NumberRangeError if validation fails, otherwise null.
   */
  public validateRangeOrder(from: any, to: any): NumberRangeError | null {
    if (from == null || to == null) {
      return null;
    }

    if (from >= to) {
      return { rangeOrder: true };
    }
    return null;
  }

  /**
   * Validates both values and their order in a range.
   * @param from The start value of the range.
   * @param to The end value of the range.
   * @param constraint The value constraint to validate against.
   * @returns A NumberRangeError if validation fails, otherwise null.
   */
  public validateRange(from: any, to: any, constraint: ValueConstraint | undefined): NumberRangeError | null {
    // First validate individual values
    const fromError = this.validateValue(from, constraint);
    if (fromError) {
      return fromError;
    }

    const toError = this.validateValue(to, constraint);
    if (toError) {
      return toError;
    }

    // Then validate range order
    return this.validateRangeOrder(from, to);
  }
}
