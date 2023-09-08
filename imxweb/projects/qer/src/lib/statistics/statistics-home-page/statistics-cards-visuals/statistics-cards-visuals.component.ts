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
  Component,
  Input,
  OnInit,
  OnDestroy,
  ViewChild,
  ElementRef
} from '@angular/core';
import { EuiLoadingService, EuiSidesheetService } from '@elemental-ui/core';
import { Subscription } from 'rxjs';
import { bar, Chart, ChartOptions, donut, line } from 'billboard.js';

import { ChartDto, HeatmapDto } from 'imx-api-qer';
import { HeatmapSidesheetComponent } from '../../heatmaps/heatmap-sidesheet/heatmap-sidesheet.component';
import { ChartsSidesheetComponent } from '../../charts/charts-sidesheet/charts-sidesheet.component';
import { ChartInfoTyped } from '../chart-info-typed';
import { HeatmapInfoTyped } from '../heatmap-info-typed';
import { GenericStatisticEntity, GenericSummaryEntity, StatisticsDataService } from '../statistics-data.service';
import { StatisticsChartHandlerService } from '../../charts/statistics-chart-handler.service';
import { ChartTableService } from '../../charts/chart-table/chart-table-service.service';
import { TypedEntityCollectionData } from 'imx-qbm-dbts';
import { ChartDataTyped } from '../../charts/chart-data-typed';
import { StatisticsApiService } from '../../statistics-api.service';
import { PointStatTyped } from '../../charts/chart-tile/point-stat-visual/point-stat-typed';
import { ChartDetails } from '../../charts/chart-tile/chart-details';


export interface DetailedChartInfo {
  chartData: ChartDto;
  tableData: TypedEntityCollectionData<ChartDataTyped>;
  chartOptions: ChartOptions;
}

export interface StatisticsSidesheetResponse {
  isFavorite: boolean;
  isOrg: boolean;
}

@Component({
  selector: 'imx-statistics-cards-visuals',
  templateUrl: './statistics-cards-visuals.component.html',
  styleUrls: ['./statistics-cards-visuals.component.scss'],
})
export class StatisticsCardsVisualsComponent implements OnInit, OnDestroy {
  @ViewChild('visual', { read: ElementRef, static: true }) public visualWrapper: ElementRef<HTMLElement>;

  @Input() public stat: GenericStatisticEntity;

  public id: string;
  public cacheId: string;
  public summaryStat: GenericSummaryEntity;
  public chartOptions: ChartOptions;
  public chartDetails: ChartDetails;

  // Booleans that control display
  public changingFavorite = false;
  public changingOrg = false;

  // Constants for chart type, default is the point statistic
  public pointStatStatus: PointStatTyped;

  private subscriptons$: Subscription[] = [];

  constructor(
    private statisticsApi: StatisticsApiService,
    private dataService: StatisticsDataService,
    private tableService: ChartTableService,
    private chartHandler: StatisticsChartHandlerService,
    private sidesheetService: EuiSidesheetService,
    private loader: EuiLoadingService
  ) {}

  public get isFavorite(): boolean {
    return this.stat.GetEntity().GetColumn('IsFavorite').GetValue();
  }

  public get isOrg(): boolean {
    return this.stat.GetEntity().GetColumn('IsOrg').GetValue();
  }

  public get isUserAdmin(): boolean {
    return this.dataService.isUserAdmin;
  }

  public get isLoading(): boolean {
    return !this.summaryStat;
  }

  public get isDisabled(): boolean {
    return this.isLoading || !this.hasData;
  }

  public get hasData(): boolean {
    if (this.isHeatmap(this.stat)) {
      return true;
    }
    if (this.isChart(this.stat)) {
      const stat = this.summaryStat as ChartDto;
      // Check if we have data
      return stat?.Data && stat.Data.length > 0;
      }
    }

  public ngOnInit(): void {
    // Attempt to get cached results, otherwise subscribe to get them
    this.id = this.dataService.getId(this.stat);
    this.summaryStat = this.dataService.getSummaryStat(this.id);

    if (this.summaryStat) {
      return;
    }

    this.subscriptons$.push(
      this.dataService.summaryStats$[this.id].subscribe((summaryStat) => {
        this.summaryStat = summaryStat;
        this.dataService.cacheSummaryStat(this.id, summaryStat);
      })
    );
  }

  public ngOnDestroy(): void {
    this.subscriptons$.forEach((sub) => sub.unsubscribe());
    delete this.dataService.cachedCharts[this.cacheId];
  }


  public isHeatmap(stat: GenericStatisticEntity): stat is HeatmapInfoTyped {
    return stat instanceof HeatmapInfoTyped;
  }

  public isChart(stat: GenericStatisticEntity): stat is ChartInfoTyped {
    return stat instanceof ChartInfoTyped;
  }

  public async handleFavorite(): Promise<void> {
    this.changingFavorite = true;
    try {
      // Tricky - since the change hasn't changed in the data yet, we have to invert the logic.
      // If favorite => we are currently a favorite and we are clicking to remove
      if (this.isFavorite) {
        await this.dataService.removeFromFavorites([this.id]);
      } else {
        await this.dataService.addToFavorites([this.id]);
      }
    } finally {
      this.changingFavorite = false;
    }
  }

  public async handleOrg(): Promise<void> {
    this.changingOrg = true;
    try {
      // Tricky - since the change hasn't changed in the data yet, we have to invert the logic.
      // If org => we are currently a org stat and we are clicking to remove
      if (this.isOrg) {
        await this.dataService.removeFromOrg([this.id]);
      } else {
        await this.dataService.addToOrg([this.id]);
      }
    } finally {
      this.changingOrg = false;
    }
  }

  public async handleToggle(statsToggle: StatisticsSidesheetResponse): Promise<void> {
    const changeOrg = statsToggle.isOrg !== this.isOrg;
    const changeFavorite = statsToggle.isFavorite !== this.isFavorite;
    switch (true) {
      case changeOrg && changeFavorite:
        // Do both at the same time
        await Promise.all([this.handleFavorite(), this.handleOrg()]);
        break;
      case changeOrg:
        await this.handleOrg();
        break;
      case changeFavorite:
        await this.handleFavorite();
        break;
    }
  }

  public async openStatistic(): Promise<void> {
    if (this.isDisabled) {
      // Prevent any further click progression
      return;
    }
    if (this.isHeatmap(this.stat)) {
      await this.openHeatmap(this.stat);
    }
    if (this.isChart(this.stat)) {
      await this.openChart(this.stat);
    }
  }

  public async openHeatmap(heatmapInfo: HeatmapInfoTyped): Promise<void> {
    this.loader.show();
    let heatmap: HeatmapDto;
    try {
      heatmap = await this.statisticsApi.getHeatmap(heatmapInfo.GetEntity().GetColumn('Id').GetValue());
    } finally {
      this.loader.hide();
    }
    const response: StatisticsSidesheetResponse | null = await this.sidesheetService
      .open(HeatmapSidesheetComponent, {
        title: heatmapInfo.GetEntity().GetDisplay(),
        subTitle: heatmapInfo.GetEntity().GetColumn('Description').GetValue(),
        icon: 'partition',
        padding: '0px',
        width: '90%',
        testId: 'statistics-heatmap-sidesheet',
        data: {
          heatmapInfo,
          heatmap,
          isFavorite: this.isFavorite,
          isOrg: this.isOrg,
          isUserAdmin: this.isUserAdmin,
        },
      })
      .afterClosed()
      .toPromise();
    if (response) {
      await this.handleToggle(response);
    }
  }

  public async openChart(chartInfo: ChartInfoTyped): Promise<void> {
    this.loader.show();
    let detailedInfo: DetailedChartInfo;
    try {
      detailedInfo = await this.getChartOptionsWithHistory(chartInfo);
    } finally {
      this.loader.hide();
    }
    const response: StatisticsSidesheetResponse | null = await this.sidesheetService
      .open(ChartsSidesheetComponent, {
        title: chartInfo.GetEntity().GetDisplay(),
        subTitle: !!this.chartDetails?.pointStatus ? '' : chartInfo.GetEntity().GetColumn('Description').GetValue(),
        icon: this.chartDetails.icon,
        padding: '0px',
        width: '60%',
        testId: 'statistics-chart-sidesheet',
        data: {
          chartInfo,
          ...detailedInfo,
          hasUniqueObjectDisplay: this.chartDetails.hasUniqueObjectDisplay,
          dataHasNonZero: this.chartDetails.dataHasNonZero,
          pointStatStatus: this.chartDetails?.pointStatus,
          isFavorite: this.isFavorite,
          isOrg: this.isOrg,
          isUserAdmin: this.isUserAdmin,
        },
      })
      .afterClosed()
      .toPromise();
    if (response) {
      await this.handleToggle(response);
    }
  }

  public async getChartOptionsWithHistory(chartInfo: ChartInfoTyped): Promise<DetailedChartInfo> {
    const chartData = await this.statisticsApi.getChart(chartInfo.GetEntity().GetColumn('Id').GetValue());
    const tableData = this.tableService.getDataSource(chartData.Data);
    let chartOptions: ChartOptions;
    switch (true) {
      case !!this.chartDetails?.pointStatus:
        chartOptions = this.chartHandler.getLineData(chartData, {
          dataLimit: 1,
          nXTicks: 10,
          enableZoom: true
        });
        break;
      case this.chartDetails.type === donut():
        chartOptions = this.chartHandler.getPieData(chartData, {
          dataLimit: 10,
        });
        break;
      case this.chartDetails.type === bar():
        chartOptions = this.chartHandler.getBarData(chartData, {
          dataLimit: 10,
          hasUniqueObjectDisplay: this.chartDetails.hasUniqueObjectDisplay,
        });
        break;
      case this.chartDetails.type === line():
        chartOptions = this.chartHandler.getLineData(chartData, {
          dataLimit: 10,
          pointLimit: 20,
          enableZoom: true
        });
        break;
    }
    return {
      chartData,
      tableData,
      chartOptions,
    };
  }

  public getDetails(chartDetails: ChartDetails): void {
    this.chartDetails = chartDetails;
  }

  public cacheChart(chart: Chart): void {
    this.cacheId = this.id.slice();
    let suffix = 0;
    while (this.dataService.cachedCharts[this.cacheId]) {
      // We don't know how many possible name collisions we have, but its likely 2
      suffix += 1;
      this.cacheId = this.id.slice() + suffix.toString();
    }
    this.dataService.cachedCharts[this.cacheId] = {
      chart,
    };
  }
}
