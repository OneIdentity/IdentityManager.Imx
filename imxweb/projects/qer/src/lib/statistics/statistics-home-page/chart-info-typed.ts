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

import { ChartInfoDto } from 'imx-api-qer';
import {
  DisplayPattern,
  EntityColumnData,
  EntityData,
  EntitySchema,
  ExtendedTypedEntityCollection,
  IClientProperty,
  IReadValue,
  IWriteValue,
  TypedEntity,
  TypedEntityBuilder,
  ValType,
} from 'imx-qbm-dbts';

export class ChartInfoTyped extends TypedEntity {
  public readonly Area: IReadValue<string> = this.GetEntityValue('Area');
  public IsFavorite: IWriteValue<boolean> = this.GetEntityValue('IsFavorite');
  public IsOrg: IWriteValue<boolean> = this.GetEntityValue('IsOrg');
  public readonly Id: IReadValue<string> = this.GetEntityValue('Id');
  public readonly Display: IReadValue<string> = this.GetEntityValue('Display');
  public readonly Description: IReadValue<string> = this.GetEntityValue('Description');
  public readonly HistoryLength: IReadValue<number> = this.GetEntityValue('HistoryLength');
  public readonly HasListReport: IReadValue<boolean> = this.GetEntityValue('HasListReport');

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
      ColumnName: 'IsFavorite',
    };
    ret.IsOrg = {
      Type: ValType.Bool,
      ColumnName: 'IsOrg',
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
    ret.HistoryLength = {
      Type: ValType.Int,
      ColumnName: 'HistoryLength',
    };
    ret.HasListReport = {
      Type: ValType.Bool,
      ColumnName: 'HasListReport',
    };

    return {
      TypeName: 'ChartInfoTyped',
      DisplayPattern: new DisplayPattern('%Display%'),
      Columns: ret,
    };
  }

  public static buildEntities(entityData: EntityData[]): ExtendedTypedEntityCollection<ChartInfoTyped, unknown> {
    const builder = new TypedEntityBuilder(ChartInfoTyped);
    return builder.buildReadWriteEntities(
      {
        TotalCount: entityData.length,
        Entities: entityData,
      },
      ChartInfoTyped.GetEntitySchema()
    );
  }

  public static buildEntityData(data: ChartInfoDto, extras?: { isFavorite: boolean; isOrg: boolean }): EntityData {
    const ret: { [key: string]: EntityColumnData } = {};

    // Setup data
    ret.Area = { Value: data.Area, IsReadOnly: true };
    ret.IsFavorite = { Value: extras?.isFavorite, IsReadOnly: false };
    ret.IsOrg = { Value: extras?.isOrg, IsReadOnly: false };
    ret.Display = { Value: data.Title, IsReadOnly: true };
    ret.Description = { Value: data.Description, IsReadOnly: true };
    ret.Id = { Value: data.Id, IsReadOnly: true };
    ret.HistoryLength = { Value: data.HistoryLength, IsReadOnly: true };
    ret.HasListReport = { Value: data.HasListReport, IsReadOnly: true };

    return { Columns: ret };
  }

  public static toTypedEntity(data: ChartInfoDto): ChartInfoTyped {
    const entityData = this.buildEntityData(data);
    const builder = new TypedEntityBuilder(ChartInfoTyped);

    return builder.buildReadWriteEntity({
      entityData,
      entitySchema: ChartInfoTyped.GetEntitySchema(),
    });
  }
}
