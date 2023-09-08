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

import { Injectable } from '@angular/core';
import { ChartDto, ChartInfoDto, HeatmapDto, HeatmapInfoDto, HeatmapSummaryDto, ProfileSettings } from 'imx-api-qer';
import { ProjectConfigurationService } from '../project-configuration/project-configuration.service';
import { QerApiService } from '../qer-api-client.service';

@Injectable({
  providedIn: 'root'
})
export class StatisticsApiService {

  constructor(
    private apiClient: QerApiService,
    private readonly qerConfig: ProjectConfigurationService,
  ) { }

  // Heatmap calls
  public async getHeatmapList(): Promise<HeatmapInfoDto[]> {
    return this.apiClient.v2Client.portal_statistics_heatmaps_get();
  }

  public async getHeatmapSummary(id: string): Promise<HeatmapSummaryDto> {
    return this.apiClient.v2Client.portal_statistics_heatmaps_summary_get(id);
  }

  public async getHeatmap(id: string, options?: { root?: string; includezero?: boolean }): Promise<HeatmapDto> {
    return this.apiClient.v2Client.portal_statistics_heatmaps_byid_get(id, options);
  }

  // Chart calls
  public async getChartList(): Promise<ChartInfoDto[]> {
    return this.apiClient.v2Client.portal_statistics_charts_get();
  }

  public async getChart(id: string, options?: { nohistory?: boolean }): Promise<ChartDto> {
    return this.apiClient.v2Client.portal_statistics_charts_bychartid_get(id, options);
  }

  // Favorites calls
  public async getFavorites(): Promise<string[]> {
    return this.apiClient.v2Client.portal_profile_get().then((val)=> val.PreferredStatisticIdsOrder ?? []);
  }

  public async postFavorites(favorites: string[]): Promise<void> {
    return this.apiClient.v2Client.portal_profile_post({
      PreferredStatisticIdsOrder: favorites
    });
  }

  // Org stats calls
  public async getOrgStats(): Promise<string[]> {
    return this.qerConfig.getConfig().then(val => val.StatisticsConfig?.OrganizationStatistics ?? []);
  }

  public async postOrgStats(orgStats: string[]): Promise<void> {
    // TODO: Need an endpoint for this
    // await this.apiClient.v2Client.portal_profile_post({
    //   PreferredStatisticIdsOrder: orgStats
    // });
  }
}
