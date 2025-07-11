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
import { CollectionLoadParameters, EntityCollectionData, EntitySchema, ExtendedTypedEntityCollection } from '@imx-modules/imx-qbm-dbts';
import { QamApiService } from '../qam-api-client.service';
import { PortalDgeClassificationSummary } from '../TypedClient';

@Injectable({ providedIn: 'root' })
export class DugResourceOverviewService {
  constructor(
    private readonly api: QamApiService
  ) { }

  public async getData(parameter?: CollectionLoadParameters,
    signal?: AbortSignal): Promise<ExtendedTypedEntityCollection<PortalDgeClassificationSummary, unknown>> {
    return this.api.typedClient.PortalDgeClassificationSummary.Get(parameter, { signal });
  }

  public get DugResourceOverviewSchema(): EntitySchema {
    return this.api.typedClient.PortalDgeClassificationSummary.GetSchema();
  }

  public async getClassificationSummary(): Promise<EntityCollectionData> {
    return this.api.client.portal_dge_classification_summary_get();
  }
}
