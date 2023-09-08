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

import { ColumnDependentReference } from './column-dependent-reference.interface';
import { ValueStruct, IForeignKeyInfo, ValType, ValueConstraint, IValueMetadata } from 'imx-qbm-dbts';
import { LimitedValuesContainer } from './limited-values-container';
import { ValueWrapper } from '../value-wrapper/value-wrapper';
import { Subscription } from 'rxjs';

export class EntityColumnContainer<T = any> implements ValueWrapper<T> {
    /**
     * Gives the info whether the column can be edited or not
     */
    public get canEdit(): boolean {
        return this.cdr && this.cdr.column && !this.cdr.isReadOnly() && this.cdr.column.GetMetadata().CanEdit();
    }

    /**
     * The value of the column
     */
    public get value(): T {
        return this.cdr && this.cdr.column ? this.cdr.column.GetValue() : undefined;
    }

    /**
     * The display value of the column
     */
    public get displayValue(): string {
        return this.cdr && this.cdr.column ? this.cdr.column.GetDisplayValue() : undefined;
    }

    public get fkRelations(): ReadonlyArray<IForeignKeyInfo>  {
        return this.cdr && this.cdr.column ? this.cdr.column.GetMetadata().GetFkRelations() : undefined;
    }

    public get display(): string {
        return this.cdr && (this.cdr.display || (this.cdr.column ? this.cdr.column.GetMetadata().GetDisplay() : undefined));
    }

    public get isValueRequired(): boolean {
        return this.cdr && (this.cdr.minLength > 0 || this.cdr.column && this.cdr.column.GetMetadata().GetMinLength() > 0);
    }

    public get name(): string {
        return this.cdr && this.cdr.column ? this.cdr.column.ColumnName : undefined;
    }

    public get type(): ValType {
        return this.cdr && this.cdr.column ? this.cdr.column.GetType() : undefined;
    }

    public get valueConstraint(): ValueConstraint {
      return this.cdr && (this.cdr.valueConstraint || (this.cdr.column ? this.cdr.column.GetMetadata().valueConstraint : undefined));
    }

    public get metaData(): IValueMetadata {
        return this.cdr && this.cdr.column ? this.cdr.column.GetMetadata() : undefined;
    }

    public get hint(): string {
      return this.cdr?.hint;
    }

    public limitedValuesContainer: LimitedValuesContainer;

    private cdr: ColumnDependentReference;

    public init(cdr: ColumnDependentReference): void {
        this.cdr = cdr;
        this.limitedValuesContainer = new LimitedValuesContainer(cdr.column.GetMetadata());
    }

    public subscribe(listener: () => void): Subscription {
        // subscribe to entity event
        const subscription = this.cdr.column.ColumnChanged?.subscribe(listener);
        // wrap in a rxjs subscription
        return new Subscription(() => subscription?.unsubscribe());
    }

    public async updateValue(value: T): Promise<void> {
        if (this.cdr && this.cdr.column) {
            return this.cdr.column.PutValue(value);
        }
    }

    public async updateValueStruct(value: ValueStruct<T>): Promise<void> {
        if (this.cdr && this.cdr.column) {
            return this.cdr.column.PutValueStruct(value);
        }
    }
}
