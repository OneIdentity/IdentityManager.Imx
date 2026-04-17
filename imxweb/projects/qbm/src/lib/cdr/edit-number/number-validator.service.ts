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

import { Injectable } from '@angular/core';

import { ValueConstraint } from 'imx-qbm-dbts';
import { NumberError } from './number-error.interface';

export type NumericInput = number | null | undefined;

/**
 * A service for providing a number validation.
 */
@Injectable({
  providedIn: 'root',
})
export class NumberValidatorService {
  /**
   * Validates the value by checking two things:
   * <ol>
   * <ul>The value is a valid number.</ul>
   * <ul>The value is inside the range, given by a {@link ValueConstraint}.</ul>
   * </ol>
   * @param value The value that needs to be checked.
   * @param range The {@link ValueConstraint}, that determines the bounds.
   * @returns
   */
  public validate(value: NumericInput, range: ValueConstraint | undefined): NumberError | null {
    if (value == null) {
      return null;
    }

    if (!Number.isFinite(value) || !Number.isInteger(value)) {
      return { invalidInteger: true };
    }

    if (range) {
      if (range.MinValue != null && value < range.MinValue) {
        return { rangeMin: true };
      }

      if (range.MaxValue != null && value > range.MaxValue) {
        return { rangeMax: true };
      }
    }

    return null;
  }
}
