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
import { isEqual, uniqWith } from 'lodash';
import {
  CartPatternItemDataRead,
  PortalItshopPatternItem,
  PortalItshopPatternRequestable,
  PortalShopServiceitems,
  portal_itshop_pattern_get_args,
} from 'imx-api-qer';
import {
  ApiRequestOptions,
  CollectionLoadParameters,
  CompareOperator,
  EntityData,
  EntitySchema,
  ExtendedTypedEntityCollection,
  FilterType,
  ValueStruct,
} from 'imx-qbm-dbts';
import { QerApiService } from '../qer-api-client.service';
import { ServiceItemsService } from '../service-items/service-items.service';
import { RequestableProduct } from '../shopping-cart/requestable-product.interface';

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

  public get PortalItshopPatternItemSchema(): EntitySchema {
    return this.qerClient.typedClient.PortalItshopPatternItem.GetSchema();
  }

  public async get(
    parameters: CollectionLoadParameters & {
      UID_Persons?: string;
    },
    requestOpts?: ApiRequestOptions
  ): Promise<ExtendedTypedEntityCollection<PortalItshopPatternRequestable, unknown>> {
    return this.qerClient.typedClient.PortalItshopPatternRequestable.Get(parameters, requestOpts);
  }

  public async getServiceItemEntities(
    patternRequestable: PortalItshopPatternRequestable,
    options: portal_itshop_pattern_get_args = {},
    requestOpts?: ApiRequestOptions
  ): Promise<EntityData[]> {
    return (await this.qerClient.v2Client.portal_itshop_pattern_get(patternRequestable.UID_ShoppingCartPattern.value, options, requestOpts))
      .Entities;
  }

  public async getServiceItems(patternRequestable: PortalItshopPatternRequestable): Promise<PortalShopServiceitems[]> {
    const serviceItemsEntites = await this.getServiceItemEntities(patternRequestable);
    const serviceItems = await Promise.all(
      serviceItemsEntites.map((entity) => this.serviceItemsProvider.getServiceItem(entity.Columns.UID_AccProduct.Value, true))
    );
    return serviceItems.filter((item) => item !== null);
  }

  public async getPatternItemList(
    patternRequestable: PortalItshopPatternRequestable,
    parameters: CollectionLoadParameters & {
      UID_Persons?: string;
    } = {},
    requestOpts?: ApiRequestOptions,
    getAllItems?: boolean,
  ): Promise<ExtendedTypedEntityCollection<PortalItshopPatternItem, CartPatternItemDataRead>> {
    let params: CollectionLoadParameters = {
      ...parameters,
      ...{
        filter: [
          {
            ColumnName: 'UID_ShoppingCartPattern',
            Type: FilterType.Compare,
            CompareOp: CompareOperator.Equal,
            Value1: patternRequestable.UID_ShoppingCartPattern.value,
          },
        ],
      },
    };

    if (getAllItems) {
      let getAllItemsParams: CollectionLoadParameters = {
        ...params,
        ...{
          PageSize: -1
        },
      }; 
      const totalCount = (await this.qerClient.typedClient.PortalItshopPatternItem.Get(getAllItemsParams, requestOpts)).totalCount;
      params = {
        ...params,
        ...{
          PageSize: totalCount

        },
      }; 
    }
    return await this.qerClient.typedClient.PortalItshopPatternItem.Get(params, requestOpts);
  }

  public async getPatternItemsForPersons(
    patternRequestables: PortalItshopPatternRequestable[],
    recipients: ValueStruct<string>[],
    uidITShopOrg?: string,
    onlySelected?: boolean
  ): Promise<RequestableProduct[]> {
    const serviceItemEntities = await Promise.all(
      patternRequestables.map(async (patternRequestable) => this.getServiceItemEntities(patternRequestable))
    );
    // make flat list without duplicates
    const serviceItemsEntitesFlat = uniqWith(serviceItemEntities.reduce((a, b) => a.concat(b), []), isEqual);
    let allItems: RequestableProduct[];
    allItems = serviceItemsEntitesFlat
      .map((serviceItem) =>
        recipients.map((recipient) => ({
          UidPerson: recipient.DataValue,
          UidITShopOrg: uidITShopOrg,
          UidAccProduct: serviceItem?.Columns?.UID_AccProduct.Value,
          Display: serviceItem.Display,
          DisplayRecipient: recipient.DisplayValue,
        }))
      )
      .reduce((a, b) => a.concat(b), []);

    let selectedItems: RequestableProduct[] = [];
    if (onlySelected) {
      const selectedItemsWithDuplicates = allItems.filter((itemAll) => {
        return patternRequestables.some((item) => {
          const isSelected = itemAll.UidAccProduct === item.GetEntity().GetColumn('UID_AccProduct').GetValue();
          // store the pattern item uid to load saved request params 
          itemAll.UidPatternItem = item.GetEntity().GetKeys()[0];
          return isSelected;
        });
      });
      selectedItems = uniqWith(selectedItemsWithDuplicates, isEqual);
    }

    return onlySelected ? selectedItems : allItems;
  }
}
