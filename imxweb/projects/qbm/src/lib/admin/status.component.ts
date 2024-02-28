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

import { Component, OnDestroy, OnInit, Input } from '@angular/core';
import { ChartOptions } from 'billboard.js';
import { ImxConfig, MethodSetInfo, PingResult, SystemInfo, UpdaterState, V2ApiClientMethodFactory } from 'imx-api-qbm';
import { Observable, interval } from 'rxjs';
import { AppConfigService } from '../appConfig/appConfig.service';
import { LineChartOptions } from '../chart-options/line-chart-options';
import { SeriesInformation } from '../chart-options/series-information';
import { XAxisInformation } from '../chart-options/x-axis-information';
import { YAxisInformation } from '../chart-options/y-axis-information';
import { ClassloggerService } from '../classlogger/classlogger.service';
import { SystemInfoService } from '../system-info/system-info.service';
import { ImxTranslationProviderService } from '../translation/imx-translation-provider.service';
import { StatusService } from './status.service';
import { SideNavigationComponent } from '../side-navigation-view/side-navigation-view-interfaces';

export class StatusInfo {
  date?: string;
  sessions?: number;
}
export class StatusInfo2 {
  date?: string[];
  sessions?: number[];
}
export class StatusBuffer {
  private len: number;
  private buffer: StatusInfo[];
  private data: number[][];
  private pos: number;
  private labels: any = [];

  constructor(len: number) {
    const buffer = new Array<StatusInfo>(len);

    this.len = len;
    this.buffer = buffer;
    this.pos = 0;

    this.labels = new Array<string>(len);
    this.data = new Array<number[]>(1);

    for (let i = 0; i < 1; i++) {
      this.data[i] = new Array<number>(len);
    }
  }

  public push(info: StatusInfo) {
    this.buffer[this.pos] = info;
    this.pos++;
    if (this.pos >= this.len) this.pos = 0;
  }

  buildLabels(): string[] {
    this.forEach((i, s) => (this.labels[i] = s.date));
    return this.labels;
  }

  buildData(): number[][] {
    this.forEach((i, s) => {
      this.data[0][i] = s.sessions ?? 0;
    });
    return this.data;
  }

  private forEach(fn: (arg0: number, arg1: StatusInfo) => void) {
    let pos = 0;

    for (let i = this.pos; i < this.len; i++) {
      const data = this.buffer[i];
      if (data) fn(pos++, data);
    }

    for (let i = 0; i < this.pos; i++) {
      const data = this.buffer[i];
      if (data) fn(pos++, data);
    }
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
  @Input() public isAdmin: boolean;

  constructor(
    private readonly appConfigService: AppConfigService,
    private readonly systemInfoService: SystemInfoService,
    private readonly logger: ClassloggerService,
    private readonly translator: ImxTranslationProviderService,
    private statusService: StatusService
  ) {}

  pingResult: PingResult;
  apiProjects: MethodSetInfo[];
  updaterState: UpdaterState;
  systemInfo: SystemInfo;
  config: ImxConfig;
  dataReady: boolean;
  UpdateText: string;

  UpdaterState = UpdaterState;
  stream: EventSource;

  statusData: {
    CacheHits: number;
    CacheMisses: number;
    OpenSessions: number;
    TotalSessions: number;
  };

  private buffer: StatusBuffer;
  public chartOptions: ChartOptions = null;
  public show: boolean;

  ngOnDestroy() {
    if (this.stream) this.stream.close();
  }

  async ngOnInit() {
    this.Reload();

    this.buffer = new StatusBuffer(120);
    const routine = interval(1000);
    await this.statusService.setUp(this.appConfigService.BaseUrl);
    routine.subscribe(async () => {
      (await this.getStatus()).subscribe((x) => {
        this.buffer?.push(x);
        this.updateChart();
      });
    });

    // set up status stream
    this.stream = new EventSource(this.appConfigService.BaseUrl + new V2ApiClientMethodFactory().admin_status_get().path, {
      withCredentials: true,
    });

    this.stream.onopen = () => {
      this.logger.debug(this, 'Status stream has been opened');
    };

    this.stream.onmessage = (evt) => {
      const changeData = JSON.parse(evt.data);
    };

    this.stream.onerror = (err) => {};
  }

  async Reload() {
    this.dataReady = false;

    this.UpdateText = await this.translator.Translate('#LDS#Installs updates and restarts the server.').toPromise();

    const client = this.appConfigService.client;
    this.pingResult = await client.imx_ping_get();
    this.systemInfo = await client.imx_system_get();
    this.apiProjects = await client.admin_projects_get();
    const s = await client.admin_systeminfo_software_status_get();
    this.config = await this.systemInfoService.getImxConfig();

    this.updaterState = s.Status;
    this.dataReady = true;
  }

  StartUpdate() {
    this.appConfigService.client.admin_systeminfo_software_update_post();
  }

  private async buildOptions(chart: StatusInfo2): Promise<void> {
    let seriesname = await this.translator.Translate('#LDS#Active sessions').toPromise();
    const yAxis = new YAxisInformation([
      new SeriesInformation(
        seriesname,
        chart.sessions.map((point: number) => point),
        'blue'
      ),
    ]);
    yAxis.tickConfiguration = {
      format: (l) => l.toString(),
    };
    const lineChartOptions = new LineChartOptions(
      new XAxisInformation(
        'string',
        chart.date.map((point: string) => point),
        { culling: { max: 5, lines: false }, fit: true, centered: true, autorotate: true, multiline: false }
      ),
      yAxis
    );
    lineChartOptions.useCurvedLines = false;
    lineChartOptions.hideLegend = false;
    lineChartOptions.showPoints = true;
    lineChartOptions.colorArea = false;
    lineChartOptions.padding = { top: 0, bottom: 25, left: 35, right: 20, unit: 'px' };
    this.chartOptions = lineChartOptions.options;
  }

  async getStatus(): Promise<Observable<StatusInfo>> {
    return new Observable((subscriber) => {
      let msg: StatusInfo = {
        sessions: this.statusService.getStatusSessionData(),
        date: new Date().toLocaleTimeString(),
      };
      subscriber.next(msg);
    });
  }

  forceChartRefresh() {
    this.show = false;
    setTimeout(() => {
      this.show = true;
    }, 0);
  }

  updateChart() {
    this.forceChartRefresh();
    const sessions = this.buffer.buildData();
    const dates = this.buffer.buildLabels();
    const session: StatusInfo2 = { sessions: sessions[0], date: dates };
    this.buildOptions(session);
  }
}
