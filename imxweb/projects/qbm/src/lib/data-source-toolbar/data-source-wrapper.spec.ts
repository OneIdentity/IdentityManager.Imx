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

import { EntitySchema, IClientProperty, TypedEntity } from 'imx-qbm-dbts';
import { DataSourceWrapper } from './data-source-wrapper';

describe('DataSourceWrapper', () => {
  it('propertyDisplay', () => {
    const propertyDisplay = { ColumnName: '__Display' } as IClientProperty;

    const dstWrapper = new DataSourceWrapper(
      undefined,
      undefined,
      { Columns: { __Display: propertyDisplay } } as EntitySchema
    );
    
    expect(dstWrapper.propertyDisplay.ColumnName).toEqual(propertyDisplay.ColumnName);
  });

  it('getDstSettings', async () => {
    type SomeEntity = { someProperty: string; } & TypedEntity;

    const data = [{ someProperty: 'some value' }] as SomeEntity[];
    const collection = {
      totalCount: data.length,
      Data: data
    };

    const someColumn = { ColumnName: 'SomeColumnName' } as IClientProperty;
    const entitySchema = { Columns: { someColumn } } as EntitySchema;

    const displayedColumns = [
      entitySchema.Columns.someColumn
    ];

    const dstWrapper = new DataSourceWrapper(
      __ => Promise.resolve(collection),
      displayedColumns,
      entitySchema
    );

    const parameters = { StartIndex: 23 };
    
    const dstSettings = await dstWrapper.getDstSettings(parameters);

    expect((dstSettings.dataSource.Data[0] as SomeEntity).someProperty).toEqual(data[0].someProperty);
    expect(dstSettings.displayedColumns[0]).toEqual(displayedColumns[0]);
    expect(dstSettings.entitySchema.Columns.someColumn.ColumnName).toEqual(someColumn.ColumnName);
    expect(dstSettings.navigationState.StartIndex).toEqual(parameters.StartIndex);
  });
});