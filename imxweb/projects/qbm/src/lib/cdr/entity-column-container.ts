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

import { IForeignKeyInfo, IValueMetadata, ValType, ValueConstraint, ValueStruct } from '@imx-modules/imx-qbm-dbts';
import { Subscription } from 'rxjs';
import { ValueWrapper } from '../value-wrapper/value-wrapper';
import { ColumnDependentReference } from './column-dependent-reference.interface';
import { LimitedValuesContainer } from './limited-values-container';

/**
 * An implementation of the {@link ValueWrapper} interface.
 * It provides information, that at stored in the cdr and its column.
 */
export class EntityColumnContainer<T = any> implements ValueWrapper<T> {
  /**
   * Gives the info whether the column can be edited or not.
   */
  public get canEdit(): boolean {
    return this.cdr && this.cdr.column && !this.cdr.isReadOnly() && this.cdr.column.GetMetadata().CanEdit();
  }

  /**
   * The value of the column.
   */
  public get value(): T {
    return this.cdr && this.cdr.column ? this.cdr.column.GetValue() : undefined;
  }

  /**
   * The display value of the column.
   */
  public get displayValue(): string | undefined {
    return this.cdr && this.cdr.column ? this.cdr.column.GetDisplayValue() : undefined;
  }

  /**
   * A read-only list of {@link IForeignKeyInfo | FK informations}
   */
  public get fkRelations(): ReadonlyArray<IForeignKeyInfo> | undefined {
    return this.cdr && this.cdr.column ? this.cdr.column.GetMetadata().GetFkRelations() : undefined;
  }

  /**
   * The display, that is provided by the cdr.
   * If the CDR itself doesn't contain a display, the display given by the column is used.
   */
  public get display(): string {
    return this.cdr && (this.cdr.display || (this.cdr.column ? this.cdr.column.GetMetadata().GetDisplay() : ''));
  }

  /**
   * The information, whether a value is mandatory or not.
   */
  public get isValueRequired(): boolean {
    return this.cdr && ((this.cdr?.minLength ?? 0) > 0 || (this.cdr.column && this.cdr.column.GetMetadata().GetMinLength() > 0));
  }

  /**
   * The name of the column.
   */
  public get name(): string | undefined {
    return this.cdr && this.cdr.column ? this.cdr.column.ColumnName : undefined;
  }
  /**
   * The value type of the column, like bool, number, string, etc.
   */
  public get type(): ValType | undefined {
    return this.cdr && this.cdr.column ? this.cdr.column.GetType() : undefined;
  }

  /**
   * The information of a min value, a max value or limited values used by the given column.
   */
  public get valueConstraint(): ValueConstraint | undefined {
    return this.cdr && (this.cdr.valueConstraint || (this.cdr.column ? this.cdr.column.GetMetadata().valueConstraint : undefined));
  }

  /**
   * The meta data provided for the given column, like minLength, display, isMultiLine, etc.
   */
  public get metaData(): IValueMetadata | undefined {
    return this.cdr && this.cdr.column ? this.cdr.column.GetMetadata() : undefined;
  }

  /**
   * An additinal hint provided by the given CDR.
   */
  public get hint(): string | undefined {
    return this.cdr?.hint;
  }

  /**
   * The visibility of the display value.
   */
  public get showDisplayValue(): boolean {
    return !!this.metaData?.CanSee();
  }

  /**
   * An container, that wraps limited value functionality
   */
  public limitedValuesContainer: LimitedValuesContainer;

  private cdr: ColumnDependentReference;

  /**
   * Sets the CDR property and initalizes the LimitedValueContainer
   * @param cdr The CDR used by the container.
   */
  public init(cdr: ColumnDependentReference): void {
    this.cdr = cdr;
    this.limitedValuesContainer = new LimitedValuesContainer(cdr.column.GetMetadata());
  }

  /**
   * Subscribes a listener to the column.ColumnChanged event and returns a subscription
   * @param listener The listener to subscribe to column.ColumnChanged event.
   * @returns A subscription of the given listener
   */
  public subscribe(listener: () => void): Subscription {
    // subscribe to entity event
    const subscription = this.cdr.column.ColumnChanged?.subscribe(listener);
    // wrap in a rxjs subscription
    return new Subscription(() => subscription?.unsubscribe());
  }

  /**
   * Updates the value and puts it into the column
   * @param value The new value for the column
   */
  public async updateValue(value: T | undefined): Promise<void> {
    if (this.cdr && this.cdr.column) {
      return this.cdr.column.PutValue(value);
    }
  }

  /**
   * Updates column value and column display in one call
   * @param value The value struct, that should be used
   */
  public async updateValueStruct(value: ValueStruct<T | undefined>): Promise<void> {
    if (this.cdr && this.cdr.column) {
      return this.cdr.column.PutValueStruct(value);
    }
  }
}
