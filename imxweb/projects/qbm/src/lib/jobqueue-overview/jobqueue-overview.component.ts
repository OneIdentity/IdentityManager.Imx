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

import { Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges} from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

import { ChartOptions, XTickConfiguration } from 'billboard.js';
import { interval, Subscription } from 'rxjs';
import { JobQueueDataSlice, JobQueueOverviewService } from './jobqueue-overview.service';
import { XAxisInformation } from '../chart-options/x-axis-information';
import { LineChartOptions } from '../chart-options/line-chart-options';
import { YAxisInformation } from '../chart-options/y-axis-information';
import { SeriesInformation } from '../chart-options/series-information';

@Component({
  selector: 'imx-jobqueue-overview',
  templateUrl: './jobqueue-overview.component.html',
  styleUrls: ['./jobqueue-overview.component.scss'],
})
export class JobQueueOverviewComponent implements OnInit, OnDestroy, OnChanges {
  @Input() public isShowGraph: boolean;
  public chartOptions: ChartOptions = null;
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

  private xAxisConfig: XTickConfiguration = {
    culling: { max: 5 },
    format: '%H:%M:%S',
  };

  constructor(private readonly jobQueueOverviewService: JobQueueOverviewService, private translateService: TranslateService) {
    this.queueNames = this.jobQueueOverviewService.queueNames;
    this.translateService.get('#LDS#All queues').subscribe((trans: string) => (this.queue = trans));

    // Translate chart labels
    this.translateService.get('#LDS#Time').subscribe((trans: string) => (this.timeText = trans));
    this.translateService.get('#LDS#Error').subscribe((trans: string) => (this.errorText = trans));
    this.translateService.get('#LDS#Waiting').subscribe((trans: string) => (this.waitingText = trans));
    this.translateService.get('#LDS#Ready').subscribe((trans: string) => (this.readyText = trans));
    this.translateService.get('#LDS#Processing').subscribe((trans: string) => (this.processingText = trans));
    this.translateService.get('#LDS#Finished').subscribe((trans: string) => (this.finishedText = trans));

    this.translateService.get('#LDS#Number of processes').subscribe((trans: string) => (this.ylabel = trans));
    this.translateService.get('#LDS#Processes over time').subscribe((trans: string) => (this.title = trans));
  }

  public async ngOnInit(): Promise<void> {
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
      this.updatePlot();
    }
  }

  public updatePlot(): void {
    if (!this.isShowGraph) {
      // Don't do anything that isn't visible
      return;
    }

    const data = this.jobQueueOverviewService.getSlice(this.queue);

    if (data.Time.length > 0) {
      this.setData(data);
      this.chartOptions.onresize = () => this.setData(data);
    }
  }

  public setData(data: JobQueueDataSlice): void {
    // If there is actually data, show it
    const xAxis = new XAxisInformation('date', data.Time, this.xAxisConfig);
    const yAxis = new YAxisInformation([
      new SeriesInformation(this.errorText, data.Error, 'red'),
      new SeriesInformation(this.waitingText, data.Waiting, 'orange'),
      new SeriesInformation(this.readyText, data.Ready, 'blue'),
      new SeriesInformation(this.processingText, data.Processing, 'yellow'),
      new SeriesInformation(this.finishedText, data.Finished, 'green'),
    ]);
    yAxis.tickConfiguration = {
      format: (l) => (Number.isInteger(l) && l > -1 ? l.toString() : ''),
    };
    yAxis.min = 0;
    const lineChartOptions = new LineChartOptions(xAxis, yAxis);
    lineChartOptions.showPoints = true;
    lineChartOptions.hideLegend = false;
    lineChartOptions.colorArea = false;
    lineChartOptions.canZoom = true;
    lineChartOptions.padding = { left: 20, right: 20, unit: 'px' };
    this.chartOptions = lineChartOptions.options;
    this.chartOptions.size = this.getSize();
  }

  public removeOldSVG(): void {
    const svgElement = document.getElementsByClassName('bb')[0].firstChild;
    if (svgElement) {
      svgElement.remove();
    }
  }

  public getSize(): { height: number; width: number } {
    const graphCard = document.querySelector('.imx-billboard-card');
    const emptyCard = document.querySelector('.imx-empty-card');
    let divForSize: HTMLDivElement;
    if (graphCard) {
      // The graph is already displayed, use the current graph, remove previous svg first for resize problem
      this.removeOldSVG();
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
