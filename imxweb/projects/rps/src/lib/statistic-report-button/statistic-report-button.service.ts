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

import { CollectionLoadParameters, DataModel, EntitySchema, ExtendedTypedEntityCollection, GroupInfoData } from 'imx-qbm-dbts';
import { ListReportContentData, PortalReportData } from 'imx-api-rps';
import { RpsApiService } from '../rps-api-client.service';
import { ListReportDataProvider } from '../list-report-viewer/list-report-data-provider.interface';

/**
 * Implements a {@link ListReportDataProvider} to get the list report data for a statistic
 */
@Injectable({
  providedIn: 'root',
})
export class StatisticReportButtonService implements ListReportDataProvider {
  constructor(private readonly api: RpsApiService) {}
  private idStatistic: string;

  /**
   * Sets the statistic id used by this service
   * @param value the id of a statistic
   */
  public setIdStatistic(value: string): void {
    this.idStatistic = value;
  }

  public get entitySchema(): EntitySchema {
    return this.api.typedClient.PortalStatisticsData.GetSchema();
  }

  public async getDataModel(): Promise<DataModel> {
    if (!this.idStatistic) {
      throw 'setIdStatistic(...) has to be called with a valid id';
    }
    return this.api.client.portal_statistics_data_datamodel_get(this.idStatistic);
  }

  public async get(param: CollectionLoadParameters): Promise<ExtendedTypedEntityCollection<PortalReportData, ListReportContentData>> {
    if (!this.idStatistic) {
      throw 'setIdStatistic(...) has to be called with a valid id';
    }
    return this.api.typedClient.PortalStatisticsData.Get(this.idStatistic, param);
  }

  public getGroupInfo(parameters: { by?: string; def?: string } & CollectionLoadParameters = {}): Promise<GroupInfoData> {
    if (!this.idStatistic) {
      throw 'setIdStatistic(...) has to be called with a valid id';
    }
    const { withProperties, OrderBy, search, ...params } = parameters;
    return this.api.client.portal_statistics_data_group_get(this.idStatistic, { ...params });
  }
}
