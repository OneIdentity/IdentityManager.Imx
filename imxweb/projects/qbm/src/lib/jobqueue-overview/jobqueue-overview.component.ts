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
 * Copyright 2021 One Identity LLC.
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

import { Component, OnDestroy, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

import { ChartOptions, XTickConfiguration } from 'billboard.js';
import { interval, Subscription } from 'rxjs';
import { JobQueueOverviewService } from './jobqueue-overview.service';
import { XAxisInformation } from '../chart-options/x-axis-information';
import { LineChartOptions } from '../chart-options/line-chart-options';
import { YAxisInformation } from '../chart-options/y-axis-information';
import { SeriesInformation } from '../chart-options/series-information';

@Component({
  selector: 'imx-jobqueue-overview',
  templateUrl: './jobqueue-overview.component.html',
})
export class JobQueueOverviewComponent implements OnInit, OnDestroy {
  public chartOptions: ChartOptions = null;
  public routineSubscription: Subscription;

  public queueNames: string[] = this.jobQueueOverviewService.queueNames;
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
    format: '%H:%M:%S'
  };

  constructor(private readonly jobQueueOverviewService: JobQueueOverviewService, private translateService: TranslateService) {}

  public async ngOnInit(): Promise<void> {
    this.queue = await this.translateService.get('#LDS#All Queues').toPromise();

    // Translate chart labels
    this.timeText = await this.translateService.get('#LDS#Time').toPromise();
    this.errorText = await this.translateService.get('#LDS#Error').toPromise();
    this.waitingText = await this.translateService.get('#LDS#Waiting').toPromise();
    this.readyText = await this.translateService.get('#LDS#Ready').toPromise();
    this.processingText = await this.translateService.get('#LDS#Processing').toPromise();
    this.finishedText = await this.translateService.get('#LDS#Finished').toPromise();

    this.ylabel = await this.translateService.get('#LDS#Number of Jobs').toPromise();
    this.title = await this.translateService.get('#LDS#Jobs over Time').toPromise();

    // Setup service if it isn't already available
    if (!this.jobQueueOverviewService.isAvailable) {
      await this.jobQueueOverviewService.setUp();
    }

    // Setup an interval and subscribe
    const routine = interval(this.jobQueueOverviewService.samplingRate * 1000);
    this.routineSubscription = routine.subscribe(() => this.checkForData());
  }

  public checkForData(): void {
    if (this.jobQueueOverviewService.isAvailable) {
      this.chartOptions = this.updatePlot();
    }
  }

  public updatePlot(): ChartOptions {
    const data = this.jobQueueOverviewService.getSlice(this.queue);
    const xAxis = new XAxisInformation('date', data.Time, this.xAxisConfig);
    const yAxis = new YAxisInformation([
      new SeriesInformation(this.errorText, data.Error, 'red'),
      new SeriesInformation(this.waitingText, data.Waiting, 'orange'),
      new SeriesInformation(this.readyText, data.Ready, 'blue'),
      new SeriesInformation(this.processingText, data.Processing, 'yellow'),
      new SeriesInformation(this.finishedText, data.Finished, 'green'),
    ]);
    yAxis.tickConfiguration = {
      format: (l) => (Number.isInteger(l) ? l.toString() : ''),
    };
    yAxis.min = 0;
    const lineChartOptions = new LineChartOptions(xAxis, yAxis);
    lineChartOptions.showPoints = true;
    lineChartOptions.hideLegend = false;
    lineChartOptions.colorArea = false;
    lineChartOptions.canZoom = false;
    // TODO: Add padding to x axis for date-time axis. This needs billboard 3.1

    return lineChartOptions.options;
  }

  public ngOnDestroy(): void {
    this.routineSubscription.unsubscribe();
  }
}
