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

import { ListReportDefinitionRead, PortalReports, PortalReportsEditInteractive } from 'imx-api-rps';
import { CollectionLoadParameters, ExtendedTypedEntityCollection } from 'imx-qbm-dbts';

import { RpsApiService } from '../rps-api-client.service';

@Injectable({
  providedIn: 'root'
})
export class EditReportService {

  constructor(
    private readonly api: RpsApiService,
  ) { }

  public reportSchema = PortalReportsEditInteractive.GetEntitySchema();

  public async getReport(id: string): Promise<ExtendedTypedEntityCollection<PortalReportsEditInteractive, ListReportDefinitionRead>> {
    return await this.api.typedClient.PortalReportsEditInteractive.Get_byid(id);
  }

  public async createNew(): Promise<ExtendedTypedEntityCollection<PortalReportsEditInteractive, ListReportDefinitionRead>> {
    return this.api.typedClient.PortalReportsEditInteractive.Get();
  }

  public async getReportsOwnedByUser(navigationState?: CollectionLoadParameters):
    Promise<ExtendedTypedEntityCollection<PortalReports, unknown>> {
    return this.api.typedClient.PortalReports.Get({ owned: true, ...navigationState });
  }

  public async getAllReports(navigationState?: CollectionLoadParameters):
    Promise<ExtendedTypedEntityCollection<PortalReports, unknown>> {
    return this.api.typedClient.PortalReports.Get(navigationState);
  }

  public async deleteReport(report: PortalReports) {
    await this.api.client.portal_reports_edit_delete(report.GetEntity().GetKeys()[0]);
  }
}
