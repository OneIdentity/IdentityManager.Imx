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

import { IEntityColumn, DataState, ValType, IValueMetadata, ValueStruct, IEntity, IColumnChangeArgs, IEvent } from 'imx-qbm-dbts';

export class EntityColumnStub<T> implements IEntityColumn {
  GetEntity(): IEntity {
    return null;
  }
  ColumnName = 'someColumnName';
  ExtendedProperties: { [id: string]: any; };

  constructor(
    private value?: T,
    private displayValue?: string,
    private metadata = { CanEdit: () => true } as IValueMetadata
  ) {}
  
  ColumnChanged: IEvent<IColumnChangeArgs>;

  GetDataState(): DataState {
    throw new Error('Method not implemented.');
  }

  GetType(): ValType {
    throw new Error('Method not implemented.');
  }

  GetMetadata(): IValueMetadata {
    return this.metadata;
  }

  GetValue(): T {
    return this.value;
  }

  GetDisplayValue(): string {
    return this.displayValue;
  }

  async PutValue(value: T): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    this.value = value;
  }

  async PutValueStruct(value: ValueStruct<any>): Promise<void> {
    await this.PutValue(value.DataValue);
    this.displayValue = value.DisplayValue;
  }
}
