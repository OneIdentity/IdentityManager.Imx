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

import {
  EntityColumnData,
  EntityData,
  EntitySchema,
  IClientProperty,
  IReadValue,
  IWriteValue,
  TypedEntity,
  TypedEntityBuilder,
  ValType,
} from 'imx-qbm-dbts';

// Types
export type StatusStateCSS = 'is-ok' | 'is-warn' | 'is-error';
export type StatusIcon = 'setdefault' | 'warning' | 'error-circle';
export type TrendIcon = 'arrowup' | 'arrowdown';

export interface PointStatStatus {
  displayValue: string;
  description: string;
  value: number;
  hasTrend: boolean;
  trend: string;
  trendIcon?: TrendIcon;
  statusIcon: StatusIcon;
  statusClass: StatusStateCSS;
  status: string;
}

export class PointStatTyped extends TypedEntity {
  public readonly DisplayValue: IReadValue<string> = this.GetEntityValue('DisplayValue');
  public readonly Value: IReadValue<number> = this.GetEntityValue('Value');
  public readonly HasTrend: IReadValue<boolean> = this.GetEntityValue('HasTrend');
  public readonly Trend: IReadValue<string> = this.GetEntityValue('Trend');
  public readonly TrendIconString: IReadValue<string> = this.GetEntityValue('TrendIconString');
  public readonly Status: IReadValue<string> = this.GetEntityValue('Status');
  public readonly StatusIconString: IReadValue<string> = this.GetEntityValue('StatusIconString');
  public readonly StatusClass: IReadValue<string> = this.GetEntityValue('StatusClass');

  public static GetEntitySchema(): EntitySchema {
    const ret: { [key: string]: IClientProperty } = {};

    ret.Value = {
      Type: ValType.Double,
      ColumnName: 'Value',
      Display: '#LDS#Statistic value',
    };
    ret.DisplayValue = {
      Type: ValType.String,
      ColumnName: 'DisplayValue',
      Display: '#LDS#Statistic value',
    };
    ret.Description = {
      Type: ValType.String,
      ColumnName: 'Description',
      Display: '#LDS#Description',
    };
    ret.HasTrend = {
      Type: ValType.Bool,
      ColumnName: 'HasTrend',
    };
    ret.Trend = {
      Type: ValType.String,
      ColumnName: 'Trend',
      Display: '#LDS#Current status',
    };
    ret.TrendIconString = {
      Type: ValType.String,
      ColumnName: 'TrendIconString',
    };
    ret.Status = {
      Type: ValType.String,
      ColumnName: 'Status',
    };
    ret.StatusIconString = {
      Type: ValType.String,
      ColumnName: 'StatusIconString',
    };
    ret.StatusClass = {
      Type: ValType.String,
      ColumnName: 'StatusClass',
    };

    return {
      TypeName: 'PointStatTyped',
      Columns: ret,
    };
  }

  public static buildEntity(status: PointStatStatus): PointStatTyped {
    const builder = new TypedEntityBuilder(PointStatTyped);
    return builder.buildReadWriteEntity({
      entityData: this.buildEntityData(status),
      entitySchema: this.GetEntitySchema(),
    });
  }

  public static buildEntityData(status: PointStatStatus): EntityData {
    const ret: { [key: string]: EntityColumnData } = {};
    // Setup data
    ret.DisplayValue = { Value: status.displayValue, IsReadOnly: true };
    ret.Value = { Value: status.value, IsReadOnly: true };
    ret.Description = { Value: status.description, IsReadOnly: true };
    ret.HasTrend = { Value: status.hasTrend, IsReadOnly: true };
    ret.Trend = { Value: status.trend, IsReadOnly: true };
    ret.TrendIconString = { Value: status?.trendIcon, IsReadOnly: true };
    ret.Status = { Value: status.status, IsReadOnly: true };
    ret.StatusIconString = { Value: status.statusIcon, IsReadOnly: true };
    ret.StatusClass = { Value: status.statusClass, IsReadOnly: true };

    return { Columns: ret };
  }
}
