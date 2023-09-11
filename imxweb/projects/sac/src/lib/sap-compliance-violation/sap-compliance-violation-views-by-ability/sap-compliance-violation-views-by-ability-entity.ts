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

import { TypedEntity, EntitySchema, DisplayColumns, ValType, IReadValue } from 'imx-qbm-dbts';

export class SapComplianceByAbilityEntity extends TypedEntity {
  public readonly Ident_SAPProfile: IReadValue<string> = this.GetEntityValue('Ident_SAPProfile');
  public readonly Ident_SAPAuthObject: IReadValue<string> = this.GetEntityValue('Ident_SAPAuthObject');
  public readonly Ident_SAPField: IReadValue<string> = this.GetEntityValue('Ident_SAPField');
  public readonly LowerLimit: IReadValue<string> = this.GetEntityValue('LowerLimit');
  public readonly UpperLimit: IReadValue<string> = this.GetEntityValue('UpperLimit');
  public readonly UID_SAPFunctionInstance: IReadValue<string> = this.GetEntityValue('UID_SAPFunctionInstance');
  public readonly DisplaySapFunctionInstance: IReadValue<string> = this.GetEntityValue('DisplaySapFunctionInstance');
  public readonly DisplaySapTransaction: IReadValue<string> = this.GetEntityValue('DisplaySapTransaction');

  public static GetEntitySchema(): EntitySchema {
    const columns = {
      Ident_SAPProfile: {
        Type: ValType.String,
        ColumnName: 'Ident_SAPProfile',
      },
      Ident_SAPAuthObject: {
        Type: ValType.String,
        ColumnName: 'Ident_SAPAuthObject',
      },
      Ident_SAPField: {
        Type: ValType.String,
        ColumnName: 'Ident_SAPField',
      },
      LowerLimit: {
        Type: ValType.String,
        ColumnName: 'LowerLimit',
      },
      UpperLimit: {
        Type: ValType.String,
        ColumnName: 'UpperLimit',
      },
      UID_SAPFunctionInstance: {
        Type: ValType.String,
        ColumnName: 'UID_SAPFunctionInstance',
      },
      DisplaySapFunctionInstance: {
        Type: ValType.String,
        ColumnName: 'DisplaySapFunctionInstance',
      },
      DisplaySapTransaction: {
        Type: ValType.String,
        ColumnName: 'DisplaySapTransaction',
      },
    };

    columns[DisplayColumns.DISPLAY_PROPERTYNAME] = DisplayColumns.DISPLAY_PROPERTY;

    return { Columns: columns };
  }
}
