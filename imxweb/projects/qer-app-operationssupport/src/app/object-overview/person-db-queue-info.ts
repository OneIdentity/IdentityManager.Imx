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

import { DisplayColumns, EntitySchema, IReadValue, TypedEntity, ValType } from 'imx-qbm-dbts';

export class PersonDbQueueInfo extends TypedEntity {
  public readonly Object: IReadValue<string> = this.GetEntityValue('Object');
  public readonly SubObject: IReadValue<string> = this.GetEntityValue('SubObject');
  public readonly SortOrder: IReadValue<string> = this.GetEntityValue('SortOrder');
  public static GetEntitySchema(): EntitySchema {
    const columns = {
      Object: {
        ColumnName: 'Object',
        Type: ValType.String,
        IsReadOnly: true,
      },
      SubObject: {
        ColumnName: 'SubObject',
        Type: ValType.String,
        IsReadOnly: true,
      },
     SortOrder: {
        ColumnName: 'SortOrder',
        Type: ValType.String,
        IsReadOnly: true,
      }
    };
    columns[DisplayColumns.DISPLAY_PROPERTYNAME] = DisplayColumns.DISPLAY_PROPERTY;
    columns[DisplayColumns.DISPLAY_LONG_PROPERTYNAME] = DisplayColumns.DISPLAY_PROPERTY_LONG;

    return { TypeName: 'DbQueue', Columns: columns };
  }
}
