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
 * Copyright 2022 One Identity LLC.
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
import { PortalItshopPatternRequestable, PortalShopServiceitems, RequestableProductForPerson } from 'imx-api-qer';
import { CollectionLoadParameters, EntityData, EntitySchema, ExtendedTypedEntityCollection, ValueStruct } from 'imx-qbm-dbts';
import { QerApiService } from '../qer-api-client.service';
import { ServiceItemsService } from '../service-items/service-items.service';

@Injectable({
  providedIn: 'root',
})
export class PatternItemService {
  constructor(
    private readonly qerClient: QerApiService,
    private readonly serviceItemsProvider: ServiceItemsService
    ) {}

  public get PortalShopPatternRequestableSchema(): EntitySchema {
    return this.qerClient.typedClient.PortalItshopPatternRequestable.GetSchema();
  }

  public async get(
    parameters: CollectionLoadParameters & {
      UID_Persons?: string;
    }
  ): Promise<ExtendedTypedEntityCollection<PortalItshopPatternRequestable, unknown>> {
    return this.qerClient.typedClient.PortalItshopPatternRequestable.Get(parameters);
  }

  public async getServiceItemEntities(patternRequestable: PortalItshopPatternRequestable): Promise<EntityData[]> {
    return (await this.qerClient.v2Client.portal_itshop_pattern_get(patternRequestable.UID_ShoppingCartPattern.value)).Entities;
  }

  public async getServiceItems(patternRequestable: PortalItshopPatternRequestable): Promise<PortalShopServiceitems[]> {
    const serviceItemsEntites = await this.getServiceItemEntities(patternRequestable);
    const serviceItems = await Promise.all(
      serviceItemsEntites.map((entity) => this.serviceItemsProvider.getServiceItem(entity.Columns.UID_AccProduct.Value, true))
    );
    return serviceItems.filter((item) => item !== null);
  }

  public async getPatternItemsForPersons(
    patternRequestables: PortalItshopPatternRequestable[],
    recipients: ValueStruct<string>[],
    uidITShopOrg?: string
  ): Promise<RequestableProductForPerson[]> {
    const serviceItemEntities = await Promise.all(
      patternRequestables.map(async (patternRequestable) => this.getServiceItemEntities(patternRequestable))
    );
    const serviceItemsEntitesFlat = serviceItemEntities.reduce((a, b) => a.concat(b), []);
    return serviceItemsEntitesFlat
      .map((serviceItem) =>
        recipients.map((recipient) => ({
          UidPerson: recipient.DataValue,
          UidITShopOrg: uidITShopOrg,
          UidAccProduct: serviceItem.Columns.UID_AccProduct.Value,
          Display: serviceItem.Display,
          DisplayRecipient: recipient.DisplayValue,
        }))
      )
      .reduce((a, b) => a.concat(b), []);
  }
}
