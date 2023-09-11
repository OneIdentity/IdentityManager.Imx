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

import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { EuiSelectOption, EuiSidesheetRef, EUI_SIDESHEET_DATA } from '@elemental-ui/core';
import { TranslateService } from '@ngx-translate/core';
import { hierarchy, HierarchyNode } from 'd3-hierarchy';
import { ScaleQuantile, scaleQuantile } from 'd3-scale';
import { HeatmapData, HeatmapDto } from 'imx-api-qer';
import { CollectionLoadParameters, IEntity, TypedEntityCollectionData } from 'imx-qbm-dbts';
import { DataSourceToolbarFilter, DataSourceToolbarSettings, LdsReplacePipe, ShortDatePipe } from 'qbm';
import { Subscription } from 'rxjs';
import { HeatmapInfoTyped } from '../../statistics-home-page/heatmap-info-typed';
import { StatisticsSidesheetResponse } from '../../statistics-home-page/statistics-cards-visuals/statistics-cards-visuals.component';
import { Block, BlockState, ClassState } from '../block-properties.interface';
import { HeatmapDataExtended } from '../heatmap-data-extended';
import { HeatmapDataTyped } from '../heatmap-data-typed';
import { HeatmapSidesheetService } from './heatmap-sidesheet.service';

@Component({
  selector: 'imx-heatmap-sidesheet',
  templateUrl: './heatmap-sidesheet.component.html',
  styleUrls: ['./heatmap-sidesheet.component.scss'],
})
export class HeatmapSidesheetComponent implements OnInit, OnDestroy {
  // DST variables
  public navigationState: CollectionLoadParameters;
  public filterOptions: DataSourceToolbarFilter[];
  public dstSettings: DataSourceToolbarSettings;
  public pageSizeOptions = [50, 100, 200];

  // UI values
  public showHeatmap = true;
  public presentIndex = -1;
  public chosenDateIndex = this.presentIndex;
  public dateControl = new FormControl(null);
  public dateOptions: EuiSelectOption[];

  // Data containers
  public uniformBlocks: Block[] = [];
  public dynamicBlocks: Block[] = [];
  public hierarchyData: HierarchyNode<HeatmapDataExtended>;
  public savedData: {
    [index: number]: {
      data: TypedEntityCollectionData<HeatmapDataTyped>;
      minValue: number;
      maxValue: number;
    };
  } = {};
  public nodesOnScreen: HeatmapDataTyped[] = [];

  // Parameters
  public rowDefaultSize = 5;
  public colDefaultSize = 5;
  public rowDefaultRange: number[];
  public colDefaultRange: number[];
  public rowScale: ScaleQuantile<number>;
  public colScale: ScaleQuantile<number>;

  // Subs
  private closeClicked$: Subscription;

  constructor(
    @Inject(EUI_SIDESHEET_DATA)
    public data: {
      heatmapInfo: HeatmapInfoTyped;
      heatmap: HeatmapDto;
      isFavorite: boolean;
      isOrg: boolean;
      isUserAdmin: boolean;
    },
    public heatmapsService: HeatmapSidesheetService,
    private sidesheetRef: EuiSidesheetRef,
    private translate: TranslateService,
    private replacePipe: LdsReplacePipe,
    private shortDate: ShortDatePipe
  ) {}

  public get hasData(): boolean {
    return this.savedData[this.chosenDateIndex] && this.savedData[this.chosenDateIndex].data.totalCount > 0;
  }

  public get hasFilterData(): boolean {
    return this.nodesOnScreen.length > 0;
  }

  public get isHistoryView(): boolean {
    return this.chosenDateIndex !== this.presentIndex;
  }

  public get hasLB(): boolean {
    return this.savedData[this.chosenDateIndex] && this.savedData[this.chosenDateIndex].minValue < 0;
  }

  public get hasUB(): boolean {
    return this.savedData[this.chosenDateIndex] && this.savedData[this.chosenDateIndex].maxValue > 0;
  }

  public get formatLB(): string {
    return Math.abs(this.savedData[this.chosenDateIndex].minValue).toLocaleString(undefined, { maximumFractionDigits: 2 });
  }
  public get formatUB(): string {
    return Math.abs(this.savedData[this.chosenDateIndex].maxValue).toLocaleString(undefined, { maximumFractionDigits: 2 });
  }

  public async ngOnInit(): Promise<void> {
    this.closeClicked$ = this.sidesheetRef.closeClicked().subscribe(() => {
      const response: StatisticsSidesheetResponse = {
        isFavorite: this.data.isFavorite,
        isOrg: this.data.isOrg,
      };
      this.sidesheetRef.close(response);
    });
    await this.setupConstants();
    this.setupValues();
  }

  public ngOnDestroy(): void {
    this.closeClicked$.unsubscribe();
  }

  public async setupConstants(): Promise<void> {
    this.navigationState = {
      PageSize: 100,
      StartIndex: 0,
    };
    this.heatmapsService.setConstants({
      heatmapInfo: this.data.heatmapInfo,
      heatmap: this.data.heatmap,
    });
    await this.setupHistoryDropdown();

    this.rowDefaultRange = this.makeArrayToN(this.rowDefaultSize);
    this.colDefaultRange = this.makeArrayToN(this.colDefaultSize);
    this.rowScale = scaleQuantile();
    this.colScale = scaleQuantile();

    this.filterOptions = [
      {
        Description: await this.translate.get('#LDS#Status').toPromise(),
        Name: await this.translate.get('#LDS#Status').toPromise(),
        Delimiter: ',',
        Options: [
          {
            Value: this.heatmapsService.stateThresholds.ok.properties.state,
            Display: this.heatmapsService.stateThresholds.ok.properties.stateDisplay,
          },
          {
            Value: this.heatmapsService.stateThresholds.lightWarn.properties.state,
            Display: this.heatmapsService.stateThresholds.lightWarn.properties.stateDisplay,
          },
          {
            Value: this.heatmapsService.stateThresholds.warn.properties.state,
            Display: this.heatmapsService.stateThresholds.warn.properties.stateDisplay,
          },
          {
            Value: this.heatmapsService.stateThresholds.severeWarn.properties.state,
            Display: this.heatmapsService.stateThresholds.severeWarn.properties.stateDisplay,
          },
          {
            Value: this.heatmapsService.stateThresholds.error.properties.state,
            Display: this.heatmapsService.stateThresholds.error.properties.stateDisplay,
          },
        ],
        Column: 'State',
      },
    ];
  }

  public async setupHistoryDropdown(): Promise<void> {
    const presentDayText = await this.translate.get('#LDS#Current date - {0}').toPromise();
    const today = new Date();
    const todayText = this.replacePipe.transform(presentDayText, this.shortDate.transform(today.toString()));

    this.dateOptions = [
      {
        display: todayText,
        value: this.presentIndex.toString(),
      },
    ];
    this.dateControl.setValue(this.presentIndex.toString());

    // Check if we have history, if not we can stop here
    if (!this.data.heatmap.HistoryDates || this.data.heatmap.HistoryDates.length === 0) {
      return;
    }
    // Sort dates as most recent
    const fromLastYearText = await this.translate.get('#LDS#Last year - {0}').toPromise();
    const fromThisYearText = await this.translate.get('#LDS#This year - {0}').toPromise();
    const fromLastMonthText = await this.translate.get('#LDS#Last month - {0}').toPromise();
    const fromThisMonthText = await this.translate.get('#LDS#This month - {0}').toPromise();

    const newDateOptions = this.data.heatmap.HistoryDates.map((date, index) => {
      date = new Date(date);
      let text: string;

      // logic to determine which case
      const isLastYear = today.getFullYear() - date.getFullYear() === 1;
      const isThisYear = today.getFullYear() - date.getFullYear() === 0;
      const isLastMonth = (date.getMonth() + 1) % 12 === today.getMonth();
      const isThisMonth = today.getMonth() - date.getMonth() === 0;
      const dateString = this.shortDate.transform(date.toString());

      switch (true) {
        case isThisYear && isThisMonth:
          text = this.replacePipe.transform(fromThisMonthText, dateString);
          break;
        case isLastMonth:
          text = this.replacePipe.transform(fromLastMonthText, dateString);
          break;
        case isThisYear:
          text = this.replacePipe.transform(fromThisYearText, dateString);
          break;
        case isLastYear:
          text = this.replacePipe.transform(fromLastYearText, dateString);
          break;
        default:
          text = dateString;
          break;
      }
      return {
        display: text,
        value: index.toString(),
      } as EuiSelectOption;
    })
      .sort((a, b) => (a.value < b.value ? -1 : b.value > a.value ? 1 : 0))
      .reverse();
    this.dateOptions = [...this.dateOptions, ...newDateOptions];
  }

  public sortBySize(): void {
    if (this.isHistoryView) {
      // Sort initially by size desc, if ties, then sort by history value
      this.dynamicBlocks.sort((a, b) => {
        const objA = a.object.GetEntity();
        const objB = b.object.GetEntity();
        return (
          objB.GetColumn('ValueZ').GetValue() - objA.GetColumn('ValueZ').GetValue() ||
          objB.GetColumn('CurrentHistory').GetValue() - objA.GetColumn('CurrentHistory').GetValue()
        );
      });
    } else {
      // Sort initially by size desc, if ties, then sort by stat desc
      this.dynamicBlocks.sort((a, b) => {
        const objA = a.object.GetEntity();
        const objB = b.object.GetEntity();
        return (
          objB.GetColumn('ValueZ').GetValue() - objA.GetColumn('ValueZ').GetValue() ||
          objB.GetColumn('Value').GetValue() - objA.GetColumn('Value').GetValue()
        );
      });
    }
  }

  public sortByStatistic(): void {
    // We will either sort by the history delta, or the statistic here
    if (this.isHistoryView) {
      this.uniformBlocks
        .sort(
          (a, b) =>
            a.object.GetEntity().GetColumn('CurrentHistory').GetValue() - b.object.GetEntity().GetColumn('CurrentHistory').GetValue()
        )
        .reverse();
    } else {
      this.uniformBlocks
        .sort((a, b) => a.object.GetEntity().GetColumn('Value').GetValue() - b.object.GetEntity().GetColumn('Value').GetValue())
        .reverse();
    }
  }

  public setupValues(): void {
    const formattedData: HeatmapDataExtended = {
      Value: 0,
      ValueZ: 0,
      Name: 'Top',
      Children: this.data.heatmap.Data,
    };
    this.hierarchyData = hierarchy(formattedData, (d) => {
      return d.Children;
    });

    const nodes = this.getNodes();
    this.setGlobalScale(nodes);

    this.savedData[this.chosenDateIndex] = {
      data: this.heatmapsService.getBlocks(nodes),
      minValue: 0,
      maxValue: 0,
    };

    this.setData(this.savedData[this.chosenDateIndex].data);
  }

  public getNodes(): HierarchyNode<HeatmapDataExtended>[] {
    // Get Descendants, rotate 'top' node out, and initially sort all data by Value, where highest shows up first
    const nodes = this.hierarchyData.descendants();
    if (nodes[0].data.Name === 'Top') {
      nodes.shift();
    }
    return nodes.sort((a, b) => a.data.Value - b.data.Value).reverse();
  }

  public setData(dataSource: TypedEntityCollectionData<HeatmapDataTyped>): void {
    // Here we make sure to only take a copy of the data so we keep data saved on the client
    this.dstSettings = {
      dataSource: {
        Data: dataSource.Data.slice(0),
        totalCount: dataSource.totalCount,
      },
      navigationState: this.navigationState,
      entitySchema: HeatmapDataTyped.GetEntitySchema(),
      filters: this.filterOptions,
    };
  }

  public getDeltas(change: EuiSelectOption): void {
    this.chosenDateIndex = Number.parseInt(change.value as string);
    // Check if we have already calculated this
    if (!this.savedData[this.chosenDateIndex]) {
      this.computeHistory();
    }
    this.setData(this.savedData[this.chosenDateIndex].data);
  }

  public getDifference(data: HeatmapDataExtended): number {
    if (data.History && data.History[this.chosenDateIndex]) {
      return data.Value - data.History[this.chosenDateIndex];
    }
    return 0;
  }

  public computeHistory(): void {
    // We need to take the delta between current and the historical point
    const nodes = this.getNodes();
    nodes.forEach((node) => {
      node.data.CurrentHistory = this.getDifference(node.data);
    });
    const filteredNodes = nodes.filter((node) => node.data.CurrentHistory !== 0);
    const nNodes = filteredNodes.length;
    if (nNodes > 0) {
      // If we actually have non-zero values, get the blocks in largest to lowest order
      filteredNodes.sort((a, b) => a.data.CurrentHistory - b.data.CurrentHistory).reverse();
      const maxValue = filteredNodes[0].data.CurrentHistory;
      const minValue = filteredNodes[nNodes - 1].data.CurrentHistory;
      this.savedData[this.chosenDateIndex] = {
        data: this.heatmapsService.getHistoryBlocks(filteredNodes, { maxValue, minValue }),
        minValue,
        maxValue,
      };
    } else {
      // Otherwise we set null states for this data
      this.savedData[this.chosenDateIndex] = {
        data: {
          Data: [],
          totalCount: 0,
        },
        minValue: 0,
        maxValue: 0,
      };
    }
  }

  public onSettingsChanged(settings: DataSourceToolbarSettings): void {
    const nodes = settings.dataSource.Data as HeatmapDataTyped[];
    if (nodes.length > settings.navigationState.PageSize) {
      this.nodesOnScreen = nodes.slice(
        settings.navigationState.StartIndex,
        settings.navigationState.StartIndex + settings.navigationState.PageSize
      );
    } else {
      this.nodesOnScreen = nodes;
    }
    this.createUniformBlocks();
    this.createDynamicBlocks();
  }

  public createUniformBlocks(): void {
    this.uniformBlocks = [];
    this.nodesOnScreen.forEach((item) => {
      this.uniformBlocks.push(this.createUniformBlock(item));
    });
    this.sortByStatistic();
  }

  public createDynamicBlocks(): void {
    this.dynamicBlocks = [];
    this.nodesOnScreen.forEach((item) => {
      this.dynamicBlocks.push(this.createDynamicBlock(item));
    });
    this.sortBySize();
  }

  public changePlotType(): void {
    this.showHeatmap = !this.showHeatmap;
  }

  public createUniformBlock(item: HeatmapDataTyped): Block {
    const entity = item.GetEntity();
    return {
      name: entity.GetColumn('Name').GetValue() as string,
      tooltip: entity.GetColumn('Tooltip').GetValue() as string,
      state: entity.GetColumn('State').GetValue() as BlockState,
      class: entity.GetColumn('Class').GetValue() as ClassState,
      ...this.getColorAndText(entity),
      cols: 'span 1',
      rows: 'span 1',
      object: item,
      historyValues: entity.GetColumn('HistoryValues').GetValue() as number[],
      historyColors: entity.GetColumn('HistoryColors').GetValue() as string[],
    };
  }

  public createDynamicBlock(item: HeatmapDataTyped): Block {
    const entity = item.GetEntity();
    return {
      name: entity.GetColumn('Name').GetValue() as string,
      tooltip: entity.GetColumn('Tooltip').GetValue() as string,
      state: entity.GetColumn('State').GetValue() as BlockState,
      class: entity.GetColumn('Class').GetValue() as ClassState,
      ...this.getColorAndText(entity),
      ...this.getDisplayVals(entity),
      object: item,
      historyValues: entity.GetColumn('HistoryValues').GetValue() as number[],
      historyColors: entity.GetColumn('HistoryColors').GetValue() as string[],
    };
  }

  public makeArrayToN(n: number): number[] {
    return [...Array(n + 1).keys()].slice(1);
  }

  public setGlobalScale(nodes: HierarchyNode<HeatmapData>[]): void {
    // This function calculates how many unique sizes occur, orders them and sets a scale dependant on this
    const uniqueVals = [...new Set(nodes.map((item) => item.data.ValueZ))].sort((a, b) => a - b).reverse();
    if (uniqueVals.length < this.rowDefaultSize) {
      this.rowScale.range(this.makeArrayToN(uniqueVals.length));
    } else {
      this.rowScale.range(this.rowDefaultRange);
    }
    if (uniqueVals.length < this.colDefaultSize) {
      this.colScale.range(this.makeArrayToN(uniqueVals.length));
    } else {
      this.colScale.range(this.colDefaultRange);
    }
    this.rowScale.domain(uniqueVals);
    this.colScale.domain(uniqueVals);
  }

  public getColorAndText(item: IEntity): { backgroundColor: string; color: string } {
    // Background color sets the block color, color sets the font color
    const backgroundColor = item.GetColumn('BackgroundColor').GetValue() as string;
    const color = item.GetColumn('Color').GetValue() as string;
    return { backgroundColor, color };
  }

  public getDisplayVals(item: IEntity): { cols: string; rows: string; fontsize: string } {
    const cols = this.colScale(item.GetColumn('ValueZ').GetValue());
    const rows = this.rowScale(item.GetColumn('ValueZ').GetValue());
    const fontsize = 8 + 2 * cols;
    return {
      cols: 'span ' + cols.toString(),
      rows: 'span ' + rows.toString(),
      fontsize: fontsize.toString() + 'px',
    };
  }

  public toggleFavorites(): void {
    this.data.isFavorite = !this.data.isFavorite;
  }
  public toggleOrg(): void {
    this.data.isOrg = !this.data.isOrg;
  }
}
