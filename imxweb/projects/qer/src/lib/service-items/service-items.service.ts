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

import {
  PortalShopServiceitems, RequestableProductForPerson, ServiceItemsExtendedData
} from 'imx-api-qer';
import {
  CollectionLoadParameters, ExtendedTypedEntityCollection, FilterType, CompareOperator, ValueStruct, TypedEntity, EntitySchema, DataModel
} from 'imx-qbm-dbts';
import { QerApiService } from '../qer-api-client.service';

@Injectable({
  providedIn: 'root'
})
export class ServiceItemsService {
  constructor(private readonly qerClient: QerApiService) { }

  public get PortalShopServiceItemsSchema(): EntitySchema {
    return this.qerClient.typedClient.PortalShopServiceitems.GetSchema();
  }

  public async get(parameters: CollectionLoadParameters & {
    UID_Person?: string;
    UID_AccProductGroup?: string;
    IncludeChildCategories?: boolean;
    UID_AccProductParent?: string;
    UID_PersonReference?: string;
    UID_PersonPeerGroup?: string;
  }): Promise<ExtendedTypedEntityCollection<PortalShopServiceitems, ServiceItemsExtendedData>> {
    return this.qerClient.typedClient.PortalShopServiceitems.Get(parameters);
  }

  public async getServiceItem(serviceItemUid: string, isSkippable?: boolean): Promise<PortalShopServiceitems> {
    const serviceItemCollection = await this.get({
      IncludeChildCategories: false,
      filter: [
        {
          ColumnName: 'UID_AccProduct',
          Type: FilterType.Compare,
          CompareOp: CompareOperator.Equal,
          Value1: serviceItemUid
        }
      ]
    });

    if (serviceItemCollection == null || serviceItemCollection.Data == null || serviceItemCollection.Data.length === 0) {
      if (isSkippable) {
        return null;
      }
      throw new Error('getServiceItem - service item not found');
    }

    return serviceItemCollection.Data[0];
  }

  public async getDataModel(): Promise<DataModel>{
    return this.qerClient.client.portal_shop_serviceitems_datamodel_get(undefined);
  }

  public getServiceItemsForPersons(
    serviceItems: PortalShopServiceitems[],
    recipients: ValueStruct<string>[],
    additionalArgs?: {
      uidITShopOrg?: string
    }
  ): RequestableProductForPerson[] {
    return serviceItems.map((serviceItem) => {
      const key = serviceItem.GetEntity().GetKeys()[0];
      return recipients.map(recipient => {
        const requestableProductForPerson: RequestableProductForPerson = {
          UidPerson: recipient.DataValue,
          UidITShopOrg: additionalArgs?.uidITShopOrg,
          UidAccProduct: key,
          Display: serviceItem.GetEntity().GetDisplay(),
          DisplayRecipient: recipient.DisplayValue
        };
        return requestableProductForPerson;
      });
    }).reduce((a, b) => a.concat(b), []);
  }

  public async updateServiceCategory(prev: TypedEntity[], current: TypedEntity[], serviceCategoryUid?: string): Promise<void> {
    if (current?.length > 0) {
      const add = prev?.length > 0 ?
        current.filter(selectedItem =>
          prev.find(item => this.getKey(item) === this.getKey(selectedItem)) == null
        ) :
        current;

      if (add.length > 0) {
        await this.setServiceCategory(add, serviceCategoryUid);
      }
    }

    if (prev?.length > 0) {
      const remove = current?.length > 0 ?
        prev.filter(selectedItem =>
          current.find(item => this.getKey(item) === this.getKey(selectedItem)) == null
        ) :
        prev;

      if (remove.length > 0) {
        await this.setServiceCategory(remove);
      }
    }
  }


  private async setServiceCategory(serviceItems: TypedEntity[], serviceCategoryUid?: string): Promise<void> {
    return this.qerClient.client.portal_serviceitems_bulk_put({
      Keys: serviceItems.map(item => [this.getKey(item)]),
      Data: [{
        Name: "UID_AccProductGroup",
        Value: serviceCategoryUid
      }]
    });
  }

  private getKey(item: TypedEntity): string {
    return item.GetEntity().GetKeys()[0];
  }
}
