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

import { Injectable } from '@angular/core';
import { QamApiService } from '../qam-api-client.service';
import { CollectionLoadParameters, DataModel, EntitySchema, ExtendedTypedEntityCollection } from '@imx-modules/imx-qbm-dbts';
import { ChangeRequestType, DgeConfigData, PortalDgeResources, PortalDgeResourcesActivity, PortalDgeResourcesbyid } from '../TypedClient';
import { SettingsService } from 'qbm';

@Injectable({ providedIn: 'root' })
export class DugOverviewService {
  constructor(
    private readonly api: QamApiService,
    private readonly settings: SettingsService,
  ) {}

  public async getData(parameter: CollectionLoadParameters): Promise<ExtendedTypedEntityCollection<PortalDgeResources, unknown>> {
    return this.api.typedClient.PortalDgeResources.Get(parameter);
  }

  public async getDataModel(): Promise<DataModel>{
    return this.api.client.portal_dge_resources_datamodel_get();
  }

  public get DugResourceSchema(): EntitySchema {
    return this.api.typedClient.PortalDgeResources.GetSchema();
  }

  public async getDgeConfig(): Promise<DgeConfigData> {
    return this.api.getDgeConfig();
  }

  public async getDugResourceById(key: string): Promise<PortalDgeResourcesbyid> {
    return (await this.api.typedClient.PortalDgeResourcesInteractivebyid.Get_byid(key)).Data[0];
  }

  public async getAllResourceActivities(key: string): Promise<ExtendedTypedEntityCollection<PortalDgeResourcesActivity, unknown>> {
    return this.api.typedClient.PortalDgeResourcesActivity.Get(key, { PageSize: this.settings.PageSizeForAllElements });
  }

  public async makeRequest(uid: string, type: ChangeRequestType, reason: string): Promise<void> {
    return this.api.client.portal_dge_resources_request_post(uid, { ChangeRequestType: type, Reason: reason });
  }
}
