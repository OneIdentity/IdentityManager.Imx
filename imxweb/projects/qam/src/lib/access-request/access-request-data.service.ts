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

import { CollectionLoadParameters, DataModel, EntitySchema, ExtendedTypedEntityCollection } from '@imx-modules/imx-qbm-dbts';
import { PortalDgeResources } from '../TypedClient';
import { QamApiService } from '../qam-api-client.service';
import { QamTreeNode } from './qam-resourcetree';

/**
 * Service that provides all data for the access request, including schema and data model.
 */
@Injectable({
  providedIn: 'root',
})
export class AccessRequestDataService {
  constructor(private readonly api: QamApiService) {}

  /** Returns the entityschema of the DgeResources. */
  public getSchema(): EntitySchema {
    return this.api.typedClient.PortalDgeResources.GetSchema();
  }

  /** Returns the data model of the DgeResources */
  public async getDataModel(): Promise<DataModel> {
    return await this.api.client.portal_dge_resources_datamodel_get();
  }

  /** Returns the list of DgeResources for the given parameters. */
  public async getDgeResources(
    parameters: CollectionLoadParameters = {},
  ): Promise<ExtendedTypedEntityCollection<PortalDgeResources, unknown>> {
    return await this.api.typedClient.PortalDgeResources.Get(parameters);
  }

  /** Returns the DgeResources as a tree for the given UID of the AccProduct. */
  public async getDgeResourceTree(uidAccProduct: string): Promise<QamTreeNode[]> {
    return await this.api.client.portal_dge_resourcetree_get(uidAccProduct);
  }
}
