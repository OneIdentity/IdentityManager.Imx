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
 * Copyright 2022 One Identity LLC.
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

export class CompareItem extends TypedEntity {
  public readonly ObjectTypeDisplay: IReadValue<string> = this.GetEntityValue('ObjectTypeDisplay');
  public readonly Display: IReadValue<string> = this.GetEntityValue('Display');
  public readonly XOriginRole1: IReadValue<string> = this.GetEntityValue('XOriginRole1');
  public readonly XOriginRole2: IReadValue<string> = this.GetEntityValue('XOriginRole2');

  public static GetEntitySchema(): EntitySchema {
    const columns = {
      ObjectTypeDisplay: {
        Type: ValType.String,
        ColumnName: 'ObjectTypeDisplay',
      },
      Display: {
        Type: ValType.String,
        ColumnName: 'Display',
      },
      XOriginRole1: {
        Type: ValType.String,
        ColumnName: 'XOriginRole1',
      },
      XOriginRole2: {
        Type: ValType.String,
        ColumnName: 'XOriginRole2',
      },
    };

    columns[DisplayColumns.DISPLAY_PROPERTYNAME] = DisplayColumns.DISPLAY_PROPERTY;

    return { Columns: columns };
  }
}
