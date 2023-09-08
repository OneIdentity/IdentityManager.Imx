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

import { ChartData } from 'imx-api-qer';
import { DisplayPattern, EntityColumnData, EntityData, EntitySchema, ExtendedTypedEntityCollection, IClientProperty, IEntity, IReadValue, TypedEntity, TypedEntityBuilder, ValType } from 'imx-qbm-dbts';

export class ChartDataTyped extends TypedEntity {
  public readonly Name: IReadValue<string> = this.GetEntityValue('Name');
  public readonly ObjectDisplay: IReadValue<string> = this.GetEntityValue('ObjectDisplay');
  public readonly Value: IReadValue<number> = this.GetEntityValue('Value');
  public readonly Percentage: IReadValue<number> = this.GetEntityValue('Percentage');
  public readonly Date: IReadValue<Date> = this.GetEntityValue('Date');



  public GetDisplay(): string {
    return this.Name.value;
  }

  public static GetEntitySchema(): EntitySchema {
    const ret: { [key: string]: IClientProperty } = {};

    ret.Name = {
      Type: ValType.String,
      ColumnName: 'Name',
      Display: '#LDS#Name'
    };
    ret.ObjectDisplay = {
      Type: ValType.String,
      ColumnName: 'ObjectDisplay',
      Display: '#LDS#Display name'
    };
    ret.Value = {
      Type: ValType.Double,
      ColumnName: 'Value',
      Display: '#LDS#Value'
    };
    ret.Percentage = {
      Type: ValType.Double,
      ColumnName: 'Percentage',
      Display: '#LDS#Percentage'

    };
    ret.Date = {
      Type: ValType.Date,
      ColumnName: 'Date',
      Display: '#LDS#Data retrieved on'
    };

    return {
      TypeName: 'ChartDataTyped',
      DisplayPattern: new DisplayPattern('%Name%'),
      Columns: ret,
    };
  }

  public static buildEntities(entityData: EntityData[]): ExtendedTypedEntityCollection<ChartDataTyped, unknown> {
    const builder = new TypedEntityBuilder(ChartDataTyped);
    return builder.buildReadWriteEntities(
      {
        TotalCount: entityData.length,
        Entities: entityData
      },
      ChartDataTyped.GetEntitySchema()
    );
  }

  public static buildEntityData(chartData: ChartData): EntityData[] {
    return chartData.Points.map(point => {
      const ret: { [key: string]: EntityColumnData } = {};
      ret.Name = {Value: chartData.Name, IsReadOnly: true};
      ret.ObjectDisplay = {Value: chartData?.ObjectDisplay, IsReadOnly: true};
      ret.Value = {Value: point.Value, IsReadOnly: true};
      ret.Percentage = {Value: point?.Percentage, IsReadOnly: true};
      ret.Date = {Value: point.Date, IsReadOnly: true};
      return {Columns: ret}
    });
  }
}
