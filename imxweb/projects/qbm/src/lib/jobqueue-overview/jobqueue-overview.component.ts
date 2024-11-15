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
 * Copyright 2024 One Identity LLC.
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

import { ChangeDetectorRef, Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

import { Chart, ChartOptions, XTickConfiguration } from 'billboard.js';
import { interval, Subscription } from 'rxjs';
import { LineChartOptions } from '../chart-options/line-chart-options';
import { SeriesInformation } from '../chart-options/series-information';
import { XAxisInformation } from '../chart-options/x-axis-information';
import { YAxisInformation } from '../chart-options/y-axis-information';
import { JobQueueOverviewService } from './jobqueue-overview.service';

@Component({
  selector: 'imx-jobqueue-overview',
  templateUrl: './jobqueue-overview.component.html',
  styleUrls: ['./jobqueue-overview.component.scss'],
})
export class JobQueueOverviewComponent implements OnInit, OnDestroy, OnChanges {
  @Input() public isShowGraph: boolean;
  public chartOptions: ChartOptions | null = null;
  public routineSubscription: Subscription;

  public queueNames: string[];
  public queue: string;

  // Chart labels
  public timeText: string;
  public errorText: string;
  public waitingText: string;
  public readyText: string;
  public processingText: string;
  public finishedText: string;

  public xlabel: string;
  public ylabel: string;
  public title: string;

  private chart: Chart;

  private xAxisConfig: XTickConfiguration = {
    culling: { max: 5 },
    format: '%H:%M:%S',
  };

  constructor(
    private readonly jobQueueOverviewService: JobQueueOverviewService,
    private translateService: TranslateService,
    private changeDetectorRef: ChangeDetectorRef,
  ) {
    this.queueNames = this.jobQueueOverviewService.queueNames;
    this.queue = translateService.instant('#LDS#All queues');

    // Translate chart labels

    this.timeText = translateService.instant('#LDS#Time');
    this.errorText = translateService.instant('#LDS#Error');
    this.waitingText = translateService.instant('#LDS#Waiting');
    this.readyText = translateService.instant('#LDS#Ready');
    this.processingText = translateService.instant('#LDS#Processing');
    this.finishedText = translateService.instant('#LDS#Finished');

    this.ylabel = translateService.instant('#LDS#Number of processes');
    this.title = translateService.instant('#LDS#Processes over time');
  }

  public async ngOnInit(): Promise<void> {
    this.buildOptions();
    // Setup service if it isn't already available
    if (!this.jobQueueOverviewService.isAvailable) {
      await this.jobQueueOverviewService.setUp();
      await this.jobQueueOverviewService.isAvailablePromise;
    }

    // Setup an interval and subscribe
    const routine = interval(this.jobQueueOverviewService.configParams.RefreshIntervalSeconds * 1000);
    this.routineSubscription = routine.subscribe(() => this.updatePlot());
  }

  public ngOnChanges(changes: SimpleChanges): void {
    if (changes['isShowGraph']) {
      this.changeDetectorRef.detectChanges();
      this.chart?.resize(this.getSize());
    }
  }

  public onChart(chart: Chart) {
    this.chart = chart;
  }

  public updatePlot(): void {
    if (!this.isShowGraph) {
      // Don't do anything that isn't visible
      return;
    }

    const data = this.jobQueueOverviewService.getSlice(this.queue);
    const dateArray: any[] = data.Time ? [...data.Time] : [];
    const errorArray: any[] = data.Error ? [...data.Error] : [];
    const waitingArray: any[] = data.Waiting ? [...data.Waiting] : [];
    const readyArray: any[] = data.Ready ? [...data.Ready] : [];
    const processingArray: any[] = data.Processing ? [...data.Processing] : [];
    const finishArray: any[] = data.Finished ? [...data.Finished] : [];

    //add data ID as first element in arrays
    dateArray.unshift('x');
    errorArray.unshift(this.errorText);
    waitingArray.unshift(this.waitingText);
    readyArray.unshift(this.readyText);
    processingArray.unshift(this.processingText);
    finishArray.unshift(this.finishedText);

    if (!!data.Time?.length) {
      this.chart?.load({
        resizeAfter: true,
        append: true,
        columns: [dateArray, errorArray, waitingArray, readyArray, processingArray, finishArray],
      });
    }
  }

  private buildOptions() {
    // If there is actually data, show it
    const xAxis = new XAxisInformation('date', [], this.xAxisConfig);
    const yAxis = new YAxisInformation([
      new SeriesInformation(this.errorText, [], 'red'),
      new SeriesInformation(this.waitingText, [], 'orange'),
      new SeriesInformation(this.readyText, [], 'blue'),
      new SeriesInformation(this.processingText, [], 'violet'),
      new SeriesInformation(this.finishedText, [], 'green'),
    ]);
    yAxis.tickConfiguration = {
      format: (l) => (Number.isInteger(l) && l > -1 ? l.toString() : ''),
    };
    yAxis.min = -1;
    const lineChartOptions = new LineChartOptions(
      xAxis,
      yAxis,
      this.translateService.instant('#LDS#Currently, there is no data in any queues.'),
    );
    lineChartOptions.showPoints = true;
    lineChartOptions.hideLegend = false;
    lineChartOptions.colorArea = false;
    lineChartOptions.canZoom = true;
    lineChartOptions.padding = { left: 20, right: 20, unit: 'px' };
    this.chartOptions = lineChartOptions.options;
    if (this.chartOptions.data) {
      this.chartOptions.data.labels = { format: (v, id, i, j) => `${v}` };
    }
    this.chartOptions.size = { width: 0, height: 0 };
  }

  public getSize(): { height: number; width: number } {
    const graphCard = document.querySelector('.imx-card-fill');
    const emptyCard = document.querySelector('.imx-empty-card');
    let divForSize: HTMLDivElement;
    if (graphCard) {
      // The graph is already displayed, use the current graph, remove previous svg first for resize problem
      divForSize = graphCard as HTMLDivElement;
    } else {
      // We haven't yet rendered the graph, use the empty display instead
      divForSize = emptyCard as HTMLDivElement;
    }
    // padding on card is 16px on each side, subtract off what we will display
    return {
      height: divForSize.offsetHeight - 32,
      width: divForSize.offsetWidth - 32,
    };
  }

  public ngOnDestroy(): void {
    if (this.routineSubscription) {
      this.routineSubscription.unsubscribe();
    }
  }
}
