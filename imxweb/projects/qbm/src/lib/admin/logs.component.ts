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

import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { EuiDownloadOptions, EuiLoadingService, EuiSidesheetConfig, EuiSidesheetService } from '@elemental-ui/core';
import { ApiLogEntry, LogFileInfo, V2ApiClientMethodFactory } from '@imx-modules/imx-api-qbm';
import { FilterData, MethodDefinition, ValType } from '@imx-modules/imx-qbm-dbts';
import { TranslateService } from '@ngx-translate/core';
import moment from 'moment-timezone';
import { AppConfigService } from '../appConfig/appConfig.service';
import { calculateSidesheetWidth } from '../base/sidesheet-helper';
import { ClassloggerService } from '../classlogger/classlogger.service';
import { ElementalUiConfigService } from '../configuration/elemental-ui-config.service';
import { DataSourceToolbarFilter } from '../data-source-toolbar/data-source-toolbar-filters.interface';
import { DataSourceToolbarSettings } from '../data-source-toolbar/data-source-toolbar-settings';
import { DataSourceToolbarComponent } from '../data-source-toolbar/data-source-toolbar.component';
import { LocalizedDatePipe } from '../date/localized-date.pipe';
import { SideNavigationComponent } from '../side-navigation-view/side-navigation-view-interfaces';
import { LogDetailsSidesheetComponent } from './log-details-sidesheet.component';

@Component({
  selector: 'imx-logs',
  templateUrl: './logs.component.html',
  styleUrls: ['./logs.component.scss'],
})
export class LogsComponent implements OnInit, SideNavigationComponent {
  @Input() public isAdmin: boolean;

  private stream: EventSource;
  private currentTab: number = 0;

  public dstSettingsSession: DataSourceToolbarSettings;
  public dstSettingsLive: DataSourceToolbarSettings;
  public pageSizeOptions: number[] = [20, 50, 100];
  public logFiles: LogFileInfo[] = [];
  public sessionLogs: ApiLogEntry[] = [];
  public sessionLogsFiltered: ApiLogEntry[] = [];
  public sessionLogsOnPage: ApiLogEntry[] = [];
  public sessionTotalCount: number;
  public liveLogs: ApiLogEntry[] = [];
  public liveLogsFiltered: ApiLogEntry[] = [];
  public liveLogsOnPage: ApiLogEntry[] = [];
  public liveTotalCount: number;
  public pageSize: number = 20;
  public searchText: string = '';
  public searchBoxText: string = '#LDS#Search';
  public isRegexChecked: boolean = false;
  public isRegexValid: boolean = true;
  public logDownloads: EuiDownloadOptions[] = [];

  @ViewChild('dstSession') dstSession: DataSourceToolbarComponent;
  @ViewChild('dstLive') dstLive: DataSourceToolbarComponent;
  @ViewChild('sessionPaginator') sessionPaginator: MatPaginator;
  @ViewChild('livePaginator') livePaginator: MatPaginator;

  constructor(
    private readonly appConfigService: AppConfigService,
    private readonly sidesheet: EuiSidesheetService,
    private readonly busyService: EuiLoadingService,
    private readonly translateService: TranslateService,
    private datePipe: LocalizedDatePipe,
    private logger: ClassloggerService,
    private elementalUiConfigService: ElementalUiConfigService,
    private translator: TranslateService,
  ) {}

  public async ngOnInit(): Promise<void> {
    this.showBusyIndicator();

    try {
      const timeFilter: DataSourceToolbarFilter = {
        Name: 'TimeFilter',
        Description: this.translator.instant('#LDS#Time period'),
        Options: [
          {
            Display: this.translator.instant('#LDS#Last hour'),
            Value: moment().subtract(1, 'hours').format(),
          },
          {
            Display: this.translator.instant('#LDS#Last 6 hours'),
            Value: moment().subtract(6, 'hours').format(),
          },
          {
            Display: this.translator.instant('#LDS#Last 12 hours'),
            Value: moment().subtract(12, 'hours').format(),
          },
          {
            Display: this.translator.instant('#LDS#Today'),
            Value: moment().startOf('day').format(),
          },
          {
            Display: this.translator.instant('#LDS#This week'),
            Value: moment().startOf('week').format(),
          },
          {
            Display: this.translator.instant('#LDS#This month'),
            Value: moment().startOf('month').format(),
          },
        ],
      };

      this.dstSettingsSession = {
        dataSource: {
          Data: [],
          totalCount: 0,
        },
        entitySchema: {
          Columns: {
            Logs: {
              ColumnName: 'Logs',
              Type: ValType.String,
            },
          },
        },
        navigationState: {
          StartIndex: 0,
          PageSize: 20,
        },
        filters: [timeFilter],
      };

      this.dstSettingsLive = JSON.parse(JSON.stringify(this.dstSettingsSession));

      this.sessionLogs = await this.getSessionData();
      this.sessionLogsFiltered = this.sessionLogs;
      this.sessionTotalCount = this.sessionLogs.length;
      this.setSessionPage();

      const factory = new V2ApiClientMethodFactory();
      const path = factory.admin_systeminfo_log_live_get().path;
      this.stream = new EventSource(this.appConfigService.BaseUrl + path, {
        withCredentials: true,
      });

      this.stream.onopen = () => {
        this.logger.trace(this, 'data stream');
      };

      this.stream.onmessage = (evt) => {
        this.logger.trace('Logs data', evt.data);
        this.liveLogs.push(JSON.parse(evt.data));
        this.onLiveLogSearch(this.dstSettingsLive?.navigationState?.search ?? '', true);
      };

      this.stream.onerror = (err) => {
        this.logger.error('An error occured in data stream:', err);
      };
    } finally {
      this.busyService.hide();
    }
  }

  private async getSessionData(): Promise<ApiLogEntry[]> {
    this.showBusyIndicator();
    try {
      return await this.appConfigService.client.admin_systeminfo_log_session_get();
    } finally {
      this.busyService.hide();
    }
  }

  public async onSelectedTabChanged(event: MatTabChangeEvent): Promise<void> {
    this.searchBoxText = '#LDS#Search';
    this.isRegexChecked = false;
    this.currentTab = event.index;

    if (this.currentTab === 2) {
      this.showBusyIndicator();
      try {
        this.logFiles = await this.appConfigService.client.admin_systeminfo_logs_get();

        this.logFiles.forEach((log) => {
          var dir = log.Path?.split('\\');
          if (dir && dir.length > 1) {
            const url =
              this.appConfigService.BaseUrl +
              new MethodDefinition(new V2ApiClientMethodFactory().admin_systeminfo_log_get(dir[0], dir[1])).path;
            this.logDownloads.push({
              ...this.elementalUiConfigService.Config.downloadOptions,
              fileMimeType: '',
              url,
              fileName: log.File,
            });
          }
        });
      } finally {
        this.busyService.hide();
      }
    }
  }

  public onSessionLogSearch(keywords: string): void {
    const sessionKeywords: ({ IsRegex?: boolean } & FilterData)[] =
      this.dstSettingsSession.navigationState.filter?.filter((filter) => filter.Type === 1) ?? [];
    this.sessionLogsFiltered = this.sessionLogs;

    //Handles keyword filters
    if (sessionKeywords && sessionKeywords.length > 0) {
      this.sessionLogsFiltered = this.sessionLogsFiltered.filter((log) =>
        sessionKeywords.every((keyword) =>
          keyword.IsRegex
            ? this.regexTest(keyword.Value1.toLowerCase(), log.Message?.toLowerCase() ?? '')
            : log.Message?.toLowerCase().includes(keyword.Value1.toLowerCase()),
        ),
      );
    }

    //Handles time filters
    if (this.dstSettingsSession.navigationState.TimeFilter) {
      this.sessionLogsFiltered = this.sessionLogsFiltered.filter((log) =>
        moment(log.TimeStamp).isAfter(this.dstSettingsSession.navigationState.TimeFilter),
      );
    }

    if (this.isRegexChecked) {
      if (this.validateRegex(keywords)) {
        this.onRegexSessionLogSearch(keywords);
      } else {
        this.sessionLogsFiltered = [];
      }
    } else {
      this.sessionLogsFiltered = keywords
        ? this.sessionLogsFiltered.filter((log) => log.Message?.toLowerCase().includes(keywords?.toLowerCase()))
        : this.sessionLogsFiltered;
    }

    this.sessionTotalCount = this.sessionLogsFiltered.length;
    this.sessionPaginator.pageIndex = 0;
    this.setSessionPage();
  }

  public onLiveLogSearch(keywords: string, stream = false): void {
    const liveKeywords: ({ IsRegex?: boolean } & FilterData)[] =
      this.dstSettingsLive.navigationState.filter?.filter((filter) => filter.Type === 1) ?? [];
    this.liveLogsFiltered = this.liveLogs;

    //Handles keyword filters
    if (liveKeywords && liveKeywords.length > 0) {
      this.liveLogsFiltered = this.liveLogsFiltered.filter((log) =>
        liveKeywords.every((keyword) =>
          keyword.IsRegex
            ? this.regexTest(keyword.Value1.toLowerCase(), log.Message?.toLowerCase() ?? '')
            : log.Message?.toLowerCase().includes(keyword.Value1.toLowerCase()),
        ),
      );
    }

    //Handles time filters
    if (this.dstSettingsLive.navigationState.TimeFilter) {
      this.liveLogsFiltered = this.liveLogsFiltered.filter((log) =>
        moment(log.TimeStamp).isAfter(this.dstSettingsLive.navigationState.TimeFilter),
      );
    }

    if (this.isRegexChecked) {
      if (this.validateRegex(keywords)) {
        this.onRegexLiveLogSearch(keywords);
      } else {
        this.liveLogsFiltered = [];
      }
    } else {
      this.liveLogsFiltered = keywords
        ? this.liveLogsFiltered.filter((log) => log.Message?.toLowerCase().includes(keywords?.toLowerCase()))
        : this.liveLogsFiltered;
    }

    this.liveTotalCount = this.liveLogsFiltered.length;
    if (!stream) {
      this.livePaginator.pageIndex = 0;
    }
    this.setLivePage();
  }

  private regexTest(keywords: string, message: string) {
    try {
      return new RegExp(keywords, 'gi').test(message);
    } catch (e) {}
  }

  public onRegexSessionLogSearch(keywords: string): void {
    this.sessionLogsFiltered = keywords
      ? this.sessionLogsFiltered.filter((log) => this.regexTest(keywords, log.Message ?? ''))
      : this.sessionLogsFiltered;
  }

  public onRegexLiveLogSearch(keywords: string): void {
    this.liveLogsFiltered = keywords
      ? this.liveLogsFiltered.filter((log) => this.regexTest(keywords, log.Message ?? ''))
      : this.liveLogsFiltered;
  }

  public onRegexToggle(event: MatSlideToggleChange): void {
    this.searchBoxText = event.checked ? '#LDS#Search using regular expressions' : '#LDS#Search';

    if (this.currentTab === 0) this.onSessionLogSearch(this.dstSession.settings.navigationState.search ?? '');
    if (this.currentTab === 1) this.onLiveLogSearch(this.dstLive.settings.navigationState.search ?? '');
  }

  public validateRegex(keywords: string): boolean {
    if (this.isRegexChecked) {
      try {
        /** Attempt to create a RegExp object from the input */
        new RegExp(keywords);
        this.isRegexValid = true;
        return true;
      } catch (error) {
        this.isRegexValid = false;
        return false;
      }
    } else {
      this.isRegexValid = true;
      return true;
    }
  }

  private setSessionPage() {
    const pageIndex = this.sessionPaginator.pageIndex;
    const startIndex = pageIndex * this.pageSize;
    const endIndex = (pageIndex + 1) * this.pageSize;
    this.sessionLogsOnPage = this.sessionLogsFiltered.slice(startIndex, endIndex);
  }

  private setLivePage() {
    const pageIndex = this.livePaginator.pageIndex;
    const startIndex = pageIndex * this.pageSize;
    const endIndex = (pageIndex + 1) * this.pageSize;
    this.liveLogsOnPage = this.liveLogsFiltered.slice(startIndex, endIndex);
  }

  public onSessionPageChange(event: PageEvent) {
    if (event.pageSize !== this.pageSize) this.pageSize = event.pageSize;
    this.setSessionPage();
  }

  public onLivePageChange(event: PageEvent) {
    if (event.pageSize !== this.pageSize) this.pageSize = event.pageSize;
    this.setLivePage();
  }

  public getListIcon(changeType: string): string {
    let icon = 'clock';
    switch (changeType) {
      case 'Error':
        icon = 'error';
        break;
      case 'Warn':
        icon = 'warning';
        break;
    }
    return icon;
  }

  public getIconColor(changeType: string): string {
    let color = 'imx-icon-info';
    switch (changeType) {
      case 'Error':
        color = 'imx-icon-error';
        break;
      case 'Warn':
        color = 'imx-icon-warning';
        break;
    }
    return color;
  }

  public async openLogSideSheet(log: ApiLogEntry): Promise<void> {
    this.showBusyIndicator();
    let config: EuiSidesheetConfig;
    try {
      config = {
        title: await this.translateService.get('#LDS#Heading View Log Entry Details').toPromise(),
        subTitle: this.datePipe.transform(log.TimeStamp),
        padding: '0',
        width: calculateSidesheetWidth(),
        testId: 'log-details-sidesheet',
        data: log,
      };
    } finally {
      this.busyService.hide();
    }
    this.sidesheet.open(LogDetailsSidesheetComponent, config);
  }

  public ngOnDestroy(): void {
    if (this.stream) this.stream.close();
  }

  private showBusyIndicator(): void {
    if (this.busyService.overlayRefs.length === 0) {
      this.busyService.show();
    }
  }
}
