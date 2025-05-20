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

import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { ImxConfig, MethodSetInfo, PingResult, SystemInfo, UpdaterState, V2ApiClientMethodFactory } from '@imx-modules/imx-api-qbm';
import { TranslateService } from '@ngx-translate/core';
import { Chart, ChartOptions } from 'billboard.js';
import { Observable, Subscription, interval } from 'rxjs';
import { AppConfigService } from '../appConfig/appConfig.service';
import { LineChartOptions } from '../chart-options/line-chart-options';
import { SeriesInformation } from '../chart-options/series-information';
import { XAxisInformation } from '../chart-options/x-axis-information';
import { YAxisInformation } from '../chart-options/y-axis-information';
import { ClassloggerService } from '../classlogger/classlogger.service';
import { SideNavigationComponent } from '../side-navigation-view/side-navigation-view-interfaces';
import { SnackBarService } from '../snackbar/snack-bar.service';
import { SystemInfoService } from '../system-info/system-info.service';
import { StatusService } from './status.service';

class StatusInfo {
  date?: string;
  sessions?: number;
}

class StatusBuffer {
  private buffer: StatusInfo[] = [];

  constructor(private len: number) {}

  public push(info: StatusInfo) {
    this.buffer.push(info);
    if (this.buffer.length >= this.len) {
      this.buffer.shift();
    }
  }

  public buildLabels(): string[] {
    const dates = this.buffer.filter((elem) => !!elem.sessions).map((elem) => elem.date!);
    dates.unshift('x');
    return dates;
  }

  public buildData(caption: string): any[] {
    const data: (string | number)[] = this.buffer.filter((elem) => !!elem.sessions).map((elem) => elem.sessions!);
    data.unshift(caption);
    return data;
  }
}

@Component({
  selector: 'imx-status',
  templateUrl: './status.component.html',
  styleUrls: ['./shared.scss'],
  host: {
    '[class.loading]': '!dataReady',
  },
})
export class StatusComponent implements OnInit, OnDestroy, SideNavigationComponent {
  @Input() isAdmin: boolean;

  public pingResult: PingResult;
  public apiProjects: MethodSetInfo[];
  public updaterState: UpdaterState;
  public systemInfo: SystemInfo;
  public config: ImxConfig;
  public dataReady: boolean;
  public UpdateText: string;

  public UpdaterState = UpdaterState;
  public stream: EventSource;

  private chart: Chart;
  private seriesName: string = '';

  public statusData: {
    CacheHits: number;
    CacheMisses: number;
    OpenSessions: number;
    TotalSessions: number;
  };

  private buffer: StatusBuffer;
  public chartOptions: ChartOptions | null = null;
  public updatesStarted = false;
  private routine: Subscription;

  constructor(
    private readonly appConfigService: AppConfigService,
    private readonly systemInfoService: SystemInfoService,
    private readonly logger: ClassloggerService,
    private readonly translator: TranslateService,
    private statusService: StatusService,
    private readonly snackbar: SnackBarService,
  ) {
    this.routine = interval(1000).subscribe(async () => {
      await this.reloadChart();
    });
  }

  public ngOnDestroy() {
    if (this.stream) this.stream.close();
    this.routine.unsubscribe();
  }

  public async ngOnInit() {
    this.seriesName = this.translator.instant('#LDS#Active sessions');
    this.Reload();

    this.buffer = new StatusBuffer(120);
    await this.statusService.setUp(this.appConfigService.BaseUrl);

    // set up status stream
    this.stream = new EventSource(this.appConfigService.BaseUrl + new V2ApiClientMethodFactory().admin_status_get().path, {
      withCredentials: true,
    });

    this.stream.onopen = () => {
      this.logger.debug(this, 'Status stream has been opened');
    };

    await this.buildOptions();

    await this.reloadChart();
  }

  public onChart(chart: Chart) {
    this.chart = chart;
  }

  public async Reload() {
    this.dataReady = false;

    this.UpdateText = this.translator.instant('#LDS#Installs updates and restarts the server.');

    const client = this.appConfigService.client;
    this.pingResult = await client.imx_ping_get();
    this.systemInfo = await this.systemInfoService.get();
    this.apiProjects = await client.admin_projects_get();
    const s = await client.admin_systeminfo_software_status_get();
    this.config = await this.systemInfoService.getImxConfig();

    this.updaterState = s.Status;
    this.dataReady = true;
  }

  public async StartUpdate() {
    await this.appConfigService.client.admin_systeminfo_software_update_post();
    const key =
      '#LDS#The installation of the updates has started successfully. The application will automatically restart after the updates are installed.';
    this.snackbar.open({ key });
    this.updatesStarted = true;
  }

  private async reloadChart() {
    (await this.getStatus()).subscribe((x) => {
      this.buffer?.push(x);
      this.updateChart();
    });
  }

  private async buildOptions(): Promise<void> {
    const yAxis = new YAxisInformation([new SeriesInformation(this.seriesName, [], 'blue')]);
    yAxis.tickConfiguration = {
      format: (l) => l.toString(),
    };
    const lineChartOptions = new LineChartOptions(
      new XAxisInformation('string', [], {
        culling: { max: 5, lines: false },
        fit: true,
        centered: true,
        autorotate: true,
        multiline: false,
      }),
      yAxis,
    );
    lineChartOptions.useCurvedLines = false;
    lineChartOptions.hideLegend = false;
    lineChartOptions.showPoints = true;
    lineChartOptions.colorArea = false;
    lineChartOptions.padding = { top: 0, bottom: 25, left: 35, right: 20, unit: 'px' };
    this.chartOptions = lineChartOptions.options;
  }

  private async getStatus(): Promise<Observable<StatusInfo>> {
    return new Observable((subscriber) => {
      let msg: StatusInfo = {
        sessions: this.statusService.getStatusSessionData(),
        date: new Date().toLocaleTimeString(),
      };
      subscriber.next(msg);
    });
  }

  private updateChart() {
    this.chart?.load({ columns: [this.buffer.buildLabels(), this.buffer.buildData(this.seriesName)] });
  }
}
