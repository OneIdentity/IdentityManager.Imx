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

import { KeyValue } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { ChartOptions, donut } from 'billboard.js';
import { SystemInfoService } from 'qbm';
import { ChartDto, PortalDgeResourcesbyid } from '../TypedClient';
import { DugAccessAnalysisService } from './dug-access-analysis.service';

@Component({
  templateUrl: './dug-access-detail.component.html',
  styleUrls: ['./dug-access-detail.component.scss'],
  selector: 'imx-dge-access-detail',
})
export class DugAccessDetailComponent implements OnInit {
  public LdsViewTitle =
    '#LDS#Analysis of access rights assigned to people using the organizational context such as department structures, locations and titles';

  public LdsAnalysisTitle2 = '#LDS#Analysis of access rights assigned to people using the access right assignment methods and permissions';

  public LdsAccessDeviation = '#LDS#The access rights at this folder are deviated from the share/parent folder.';

  public LdsInheritanceBlocked = '#LDS#The inheritance of access rights (i.e. security inheritance) has been blocked at this folder.';

  public LdsAdditionalRights = '#LDS#This folder has additional access rights assigned which are not on the share/parent folder.';

  public charts: ({
    title: string;
    noDataMessage: string;
    data: ChartOptions;
  } | null)[] = [];

  @Input() public dug: PortalDgeResourcesbyid;

  constructor(
    private readonly dugAccessAnalysisService: DugAccessAnalysisService,
    private readonly systemInfoService: SystemInfoService,
    private readonly translate: TranslateService,
  ) {}

  public async ngOnInit(): Promise<void> {
    this.charts = (
      await Promise.all([
        this.getChart('QAM_AccessAnalysis_Department', '#LDS#Access analysis by department', '#LDS#Data unavailable.'),
        this.getChart('QAM_AccessAnalysis_PrimaryRoleTitle', '#LDS#Access analysis by primary role title', '#LDS#Data unavailable.', 'ORG'),
        this.getChart('QAM_AccessAnalysis_Location', '#LDS#Access analysis by location', '#LDS#Data unavailable.'),
      ])
    ).filter((x) => x != null);
  }

  private async getChart(id: string, titleLds: string, noDataLds: string, preprop?: string) {
    if (preprop != null) {
      if (!(await this.systemInfoService.get()).PreProps?.includes(preprop)) return null;
    }
    const noDataMessage = await this.translate.get(noDataLds).toPromise();
    return {
      title: await this.translate.get(titleLds).toPromise(),
      noDataMessage,
      data: this.buildChartOptions(await this.dugAccessAnalysisService.getChartData(this.dug.UID_QAMDuG.value, id), noDataMessage),
    };
  }
  //#region chart data helper

  private buildChartOptions(chartData: ChartDto, noDataText: string): ChartOptions {
    return {
      data: {
        type: donut(),
        columns: chartData?.Data?.map((ch, index) => ['data' + index, ch?.Points?.[0].Value]) as any[],
        names: this.toObject(chartData?.Data?.map((ch, index) => ({ key: 'data' + index, value: ch.Name ?? '' })) ?? []),
        empty: {
          label: {
            text: noDataText,
          },
        },
      },
      donut: {
        padAngle: 0.05,
        expand: {
          rate: 1.005,
        },
        label: {
          show: false,
        },
      },
      size: { width: 200, height: 200 },
      resize: {
        auto: true,
      },
      legend: {
        show: true,
        item: {
          onclick: () => false,
        },
      },
      padding: {
        bottom: 1,
        top: 0,
        left: 0,
        right: 0,
      },
    };
  }

  private toObject(array: KeyValue<string, string>[]): { [key: string]: string } {
    const ret = {};

    for (const elem of array) {
      ret[elem.key] = elem.value;
    }
    return ret;
  }
  //#endregion
}
