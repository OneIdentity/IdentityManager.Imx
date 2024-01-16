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
import { ListReportDataProvider } from './list-report-data-provider.interface';

/**
 * Implements a {@link ListReportDataProvider} to get the list report data for a given report id
 */
@Injectable({
  providedIn: 'root',
})
export class ListReportViewerService implements ListReportDataProvider {
  constructor(private readonly api: RpsApiService) {}

  private uidReport: string;

  /**
   * Sets the uid of the report used by this service
   * @param value the uid of a list report
   */
  public setUidReport(value: string): void {
    this.uidReport = value;
  }

  public get entitySchema(): EntitySchema {
    return this.api.typedClient.PortalReportData.GetSchema();
  }

  public async getDataModel(): Promise<DataModel> {
    if (!this.uidReport) {
      throw 'setUidReport(...) has to be called with a valid uid';
    }
    return this.api.client.portal_report_data_datamodel_get(this.uidReport);
  }

  public async get(parameter: CollectionLoadParameters): Promise<ExtendedTypedEntityCollection<PortalReportData, ListReportContentData>> {
    if (!this.uidReport) {
      throw 'setUidReport(...) has to be called with a valid uid';
    }
    return this.api.typedClient.PortalReportData.Get(this.uidReport, parameter);
  }

  public getGroupInfo(parameters: { by?: string; def?: string } & CollectionLoadParameters = {}): Promise<GroupInfoData> {
    if (!this.uidReport) {
      throw 'setUidReport(...) has to be called with a valid uid';
    }
    const { withProperties, OrderBy, search, ...params } = parameters;
    return this.api.client.portal_report_data_group_get(this.uidReport, { ...params });
  }
}
