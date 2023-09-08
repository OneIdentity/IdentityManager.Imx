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

import { Injectable, OnDestroy } from '@angular/core';
import { ChartDto, ChartInfoDto } from 'imx-api-qer';
import { defer, Observable } from 'rxjs';
import { QerApiService } from '../../qer-api-client.service';

@Injectable({
  providedIn: 'root'
})
export class StatisticsForObjectsApiService implements OnDestroy {

  public summaryStats$: {
    [id: string]: Observable<ChartDto>
  } = {};

  constructor(
    private apiClient: QerApiService
  ) { }

  public ngOnDestroy(): void {
    this.summaryStats$ = {};
  }

  /**
   * Get available charts for this object
   * @param type name of the object type (Person, AccProduct, AttestationPolicy, Department etc.)
   * @param objectUid object Id
   * @returns list of chart summaries that are related to this object
   */
  public async getChartInfos(type: string, objectUid: string): Promise<ChartInfoDto[]> {
    return this.apiClient.v2Client.portal_statistics_charts_forobject_get(type, objectUid)
  }

  /**
   * Get the summary chart for the statistic associated to the object
   * @param type name of the object type (Person, AccProduct, AttestationPolicy, Department etc.)
   * @param objectUid object Id
   * @param statId chart id
   * @returns detailed chart
   */
  public async getChart(type: string, objectUid: string, statId: string): Promise<ChartDto> {
    return this.apiClient.v2Client.portal_statistics_charts_forobject_byid_get(type, objectUid, statId)
  }

  public async getCharts(type: string, objectUid: string): Promise<ChartInfoDto[]> {
    const allCharts = await this.getChartInfos(type, objectUid);
    allCharts.sort((a, b) => a.Title < b.Title ? -1 : 1);
    allCharts.forEach(chart => {
      this.summaryStats$[chart.Id] = defer(() => this.getChart(type, objectUid, chart.Id));
    });
    return allCharts;
  }
}
