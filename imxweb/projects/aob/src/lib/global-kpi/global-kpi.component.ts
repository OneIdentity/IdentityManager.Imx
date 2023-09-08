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

import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { EuiLoadingService } from '@elemental-ui/core';
import { OverlayRef } from '@angular/cdk/overlay';
import { MatDialog } from '@angular/material/dialog';
import { ChartOptions, pie } from 'billboard.js';
import { KeyValue } from '@angular/common';

import { ChartDto, ChartDataPoint } from 'imx-api-aob';
import { LineChartOptions, XAxisInformation, YAxisInformation, SeriesInformation, ClassloggerService } from 'qbm';
import { GlobalKpiService } from './global-kpi.service';
import { KpiData } from './kpi-data.interface';

@Component({
  selector: 'imx-global-kpi',
  templateUrl: './global-kpi.component.html',
  styleUrls: ['./global-kpi.component.scss']
})
/**
 * Builds a component, that displays global KPI data (key performance indicators)
 * Every KPI is displayed with its display value
 * Every KPI card has a "Details" Button, to show a detailed chart
 */
export class GlobalKpiComponent implements OnInit {
  public kpiData: KpiData[] = [];
  public browserCulture: string;

  /**
   * @ignore Only used with template
   */
  @ViewChild('chartdialog', { static: true }) public chartDialog: TemplateRef<any>;

  private noDataLoaded: string;
  private business: string;
  private central: string;
  private others: string;
  private readonly colors: string[] = ['#B4E6F4', '#82D5ED', '#50C4E6', '#2BB7E0',
    '#05AADB', '#04A3D7', '#0499D2', '#0390CD', '#017FC4'];

  constructor(
    private readonly logger: ClassloggerService,
    private kpiProvider: GlobalKpiService,
    private matDialog: MatDialog,
    private readonly busyService: EuiLoadingService,
    readonly translateService: TranslateService,
  ) {
    this.browserCulture = this.translateService.currentLang;

    translateService.get('#LDS#No data available')
      .subscribe((trans: string) => this.noDataLoaded = trans);
    translateService.get('#LDS#Used in business roles')
      .subscribe((trans: string) => this.business = trans);
    translateService.get('#LDS#Using central directory')
      .subscribe((trans: string) => this.central = trans);
    translateService.get('#LDS#Other')
      .subscribe((trans: string) => this.others = trans);
  }

  /**
   * Loads the chartDto objects and inits the component
   */
  public async ngOnInit(): Promise<void> {
    let overlayRef: OverlayRef;
    setTimeout(() => overlayRef = this.busyService.show());
    try {
      this.kpiData = (await this.kpiProvider.get())
        .map((elem, i) => this.buildKpiData(i, elem));
    } finally {
      setTimeout(() => this.busyService.hide(overlayRef));
    }
  }

  /**
   * @ignore opens a dialog that shows the details of a KPI
   * @param chart the data of a single chart
   */
  public showDetails(kpi: KpiData): void {
    if (kpi.chartData.Data.length === 0 ) { return; }
    kpi.chartDetails = this.buildLineOptions(kpi.chartData, kpi.pieChart != null, kpi.names);
    this.matDialog.open(this.chartDialog,
      { data: kpi, minWidth: 600, autoFocus: false });
  }

  /**
   * @ignore determines whether a chart has detailed data
   * @param chart the data of a single chart
   * @returns true, if the KPI has DataPoits also false
   */
  public isCalculated(chart: ChartDto): boolean {
    return chart.Data != null && chart.Data.length > 0 && chart.Data[0].Points != null;
 }

  /**
   * @ignore determines whether an application has chart data or not
   * @returns true, if there are any KPIs else false
   */
  public hasKpis(): boolean {
    return (this.kpiData != null && this.kpiData.length > 0 && this.kpiData.some(elem => elem != null));
  }

  private buildKpiData(chartIndex: number, chart: ChartDto): KpiData {
    const calc = this.isCalculated(chart);

    if (!calc) {
      return { index: chartIndex, chartData: chart, calculated: false, names : [] };
    }

    let currentData: number = null;
    let pieOptions: ChartOptions = null;
    let captions: string[];

    switch (chartIndex) {
      case 0:
      case 1:
      case 2:
      case 3:
      case 7:
      case 8:
        currentData = chart.Data[0].Points[0].Value;
        captions = chart.Data.map(ch => ch.Name);
        break;
      case 4:
        pieOptions = this.buildSingleValueChart(chart, this.central);
        captions = [this.central];
        break;
      case 6:
        pieOptions = this.buildSingleValueChart(chart, this.business);
        captions = [this.central];
        break;
      case 5:
        pieOptions = this.buildPieChart(chart);
        captions = chart.Data.map(ch => ch.Name);
        break;
    }

    return { index: chartIndex, chartData: chart, calculated: calc, names: captions, currentDataValue: currentData, pieChart: pieOptions };
  }

  private buildSingleValueChart(chart: ChartDto, name: string): ChartOptions {
    if (!this.isCalculated(chart)) {
      this.logger.debug(this, 'The chart is not calculated yet, therefore no chart is build');
      return undefined;
    }

    return {
      size: { width: 271, height: 271 },
      data: {
        columns: [['data1', chart.Data[0].Points[0].Value],
        ['data2', 100 - chart.Data[0].Points[0].Value]],
        names: { data1: name, data2: this.others },
        colors: { data1: this.colors[0], data2: '#CCC' },
        type: pie(),
        empty: {
          label: {
            text: this.noDataLoaded
          }
        }
      }, pie: {
        padAngle: 0.01,
        label: {
          format: d => `${d.toLocaleString(this.browserCulture,
             { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%`,
          threshold: 0.06
        },
      }
    };
  }

  private buildPieChart(chart: ChartDto): ChartOptions {
    if (!this.isCalculated(chart)) {
      this.logger.debug(this, 'The chart is not calculated yet, therefore no chart is build');
      return undefined;
    }

    return {
      size: { width: 271, height: 271 },
      data: {
        columns: chart.Data.map((ch, index) => ['data' + index, ch.Points[0].Value]) as any[],
        names: this.toObject(chart.Data.map((ch, index) => ({ key: 'data' + index, value: ch.Name }))),
        colors: this.toObject(chart.Data.map((ch, index) => ({ key: 'data' + index, value: this.colors[index] }))),
        type: pie(),
        empty: {
          label: {
            text: this.noDataLoaded
          }
        }
      }, pie: {
        padAngle: 0.01,
        label: {
          format: d => `${d.toLocaleString(this.browserCulture,
             { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%`,
          threshold: 0.06
        },
      }
    };
  }

  /**
   * @ignore converts an array of string arrays to an object ( first strign is the property name
   * second string the value)
   * @param array an array of string arrays
   *
   */
  private toObject(array: KeyValue<string, string>[]): { [key: string]: string } {
    const ret = {};

    for (const elem of array) {
      ret[elem.key] = elem.value;
    }
    return ret;

  }

  /**
   * @ignore determines whether a chart has more then one data point
   * @param chart the data of a single chart
   * @returns true, if the chart has multiple points else it return false
   */
  private hasMultipleDataPoints(chart: ChartDto): boolean {
    return this.isCalculated(chart) && chart.Data[0].Points.length > 1;
  }

  /**
   * @ignore Build the ChartOptions that can be displayed with billboard.js
   * @param chart the data of a single chart
   * @returns a ChartOptions object, that can be used by billboard.js
   */
  private buildLineOptions(chart: ChartDto, isPercentage: boolean, names: string[]): ChartOptions {
    const yAxis = new YAxisInformation(chart.Data.map((serie, id) =>
      new SeriesInformation(names[id],
        serie.Points.map((point: ChartDataPoint) => point.Value),
        this.colors[id]
      )));

    yAxis.tickConfiguration = {
      format: (d) => isPercentage ? `${d.toLocaleString(this.browserCulture)}%` : `${d.toLocaleString(this.browserCulture)}`,
      values: this.accumulateTicks(chart)
    };

    const lineChartOptions = new LineChartOptions(
      new XAxisInformation('date',
        chart.Data[0].Points.map((point: ChartDataPoint) => new Date(point.Date)), {
        count: 6,
        format: (d: Date) => d.toLocaleDateString(this.browserCulture)
      }),
      yAxis
    );
    lineChartOptions.useCurvedLines = false;
    lineChartOptions.hideLegend = chart.Data.length === 1;
    lineChartOptions.showPoints = !this.hasMultipleDataPoints(chart);
    lineChartOptions.size = { width: 500, height: 325 };
    return lineChartOptions.options;
  }

  private accumulateTicks(chart: ChartDto): number[] {
    const ret = [];
    const max = Math.max.apply(Math, chart.Data.map(o => this.getMax(o.Points)));
    const steps = Math.max(1, Math.trunc(max / 10)) + 1;

    ret.push(0);
    if (max <= 0) { return ret; }

    for (let index = 1; index <= 10; index++) {
      ret.push(index * steps);
    }
    return ret;
  }

  private getMax(points: ChartDataPoint[]): number {
    return Math.max.apply(Math, points.map(o => o.Value));
  }
}
