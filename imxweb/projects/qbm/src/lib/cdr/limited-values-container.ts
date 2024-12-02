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

import { IValueMetadata, LimitedValueData, ValType } from '@imx-modules/imx-qbm-dbts';

/**
 * A wrapper, that encapsules limited value property functions.
 */
export class LimitedValuesContainer {
  /**
   * A read-only list of a possible limited values.
   */
  public get values(): ReadonlyArray<LimitedValueData> | undefined {
    return this.metadata ? this.metadata.GetLimitedValues() : undefined;
  }

  constructor(private metadata: IValueMetadata) {}

  /**
   * Determines, whether the limited value collection allows a null option.
   */
  /**
   * Determines, whether the limited value collection allows a null option
   */
  public hasNullOption(): boolean {
    return this.metadata.GetMinLength() === 0 && !this.contains(this.getNullValue());
  }

  /**
   * Determines, whether the value is part of the limited value range or not
   */
  public isNotInLimitedValueRange(value: string | number): boolean {
    return !((value || '') === (this.getNullValue() || '')) && !this.contains(value);
  }

  /**
   * Gets the value representing 'null'.
   * @returns the value that is used as 'null'.
   */
  private getNullValue(): string | null {
    return this.metadata.GetType() === ValType.String ? null : '0';
  }

  /**
   * Checks, if a value is part of the limited value list
   * @param value The value to be checked.
   * @returns
   */
  private contains(value: string | number | null): boolean {
    return (this.values && this.values.filter((v) => `${v.Value}` === `${value}`).length > 0) ?? false;
  }
}
