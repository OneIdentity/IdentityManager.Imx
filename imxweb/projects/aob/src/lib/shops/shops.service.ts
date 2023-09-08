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

import { ClassloggerService, ApiClientService } from 'qbm';
import { CollectionLoadParameters, TypedEntity, TypedEntityCollectionData } from 'imx-qbm-dbts';
import { PortalShops, PortalApplicationinshop, PortalApplication } from 'imx-api-aob';
import { AobApiService } from '../aob-api-client.service';

@Injectable({
  providedIn: 'root'
})
export class ShopsService {
  public get display(): string {
    return this.aobClient.typedClient.PortalShops.GetSchema().Display;
  }

  constructor(
    private readonly aobClient: AobApiService,
    private readonly logger: ClassloggerService,
    private readonly apiProvider: ApiClientService
  ) { }

  public async get(parameters: CollectionLoadParameters = { ParentKey: '' }): Promise<TypedEntityCollectionData<PortalShops>> {
    this.logger.debug(this, 'get');
    return this.apiProvider.request(() => this.aobClient.typedClient.PortalShops.Get(parameters));
  }

  public async getApplicationInShop(application: string, parameters: CollectionLoadParameters = {}):
    Promise<TypedEntityCollectionData<PortalApplicationinshop>> {
    this.logger.debug(this, 'getApplicationInShop');
    if (application) {
      return this.apiProvider.request(() =>
        this.aobClient.typedClient.PortalApplicationinshop.Get(application, parameters));
    }
  }

  public async getFirstAndCount(uidApplication: string): Promise<{ first: TypedEntity, count: number }> {

    const shops = await this.getApplicationInShop(uidApplication, { PageSize: 1 });

    return {
      first: shops.Data.length === 0 ? undefined : shops.Data[0],
      count: shops.totalCount
    };
  }

  public async updateApplicationInShops(application: PortalApplication, changeSet: { add: PortalShops[], remove: PortalShops[] }): Promise<boolean> {
    this.logger.debug(this, 'updateApplicationInShops');

    const applicationInShop = await this.getApplicationInShop(application.UID_AOBApplication.value);

    return applicationInShop &&
      await this.addShops(application, changeSet.add.filter(shop => !ShopsService.isAssigned(shop, applicationInShop.Data))) &&
      this.removeShops(application, changeSet.remove.filter(shop => ShopsService.isAssigned(shop, applicationInShop.Data)));
  }

  private async addShops(application: PortalApplication, shops: PortalShops[]): Promise<boolean> {
    let count = 0;
    await this.apiProvider.request(async () => {
      for (const shop of shops) {
        await this.aobClient.client.
          portal_applicationinshop_put(application.UID_AOBApplication.value, shop.UID_ITShopOrg.value, []);
        count++;
      }
    });
    return count === shops.length;
  }

  private async removeShops(application: PortalApplication, shops: PortalShops[]): Promise<boolean> {
    let count = 0;
    await this.apiProvider.request(async () => {
      for (const shop of shops) {
        await this.aobClient.client
          .portal_applicationinshop_delete(application.UID_AOBApplication.value, shop.UID_ITShopOrg.value, undefined);
        count++;
      }
    });
    return count === shops.length;
  }

  public static isAssigned(shop: PortalShops, shopsAssigned: PortalApplicationinshop[]): boolean {
    return shopsAssigned && shopsAssigned.find(shopAssigned => shopAssigned.UID_ITShopOrg.value === shop.UID_ITShopOrg.value) != null;
  }
}
