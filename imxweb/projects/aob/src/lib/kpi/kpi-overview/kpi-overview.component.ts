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

import { Component, OnChanges, Input, TemplateRef, ViewChild, SimpleChanges } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ChartOptions } from 'billboard.js';
import { TranslateService } from '@ngx-translate/core';

import { XAxisInformation, LineChartOptions, YAxisInformation, SeriesInformation, ClassloggerService, BusyService } from 'qbm';
import { ChartDto, PortalApplication, ChartDataPoint } from 'imx-api-aob';
import { KpiOverviewService } from './kpi-overview.service';

/**
 * A component, that displays key Performance Indicators (KPIs) for an application
 *
 * @example
 * <imx-kpi-overview [application]="application"></imx-kpi-overview>
 */
@Component({
  selector: 'imx-kpi-overview',
  templateUrl: './kpi-overview.component.html',
  styleUrls: ['./kpi-overview.component.scss'],
})
export class KpiOverviewComponent implements OnChanges {
  /**
   * @ignore internally used KPIs, that passes
   */
  public chartDataPass: ChartDto[];

  /**
   * @ignore internally used KPIs, that failed
   */
  public chartDataFail: ChartDto[];

  /**
   * @ignore columns for the mat-table that is shown, if a KPI has only one dataPoint
   */
  public displayedColumns: string[] = ['Date', 'Value', 'Threshold'];

  /**
   * The AobApplication, which KPI data should be displayed
   */
  @Input() public application: PortalApplication;

  /**
   * @ignore the template used for the datail Dialog
   */
  @ViewChild('chartdialog', { static: true }) public chartDialog: TemplateRef<any>;

  private errorThreshhold: string;

  public busyService = new BusyService();
  public isLoading = false;

  constructor(
    readonly translateService: TranslateService,
    private kpiOverviewProvider: KpiOverviewService,
    private logger: ClassloggerService,
    private matDialog: MatDialog
  ) {
    translateService.get('#LDS#Error threshold').subscribe((trans: string) => (this.errorThreshhold = trans));
    this.busyService.busyStateChanged.subscribe((elem) => (this.isLoading = elem));
  }

  /**
   * Displays a busyIndicator and initializes the data, when the OnChanges life cycle hook is called
   */
  public async ngOnChanges(changes: SimpleChanges): Promise<void> {

    if (changes.application?.currentValue?.UID_AOBApplication.value === changes.application?.previousValue?.UID_AOBApplication.value) {
      return;
    } 
    
    const isBusy = this.busyService.beginBusy();
    try {
      const data = await this.kpiOverviewProvider.get(this.application.UID_AOBApplication.value);
      if (data) {
        this.chartDataPass = data.filter((kpi) => kpi.Data.length > 0 && kpi.Data[0].Points[0].Value < kpi.ErrorThreshold);
        this.chartDataFail = data.filter((kpi) => kpi.Data.length > 0 && kpi.Data[0].Points[0].Value >= kpi.ErrorThreshold);
      } else {
        this.logger.error(this, 'ChartDto[] is undefined');
      }
    } finally {
      isBusy.endBusy();
    }
  }

  /**
   * @ignore Opens a dialog that shows the details of a KPI
   * @param chart the data of a single chart
   */
  public showDetails(chart: ChartDto, isFail: boolean): void {
    if (!this.hasDetails(chart)) { return; }
    this.matDialog.open(this.chartDialog, { data: { chart: this.getChartData(chart), failed: isFail }, width: '600px', autoFocus: false, panelClass: 'kpi-overview-modal' });
  }

  /**
   * @ignore determines whether a chart has detailed data
   * @param chart the data of a single chart
   */
  public hasDetails(chart: ChartDto): boolean {
    return chart.Data != null && chart.Data.length > 0;
  }

  /**
   * @ignore determines whether an application has chart data or not
   * @returns true, if there are failed or passed KPIs else it returns false
   */
  public hasKpis(): boolean {
    return (this.chartDataFail != null && this.chartDataFail.length > 0) || (this.chartDataPass != null && this.chartDataPass.length > 0);
  }

  /**
   * @ignore get an unified display for a date string
   * @param date a date string as represented in the chart
   * @returns the local date string for a date represented by an other string
   */
  public getDateDisplay(date: string): string {
    return new Date(date).toLocaleString(this.translateService.currentLang);
  }

  /**
   * @ignore determines whether a chart has more then one data point
   * @param chart the data of a single chart
   * @returns true, if the chart has multiple points else it return false
   */
  private hasMultipleDataPoints(chart: ChartDto): boolean {
    return this.hasDetails(chart) && chart.Data[0].Points.length > 1;
  }

  /**
   * @irgnore Builds an object, that could be passed to the detail dialog
   * @param chart the data of a single chart
   * @returns a dictionary, that can be display on the details dialog
   */
  private getChartData(chart: ChartDto): { [id: string]: any } {
    return { display: chart.Display, description: chart.Description, options: this.buildOptions(chart) };
  }

  /**
   * @ignore Build the ChartOptions that can be displayed with billboard.js
   * @param chart the data of a single chart
   * @returns a ChartOptions object, that can be used by billboard.js
   */
  private buildOptions(chart: ChartDto): ChartOptions {
    const yAxis = new YAxisInformation(
      chart.Data.map(
        (serie) =>
          new SeriesInformation(
            chart.Display,
            serie.Points.map((point: ChartDataPoint) => point.Value)
          )
      )
    );

    const browserCulture = this.translateService.currentLang;

    yAxis.tickConfiguration = { format: (d) => d.toLocaleString(browserCulture), values: this.accumulateTicks(chart) };

    const lineChartOptions = new LineChartOptions(
      new XAxisInformation(
        'date',
        chart.Data[0].Points.map((point: ChartDataPoint) => new Date(point.Date)),
        {
          count: 6,
          format: (d: Date) => d.toLocaleDateString(browserCulture),
        }
      ),
      yAxis
    );
    lineChartOptions.useCurvedLines = false;
    lineChartOptions.hideLegend = true;
    lineChartOptions.showPoints = !this.hasMultipleDataPoints(chart);
    lineChartOptions.additionalLines = [
      {
        value: chart.ErrorThreshold,
        text: this.errorThreshhold,
      },
    ];
    lineChartOptions.size = {
      height: 400,
      width: 500
    }
    this.logger.debug(this, 'Options', lineChartOptions.options);
    return lineChartOptions.options;
  }

  private accumulateTicks(chart: ChartDto): number[] {
    const ret = [];
    const max = Math.max.apply(
      Math,
      chart.Data[0].Points.map((o) => o.Value)
    );
    const steps = Math.max(1, Math.trunc(max / 10)) + 1;

    ret.push(0);
    if (max <= 0) {
      return ret;
    }

    for (let index = 1; index <= 10; index++) {
      ret.push(index * steps);
    }
    return ret;
  }
}
