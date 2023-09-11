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

export class PersonJobQueueInfo extends TypedEntity {
  public readonly Queue: IReadValue<string> = this.GetEntityValue('Queue');
  public readonly UID_Job: IReadValue<string> = this.GetEntityValue('UID_Job');
  public readonly TaskName: IReadValue<string> = this.GetEntityValue('TaskName');
  public readonly Ready2EXE: IReadValue<string> = this.GetEntityValue('Ready2EXE');
  public readonly ErrorMessages: IReadValue<string> = this.GetEntityValue('ErrorMessages');
  public static GetEntitySchema(): EntitySchema {
    const columns = {
      UID_Job: {
        ColumnName: 'UID_Job',
        Type: ValType.String,
        IsReadOnly: true,
      },
      Queue: {
        ColumnName: 'Queue',
        Type: ValType.String,
        IsReadOnly: true,
      },
      TaskName: {
        ColumnName: 'TaskName',
        Type: ValType.String,
        IsReadOnly: true,
      },
      Ready2EXE: {
        ColumnName: 'Ready2EXE',
        Type: ValType.String,
        IsReadOnly: true,
      },
      ErrorMessages: {
        ColumnName: 'ErrorMessages',
        Type: ValType.String,
        IsReadOnly: true,
      }

    };
    columns[DisplayColumns.DISPLAY_PROPERTYNAME] = DisplayColumns.DISPLAY_PROPERTY;
    columns[DisplayColumns.DISPLAY_LONG_PROPERTYNAME] = DisplayColumns.DISPLAY_PROPERTY_LONG;

    return { TypeName: 'JobQueue', Columns: columns };
  }
}
