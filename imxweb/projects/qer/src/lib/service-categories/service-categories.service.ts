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

import { ApiClientService } from 'qbm';
import { CollectionLoadParameters, EntityCollectionData, TypedEntityCollectionData } from 'imx-qbm-dbts';
import { PortalServicecategories } from 'imx-api-qer';
import { QerApiService } from '../qer-api-client.service';

@Injectable({
  providedIn: 'root',
})
export class ServiceCategoriesService {

  constructor(
    private readonly apiClient: QerApiService,
    private readonly apiProvider: ApiClientService
  ) { }

  public async get(parameters: CollectionLoadParameters = {}): Promise<TypedEntityCollectionData<PortalServicecategories>> {
    return this.apiProvider.request(() =>
      this.apiClient.typedClient.PortalServicecategories.Get({
        ...parameters
      })
    );
  }

  public async getById(uidAccProductGroup: string): Promise<TypedEntityCollectionData<PortalServicecategories>> {
    return this.apiClient.typedClient.PortalServicecategoriesInteractive.Get_byid(uidAccProductGroup);
  }

  public async hasAccproductparamcategoryCandidates(): Promise<boolean> {
    return (await this.apiClient.typedClient.PortalCandidatesAccproductparamcategory.Get({ PageSize: -1 })).totalCount > 0;
  }

  public createEntity(): PortalServicecategories {
    return this.apiClient.typedClient.PortalServicecategories.createEntity();
  }

  public async create(serviceCategory: PortalServicecategories): Promise<TypedEntityCollectionData<PortalServicecategories>> {
    return this.apiClient.typedClient.PortalServicecategories.Post(serviceCategory);
  }

  public async delete(uid: string): Promise<EntityCollectionData> {
    return this.apiClient.client.portal_servicecategories_delete(uid);
  }
}
