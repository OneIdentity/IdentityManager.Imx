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

import { HierarchyNode } from 'd3-hierarchy';
import { DisplayColumns, DisplayPattern, EntityColumnData, EntityData, EntitySchema, ExtendedTypedEntityCollection, IClientProperty, IReadValue, TypedEntity, TypedEntityBuilder, ValType } from 'imx-qbm-dbts';
import { AdditionalEntityProperties } from './block-properties.interface';
import { HeatmapDataExtended } from './heatmap-data-extended';
export class HeatmapDataTyped extends TypedEntity {
  public readonly Name: IReadValue<string> = this.GetEntityValue('Name');
  public readonly Value: IReadValue<number> = this.GetEntityValue('Value');
  public readonly ValueZ: IReadValue<number> = this.GetEntityValue('ValueZ');
  public readonly State: IReadValue<string> = this.GetEntityValue('State');
  public readonly Ancestors: IReadValue<string> = this.GetEntityValue('Ancestors');
  public readonly Tooltip: IReadValue<string> = this.GetEntityValue('Tooltip');
  public readonly Class: IReadValue<string> = this.GetEntityValue('Class');
  public readonly CurrentHistory: IReadValue<number> = this.GetEntityValue('CurrentHistory');
  public readonly HistoryValues: IReadValue<number[]> = this.GetEntityValue('HistoryValues');
  public readonly HistoryColors: IReadValue<string[]> = this.GetEntityValue('HistoryColors');


  public static GetEntitySchema(): EntitySchema {
    const ret: { [key: string]: IClientProperty } = {};

    ret.Name = {
      Type: ValType.String,
      ColumnName: 'Name',
      Display: '#LDS#Name',
      IsReadOnly: true
    };
    ret.Ancestors = {
      Type: ValType.String,
      ColumnName: 'Ancestors',
      Display: '#LDS#Hierarchy',
      IsReadOnly: true
    };
    ret.Value = {
      Type: ValType.Double,
      ColumnName: 'Value',
      Display: '#LDS#Statistic value',
      IsReadOnly: true
    };
    ret.ValueZ = {
      Type: ValType.Double,
      ColumnName: 'ValueZ',
      Display: '#LDS#Members in this object',
      IsReadOnly: true
    };
    ret.State = {
      Type: ValType.String,
      ColumnName: 'State',
      Display: '#LDS#Current status',
      IsReadOnly: true
    };
    ret.CurrentHistory = {
      Type: ValType.Double,
      ColumnName: 'CurrentHistory',
      IsReadOnly: true
    };
    ret.HistoryValues = {
      Type: ValType.Double,
      ColumnName: 'HistoryValues',
      IsReadOnly: true
    };
    ret.HistoryColors = {
      Type: ValType.String,
      ColumnName: 'HistoryColors',
      IsReadOnly: true
    };

    // Values that should not appear within the details
    ret.Tooltip = {
      Type: ValType.String,
      ColumnName: 'Tooltip',
    };
    ret.Class = {
      Type: ValType.String,
      ColumnName: 'Class',
    };
    ret.BackgroundColor = {
      Type: ValType.String,
      ColumnName: 'BackgroundColor'
    };
    ret.Color = {
      Type: ValType.String,
      ColumnName: 'Color',
    };

    ret[DisplayColumns.DISPLAY_PROPERTYNAME] = DisplayColumns.DISPLAY_PROPERTY;

    return {
      TypeName: 'HeatmapDataTyped',
      DisplayPattern: new DisplayPattern('%Name%'),
      Columns: ret,
      Display: 'Block',
    };
  }

  public static buildEntities(entityData: EntityData[]): ExtendedTypedEntityCollection<HeatmapDataTyped, unknown> {
    const builder = new TypedEntityBuilder(HeatmapDataTyped);
    return builder.buildReadWriteEntities(
      {
        TotalCount: entityData.length,
        Entities: entityData
      },
      HeatmapDataTyped.GetEntitySchema()
    );
  }

  public static buildEntityData(data: HierarchyNode<HeatmapDataExtended>, properties: AdditionalEntityProperties, key: string): EntityData {
    const ret: { [key: string]: EntityColumnData } = {};

    ret.Name = { Value: data.data.Name, IsReadOnly: true };
    ret.ObjectKey = { Value: data.data.ObjectKey, IsReadOnly: true };
    ret.Value = { Value: data.data.Value, IsReadOnly: true };
    ret.ValueZ = { Value: data.data.ValueZ, IsReadOnly: true };
    ret.State = { Value: properties.state, DisplayValue: properties.stateDisplay, IsReadOnly: true };
    ret.Ancestors = { Value: properties.ancestors, IsReadOnly: true };
    ret.Tooltip = { Value: properties.tooltip, IsReadOnly: true };
    ret.Class = { Value: properties.class, IsReadOnly: true };
    ret.Color = { Value: properties.color, IsReadOnly: true };
    ret.BackgroundColor = { Value: properties.backgroundColor, IsReadOnly: true };
    ret.CurrentHistory = { Value: data.data.CurrentHistory, IsReadOnly: true };
    ret.HistoryValues = { Value: properties.historyValues, IsReadOnly: true };
    ret.HistoryColors = { Value: properties.historyColors, IsReadOnly: true };

    return { Columns: ret, Keys: [key] };
  }

}
