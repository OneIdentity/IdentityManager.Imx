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

import { DisplayPattern, EntitySchema, IClientProperty, IReadValue, TypedEntity, ValType } from 'imx-qbm-dbts';

export class HeatmapInfoTyped extends TypedEntity {
  public readonly ErrorThreshold: IReadValue<number> = this.GetEntityValue('ErrorThreshold');
  public readonly WarningThreshold: IReadValue<number> = this.GetEntityValue('WarningThreshold');
  public readonly Id: IReadValue<string> = this.GetEntityValue('Id');
  public readonly Display: IReadValue<string> = this.GetEntityValue('Display');
  public readonly Description: IReadValue<string> = this.GetEntityValue('Description');

  public GetDisplay(): string {
    return this.Display.value;
  }

  public static GetEntitySchema(): EntitySchema {
    const ret: { [key: string]: IClientProperty } = {};

    ret.ErrorThreshold = {
      Type: ValType.Double,
      ColumnName: 'ErrorThreshold',
    };
    ret.WarningThreshold = {
      Type: ValType.Double,
      ColumnName: 'WarningThreshold',
    };
    ret.Id = {
      Type: ValType.String,
      ColumnName: 'Id',
    };
    ret.Display = {
      Type: ValType.String,
      ColumnName: 'Display',
    };
    ret.Description = {
      Type: ValType.String,
      ColumnName: 'Description',
    };

    return {
      TypeName: 'HeatmapInfoTyped',
      DisplayPattern: new DisplayPattern('%DisplayName%'),
      Columns: ret,
    };
  }
}
