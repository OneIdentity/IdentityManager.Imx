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

import { Injectable } from '@angular/core';
import { EuiSidesheetService } from '@elemental-ui/core';
import { HierarchyNode } from 'd3-hierarchy';
import { ScaleLinear, scaleLinear } from 'd3-scale';
import { LdsReplacePipe } from 'qbm';
import { HeatmapData, HeatmapDto } from 'imx-api-qer';
import { TypedEntityCollectionData } from 'imx-qbm-dbts';
import { Block, BlockState, ClassState, StateThresholds, AdditionalEntityProperties, ColorValues, StateProperties } from '../block-properties.interface';
import { BlockDetailSidesheetComponent } from '../block-detail-sidesheet/block-detail-sidesheet.component';
import { HeatmapDataExtended } from '../heatmap-data-extended';
import { HeatmapDataTyped } from '../heatmap-data-typed';
import { HeatmapInfoTyped } from '../../statistics-home-page/heatmap-info-typed';
import { StatisticsConstantsService } from '../../statistics-home-page/statistics-constants.service';

@Injectable({
  providedIn: 'root',
})
export class HeatmapSidesheetService {
  public stateThresholds: StateThresholds = {};
  public colorValues: ColorValues;
  public heatmapInfo: HeatmapInfoTyped;
  public heatmapProperties: HeatmapDto;

  constructor(
    private constantService: StatisticsConstantsService,
    private sidesheetService: EuiSidesheetService,
    private replacePipe: LdsReplacePipe
  ) {
    this.colorValues = this.constantService.colorValues;
  }

  public setConstants(constants: { heatmapInfo: HeatmapInfoTyped; heatmap: HeatmapDto }): void {
    this.heatmapInfo = constants.heatmapInfo;
    this.setThresholds();
    this.heatmapProperties = constants.heatmap;
  }

  public setThresholds(): void {
    const heatmapInfoEntity = this.heatmapInfo.GetEntity();
    const errorThreshold = heatmapInfoEntity.GetColumn('ErrorThreshold').GetValue();
    const warnThreshold = heatmapInfoEntity.GetColumn('WarningThreshold').GetValue();

    this.stateThresholds.error = {
      value: errorThreshold,
      properties: {
        class: 'block-error',
        state: 'Error',
        stateDisplay: this.constantService.errorStatusText,
        color: this.colorValues.Error,
      }
    };
    this.stateThresholds.warn = {
      value: warnThreshold === 0 ? errorThreshold/2 : warnThreshold,
      properties: {
        class: 'block-warn',
        state: 'Moderate',
        stateDisplay: this.constantService.warningStatusText,
        color: this.colorValues.Warn,
      }
    };
    this.stateThresholds.severeWarn = {
      value: (this.stateThresholds.error.value + this.stateThresholds.warn.value) / 2,
      properties: {
        class: 'block-severe-warn',
        state: 'Severe',
        stateDisplay: this.constantService.severeWarningStatusText,
        color: this.colorValues.SevereWarn,
      }
    };
    this.stateThresholds.lightWarn = {
      value: warnThreshold === 0 ? 0 : this.stateThresholds.warn.value / 2,
      properties: {
        class: 'block-light-warn',
        state: 'Light',
        stateDisplay: this.constantService.lightWarningStatusText,
        color: this.colorValues.LightWarn,
      }
    };
    this.stateThresholds.ok = {
      properties: {
        class: 'block-ok',
        state: 'Ok',
        stateDisplay: this.constantService.okStatusText,
        color: this.colorValues.Ok,
      }
    };
  }

  public getBlocks(nodes: HierarchyNode<HeatmapData>[]): TypedEntityCollectionData<HeatmapDataTyped> {
    const entities = nodes.map((element, index) => {
      const properties = this.getProperties(element);
      return HeatmapDataTyped.buildEntityData(element, properties, `${index}`);
    });
    return HeatmapDataTyped.buildEntities(entities);
  }

  public getHistoryBlocks(
    nodes: HierarchyNode<HeatmapDataExtended>[],
    params: {
      minValue: number;
      maxValue: number;
    }
  ): TypedEntityCollectionData<HeatmapDataTyped> {
    // Need to set a color map
    let colorMap: ScaleLinear<string, string>;
    let textMap: (value: number) => string;
    if (params.minValue === 0 && params.maxValue > 0) {
      // No LB
      colorMap = scaleLinear<string>().domain([0, params.maxValue]).range([this.colorValues.Warn, this.colorValues.Error]);
      textMap = (value: number) => (value < (2 * params.maxValue) / 3 ? this.colorValues.Dark : this.colorValues.Light);
    } else if (params.minValue < 0 && params.maxValue === 0) {
      // No UB
      colorMap = scaleLinear<string>().domain([params.minValue, 0]).range([this.colorValues.Ok, this.colorValues.Warn]);
      textMap = (value: number) => (value > (2 * params.minValue) / 3 ? this.colorValues.Dark : this.colorValues.Light);
    } else {
      colorMap = scaleLinear<string>()
        .domain([params.minValue, 0, params.maxValue])
        .range([this.colorValues.Ok, this.colorValues.Warn, this.colorValues.Error]);
      textMap = (value: number) =>
        value > (2 * params.minValue) / 3 && value < (2 * params.maxValue) / 3 ? this.colorValues.Dark : this.colorValues.Light;
    }
    const entities = nodes.map((element, index) => {
      const properties = this.getHistoryProperties(element, colorMap, textMap);
      return HeatmapDataTyped.buildEntityData(element, properties, `${index}`);
    });
    return HeatmapDataTyped.buildEntities(entities);
  }

  public getProperties(item: HierarchyNode<HeatmapData>): AdditionalEntityProperties {
    const data = item.data;
    const stateProperties = this.getStateProperties(data.Value);
    const ancestors = this.getAncestors(item);
    const tooltip = this.getTooltip(data, ancestors);
    const backgroundColor = '';
    const color = '';
    const historyValues = data.History ?? [];
    const historyColors = this.getHistoryColors(historyValues);
    return {
      state: stateProperties.state,
      stateDisplay: stateProperties.stateDisplay,
      class: stateProperties.class,
      backgroundColor,
      color,
      ancestors,
      tooltip,
      historyValues,
      historyColors,
    };
  }

  public getHistoryProperties(
    item: HierarchyNode<HeatmapDataExtended>,
    colorMap: ScaleLinear<string, string>,
    textMap: (value: number) => string
  ): AdditionalEntityProperties {
    const data = item.data;
    const stateProperties = this.getStateProperties(data.Value);
    const ancestors = this.getAncestors(item);
    const tooltip = this.getHistoryTooltip(data, ancestors);
    const backgroundColor = colorMap(data.CurrentHistory);
    const color = textMap(data.CurrentHistory);
    // It is possible that these values do not exist, so we set defaults for them as empty arrays
    const historyValues = data.History ?? [];
    const historyColors = data.History ? this.getHistoryColors(data.History) : [];
    return {
      state: stateProperties.state,
      stateDisplay: stateProperties.stateDisplay,
      class: stateProperties.class,
      backgroundColor,
      color,
      ancestors,
      tooltip,
      historyValues,
      historyColors,
    };
  }

  public getStateProperties(value: number): StateProperties {
    const negateThresholds: boolean = this.heatmapInfo.GetEntity().GetColumn('NegateThresholds').GetValue();
    if (negateThresholds) {
      // We work topdown from error
      switch (true) {
        case value <= this.stateThresholds.error.value:
          return this.stateThresholds.error.properties;

        case value <= this.stateThresholds.severeWarn.value:
          return this.stateThresholds.severeWarn.properties;

        case value <= this.stateThresholds.warn.value:
          return this.stateThresholds.warn.properties;

        case value <= this.stateThresholds.lightWarn.value:
            return this.stateThresholds.lightWarn.properties;
        default:
          return this.stateThresholds.ok.properties;
      }
    }
    switch (true) {
      // If we have error set to 0, any value over 0 should be in error
      case this.stateThresholds.error?.value === 0 && value > 0:
        return this.stateThresholds.error.properties;

      case this.stateThresholds.error.value === 0 || value === 0 || value < this.stateThresholds.lightWarn.value:
        return this.stateThresholds.ok.properties;

      case value < this.stateThresholds.warn.value:
        return this.stateThresholds.lightWarn.properties;

      case value < this.stateThresholds.severeWarn.value:
        return this.stateThresholds.warn.properties;

      case value < this.stateThresholds.error.value:
        return this.stateThresholds.severeWarn.properties;

      default:
        return this.stateThresholds.error.properties;
    }
  }

  public getAncestors(item: HierarchyNode<HeatmapData>): string {
    const ancestors = item
      .ancestors()
      .reverse()
      .map((node) => node.data.Name);
    if (ancestors[0] === 'Top') {
      ancestors.shift(); // Remove 'Top' level
    }
    return ancestors.join('/');
  }

  public getTooltip(item: HeatmapData, ancestors: string): string {
    const tooltip = this.heatmapProperties.Tooltip.slice();
    if (tooltip.includes('{2}')) {
      //  This is a ternary tooltip, expect {2 - Name}: {0 - Size} - {1 - Value} format
      return this.replacePipe.transform(tooltip, item.ValueZ.toString(), item.Value.toString(), ancestors);
    }
    //  This is a binary tooltip, expect {1 - Name}: {0 - value} format
    return this.replacePipe.transform(tooltip, item.Value.toString(), ancestors);
  }

  public getHistoryColors(history?: number[]): string[] {
    return history?.map((value) => {
      const stateProperties = this.getStateProperties(value);
      return stateProperties.color;
    });
  }

  public getHistoryTooltip(item: HeatmapDataExtended, ancestors: string): string {
    const value = item.CurrentHistory;
    const change = Math.abs(value).toLocaleString(undefined, {maximumFractionDigits: 2});
    const incOrDec = value > 0 ? this.constantService.increasedText : this.constantService.decreasedText;
    const tooltip = this.heatmapProperties.TooltipChange.slice();
    if (tooltip.includes('{3}')) {
      // This is a quaternary tooltip, expect {2 - Name} {0 - Size}, {3 - Direction} by {1 - Change}
      return this.replacePipe.transform(tooltip, item.ValueZ.toString(), change, ancestors, incOrDec);
    }
    // Otherwise this is a ternary tooltip, expect {1 - Name}, {2 - Direction} by {0 - Change}
    return this.replacePipe.transform(tooltip, change, ancestors,incOrDec);
  }

  public async openBlockDetails(block: Block): Promise<void> {
    await this.sidesheetService
      .open(BlockDetailSidesheetComponent, {
        title: block.name,
        subTitle: this.heatmapInfo.GetEntity().GetDisplay(),
        padding: '0px',
        width: 'max(50%, 700px)',
        testId: 'statistics-heatmap-block-details-sidesheet',
        data: {
          block,
          historyDates: this.heatmapProperties.HistoryDates,
        },
      })
      .afterClosed()
      .toPromise();
  }
}
