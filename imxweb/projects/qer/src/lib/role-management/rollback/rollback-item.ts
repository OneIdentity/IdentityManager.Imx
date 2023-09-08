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

import { HistoryComparisonData } from 'imx-api-qer';
import { TypedEntity, EntitySchema, DisplayColumns, ValType, IReadValue } from 'imx-qbm-dbts';

export type ComparisonItem = HistoryComparisonData & { TypeDisplay?: string };
export class RollbackItem extends TypedEntity {

  public readonly CurrentValueDisplay: IReadValue<string> = this.GetEntityValue('CurrentValueDisplay');
  public readonly HasChanged: IReadValue<boolean> = this.GetEntityValue('HasChanged');
  public readonly ChangeType: IReadValue<string> = this.GetEntityValue('ChangeType');
  public readonly HistoryValueDisplay: IReadValue<string> = this.GetEntityValue('HistoryValueDisplay');
  public readonly Property: IReadValue<string> = this.GetEntityValue('Property');
  public readonly TableName: IReadValue<string> = this.GetEntityValue('TableName');
  public readonly Id: IReadValue<string> = this.GetEntityValue('Id');
  public readonly TypeDisplay: IReadValue<string> = this.GetEntityValue('TypeDisplay');
  
  public static GetEntitySchema(): EntitySchema {
    const columns = {
      CurrentValueDisplay: {
        Type: ValType.String,
        ColumnName: 'CurrentValueDisplay',
      },
      HasChanged: {
        Type: ValType.Bool,
        ColumnName: 'HasChanged',
      },
      ChangeType: {
        Type: ValType.String,
        ColumnName: 'ChangeType',
      },
      HistoryValueDisplay: {
        Type: ValType.String,
        ColumnName: 'HistoryValueDisplay',
      },
      Property: {
        Type: ValType.String,
        ColumnName: 'Property',
      },
      TableName: {
        Type: ValType.String,
        ColumnName: 'TableName',
      },
      Id: {
        Type: ValType.String,
        ColumnName: 'Id',
      },
      TypeDisplay: {
        Type: ValType.String,
        ColumnName: 'TypeDisplay',
      },
    };

    columns[DisplayColumns.DISPLAY_PROPERTYNAME] = DisplayColumns.DISPLAY_PROPERTY;

    return { Columns: columns };
  }
}
