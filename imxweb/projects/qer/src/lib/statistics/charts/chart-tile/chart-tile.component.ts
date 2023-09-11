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

import { Component, EventEmitter, Input, OnInit, Output, ElementRef } from '@angular/core';
import { bar, Chart, ChartOptions, donut, line } from 'billboard.js';
import { ChartDto } from 'imx-api-qer';
import { StatisticsChartHandlerService } from '../statistics-chart-handler.service';
import { ChartDetails } from './chart-details';
import { PointStatTyped } from './point-stat-visual/point-stat-typed';
import { PointStatVisualService } from './point-stat-visual/point-stat-visual.service';

@Component({
  selector: 'imx-chart-tile',
  templateUrl: './chart-tile.component.html',
  styleUrls: ['./chart-tile.component.scss']
})
export class ChartTileComponent implements OnInit {
  @Input() public summaryStat: ChartDto;

  @Output() chart = new EventEmitter<Chart>();
  @Output() chartDetails = new EventEmitter<ChartDetails>();

  public chartOptions: ChartOptions;
  public dataHasNonZero: boolean;
  public pointStatStatus: PointStatTyped;
  public hasUniqueObjectDisplay: boolean;
  public smallCutoff = 10;

  constructor(
    private chartHandler: StatisticsChartHandlerService,
    private pointStatService: PointStatVisualService,
    private elementRef: ElementRef<HTMLElement>
  ) { }

  public get isPoint(): boolean {
    return !!this.pointStatStatus
  }

  public ngOnInit(): void {
    this.determinePlot();
    this.chartDetails.emit({
      type: this.chartOptions?.data?.type,
      pointStatus: this.pointStatStatus,
      hasUniqueObjectDisplay: this.hasUniqueObjectDisplay,
      dataHasNonZero: this.dataHasNonZero,
      icon: this.determineIcon()
    });
  }

  public cacheChart(chart: Chart): void {
    this.chart.emit(chart);
  }

  public isSmallButNot1(x: number): boolean {
    return x > 1 && x < this.smallCutoff;
  }

  public determinePlot(): void {
    // Point stat: History > 0, Data = 1 OR History > 0, Data = 1, Points = !small but not 1
    if (this.summaryStat.Data.length === 1 && !this.isSmallButNot1(this.summaryStat.Data[0].Points.length)) {
      this.pointStatStatus = this.pointStatService.extractStatus(this.summaryStat);
      return;
    }
    // Check if any of the remaining plots have uninteresting plots
    this.dataHasNonZero = this.chartHandler.dataHasNonZero(this.summaryStat);
    // Bar chart: History = 0, Data > 1
    if (this.summaryStat.HistoryLength === 0 && this.summaryStat.Data.length > 1) {

      this.hasUniqueObjectDisplay = this.chartHandler.hasUniqueObjectDisplay(this.summaryStat.Data)
      this.chartOptions = this.chartHandler.getBarData(this.summaryStat, {
        dataLimit: 5,
        size: {
          height: this.elementRef.nativeElement.parentElement.offsetTop,
          width: this.elementRef.nativeElement.parentElement.offsetLeft,
        },
        hasUniqueObjectDisplay: this.hasUniqueObjectDisplay,
      });
      return;
    }
    // Pie chart: History = 0, Data > 1
    if (this.summaryStat.HistoryLength > 0 && this.summaryStat.Data.length > 1) {
      this.chartOptions = this.chartHandler.getPieData(this.summaryStat, {
        dataLimit: 5,
        size: {
          height: this.elementRef.nativeElement.parentElement.offsetTop,
          width: this.elementRef.nativeElement.parentElement.offsetLeft,
        },
      });
      return;
    }
    // Line chart: History > 0, Data = 1, Points ~ small but not 1
    if (this.summaryStat.HistoryLength > 0 && this.summaryStat.Data.length === 1 && this.isSmallButNot1(this.summaryStat.Data[0].Points.length)) {
      this.chartOptions = this.chartHandler.getLineData(this.summaryStat, {
        dataLimit: 5,
        pointLimit: 10,
        size: {
          height: this.elementRef.nativeElement.parentElement.offsetTop,
          width: this.elementRef.nativeElement.parentElement.offsetLeft,
        },
      });
      return;
    }
  }

  public determineIcon(): string | null {
    switch (true) {
      case !!this.pointStatStatus:
        return 'arrowsvertical';
      case this.chartOptions?.data?.type === donut():
        return 'piechart';
      case this.chartOptions?.data?.type === bar():
        return 'barchart';
      case this.chartOptions?.data?.type === line():
        return 'linechart';
      default:
        return null;
    }
  }

}
