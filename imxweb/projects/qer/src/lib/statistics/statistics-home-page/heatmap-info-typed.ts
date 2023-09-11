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

import { HeatmapInfoDto } from 'imx-api-qer';
import { DisplayPattern, EntityColumnData, EntityData, EntitySchema, ExtendedTypedEntityCollection, IClientProperty, IReadValue, IWriteValue, TypedEntity, TypedEntityBuilder, ValType } from 'imx-qbm-dbts';

export class HeatmapInfoTyped extends TypedEntity {
  public readonly Area: IReadValue<string> = this.GetEntityValue('Area');
  public IsFavorite: IWriteValue<boolean> = this.GetEntityValue('IsFavorite');
  public IsOrg: IWriteValue<boolean> = this.GetEntityValue('IsOrg');
  public readonly NegateThresholds: IReadValue<boolean> = this.GetEntityValue('NegateThresholds');
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

    ret.Area = {
      Type: ValType.String,
      ColumnName: 'Area',
    };
    ret.IsFavorite = {
      Type: ValType.Bool,
      ColumnName: 'IsFavorite'
    };
    ret.IsOrg = {
      Type: ValType.Bool,
      ColumnName: 'IsOrg'
    };
    ret.NegateThresholds = {
      Type: ValType.Double,
      ColumnName: 'NegateThresholds',
    };
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
      DisplayPattern: new DisplayPattern('%Display%'),
      Columns: ret,
    };
  }

  public static buildEntities(entityData: EntityData[]): ExtendedTypedEntityCollection<HeatmapInfoTyped, unknown> {
    const builder = new TypedEntityBuilder(HeatmapInfoTyped);
    return builder.buildReadWriteEntities(
      {
        TotalCount: entityData.length,
        Entities: entityData
      },
      HeatmapInfoTyped.GetEntitySchema()
    );
  }

  public static buildEntityData(data: HeatmapInfoDto, extras?: {isFavorite: boolean, isOrg: boolean}): EntityData {
    const ret: { [key: string]: EntityColumnData } = {};

    // Setup data
    ret.Area = { Value: data.Area, IsReadOnly: true };
    ret.IsFavorite = {Value: extras?.isFavorite, IsReadOnly: false};
    ret.IsOrg = {Value: extras?.isOrg, IsReadOnly: false};
    ret.Display = { Value: data.Display, IsReadOnly: true };
    ret.Description = { Value: data.Description, IsReadOnly: true };
    ret.Id = { Value: data.Id, IsReadOnly: true };
    ret.NegateThresholds = {Value: data.NegateThresholds, IsReadOnly: true};
    ret.ErrorThreshold = { Value: data.ErrorThreshold, IsReadOnly: true };
    ret.WarningThreshold = { Value: data.WarningThreshold, IsReadOnly: true };

    return { Columns: ret };
  }
}
