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

import { Injectable, ErrorHandler } from '@angular/core';
import { EuiLoadingService } from '@elemental-ui/core';

import { FilterData, ExtendedTypedEntityCollection, CompareOperator, FilterType, EntitySchema, TypedEntity } from 'imx-qbm-dbts';
import {
  CartCheckResult,
  CheckMode,
  PortalCartitem,
  RequestableProductForPerson,
  CartItemDataRead,
  PortalCartitemInteractive,
} from 'imx-api-qer';
import { BulkItemStatus, ClassloggerService } from 'qbm';
import { QerApiService } from '../qer-api-client.service';
import { ItemEditService } from '../product-selection/service-item-edit/item-edit.service';
import { ParameterDataService } from '../parameter-data/parameter-data.service';
import { ExtendedEntityWrapper } from '../parameter-data/extended-entity-wrapper.interface';
import { CartItemInteractiveService } from './cart-item-edit/cart-item-interactive.service';

@Injectable()
export class CartItemsService {

  public get PortalCartitemSchema(): EntitySchema {
    return this.qerClient.typedClient.PortalCartitem.GetSchema();
  }
  constructor(
    private readonly qerClient: QerApiService,
    private readonly logger: ClassloggerService,
    private readonly errorHandler: ErrorHandler,
    private readonly busyIndicator: EuiLoadingService,
    private readonly itemEditService: ItemEditService,
    private readonly parameterDataService: ParameterDataService,
    private readonly cartItemInteractive: CartItemInteractiveService
  ) {}

  public async getItemsForCart(uidShoppingCart?: string): Promise<ExtendedTypedEntityCollection<PortalCartitem, CartItemDataRead>> {
    return this.get([
      {
        CompareOp: CompareOperator.Equal,
        Type: FilterType.Compare,
        ColumnName: 'UID_ShoppingCartOrder',
        Value1: uidShoppingCart,
      },
    ]);
  }

  public async addItemsFromRoles(objectKeyMemberships: string[], recipients: string[]): Promise<void> {
    for (const key of objectKeyMemberships) {
      for (const recipient of recipients) {
        const cartItem = this.qerClient.typedClient.PortalCartitem.createEntity();
        cartItem.RoleMembership.value = key;
        cartItem.UID_PersonOrdered.value = recipient;
        await this.qerClient.typedClient.PortalCartitem.Post(cartItem);
      }
    }
  }

  public async createAndPost(
    requestableServiceItemForPerson: RequestableProductForPerson,
    parentCartUid: string
  ): Promise<ExtendedTypedEntityCollection<PortalCartitem, CartItemDataRead>> {
    const cartItem = this.qerClient.typedClient.PortalCartitem.createEntity();
    cartItem.UID_PersonOrdered.value = requestableServiceItemForPerson.UidPerson;
    cartItem.UID_ITShopOrg.value = requestableServiceItemForPerson.UidITShopOrg;
    if (parentCartUid) {
      cartItem.UID_ShoppingCartItemParent.value = parentCartUid;
    }
    cartItem.reload = true;
    return this.qerClient.typedClient.PortalCartitem.Post(cartItem);
  }

  public async addItems(requestableServiceItemsForPersons: RequestableProductForPerson[]): Promise<number> {
    const addedItems: PortalCartitem[] = [];
    const cartitemReferences: string[] = [];
    const cartItemsWithoutParams: PortalCartitem[] = [];

    for await (const requestable of requestableServiceItemsForPersons) {
      let parentCartUid: string;
      if (requestable?.UidAccProductParent) {
        // Get parent cart ID from known cart items
        parentCartUid =  await this.getFromExistingCartItems(addedItems[0].UID_ShoppingCartOrder.value, requestable);
      }
      const cartItemCollection = await this.createAndPost(requestable, parentCartUid);

      addedItems.push(cartItemCollection.Data[0]);
      // TODO: this call does not work yet. await cartItem.GetEntity().Commit(true);
        this.parameterDataService.hasParameters({
          Parameters: cartItemCollection.extendedData?.Parameters,
          index: 0,
        })
        ? cartitemReferences.push(this.getKey(cartItemCollection.Data[0]))
        : cartItemsWithoutParams.push(cartItemCollection.Data[0]);
    }

    return cartitemReferences.length > 0
      ? await this.editItems(cartitemReferences, cartItemsWithoutParams)
      : requestableServiceItemsForPersons.length;
  }

  public async getFromExistingCartItems(cartUid: string, requestable: RequestableProductForPerson): Promise<string> {
    // Get all cart items to see what is there, unfortunately we have to check each time due to mandatory items appearing
    const allItems = (await this.getItemsForCart(cartUid)).Data;

    // Find all already ordered items with this UID + Person, get their parent cart uid
    const dupItemsParents = allItems.filter(item =>
      item.UID_AccProduct.value + item.UID_PersonOrdered.value === requestable.UidAccProduct + requestable.UidPerson
    ).map(item => item.UID_ShoppingCartItemParent.value);

    // Find all items with the correct ParentUID + Person
    const parentItems = allItems.filter(item =>
      item.UID_AccProduct.value + item.UID_PersonOrdered.value === requestable.UidAccProductParent + requestable.UidPerson
    );
    // Here we try assuming the mandatory item is there
    let parentItem = parentItems.find(item => !dupItemsParents.includes(this.getKey(item)));
    if (parentItem) {
      return this.getKey(parentItem);
    }
    // Mandatory item isn't there, no well-defined fall back. Report error move on
    this.errorHandler.handleError('There is a missing mandatory item, cannot link optional item to parent. Ordering with no parent.');
  }


  public async removeItems(cartItems: PortalCartitem[], filter?: (cartItem: PortalCartitem) => boolean): Promise<void> {
    await Promise.all(
      cartItems.map(async (cartItem) => {
        if (filter == null || filter(cartItem)) {
          try {
            await this.qerClient.client.portal_cartitem_delete(cartItem.GetEntity().GetKeys()[0]);
            this.logger.trace(this, 'cart item removed:', cartItem);
          } catch (error) {
            this.errorHandler.handleError(error);
            this.logger.trace(this, 'cart item not removed:', cartItem);
          }
        }
      })
    );
  }

  public getKey(item: PortalCartitem): string {
    return item.GetEntity().GetKeys()[0];
  }

  public async submit(uidCart: string, mode: CheckMode): Promise<CartCheckResult> {
    return this.qerClient.client.portal_cart_submit_post(uidCart, { Mode: mode });
  }

  public async moveToCart(cartItems: PortalCartitem[]): Promise<void> {
    await this.moveItems(cartItems, true);
    this.logger.debug(this, 'items are moved to shopping cart');
  }

  public async moveToLater(cartItems: PortalCartitem[]): Promise<void> {
    await this.moveItems(cartItems, false);
    this.logger.debug(this, 'items are moved to saved for later');
  }

  public async save(cartItemExtended: ExtendedEntityWrapper<TypedEntity>): Promise<void> {
    return this.cartItemInteractive.commitExtendedEntity(cartItemExtended);
  }

  public async getInteractiveCartitem(entityReference: string): Promise<ExtendedEntityWrapper<PortalCartitemInteractive>> {
    return this.cartItemInteractive.getExtendedEntity(entityReference);
  }

  public getAssignmentText(cartItem: PortalCartitem): string {
    let display = cartItem.Assignment.Column.GetDisplayValue();
    for (const columnName of Object.keys(PortalCartitem.GetEntitySchema().Columns)) {
      display = display.replace(`%${columnName}%`, cartItem.GetEntity().GetColumn(columnName).GetDisplayValue());
    }

    return display;
  }

  private async get(filter?: FilterData[]): Promise<ExtendedTypedEntityCollection<PortalCartitem, CartItemDataRead>> {
    return this.qerClient.typedClient.PortalCartitem.Get({ PageSize: 1048576, filter });
  }

  private async moveItems(cartItems: PortalCartitem[], toCart: boolean): Promise<void> {
    await Promise.all(
      cartItems.map(async (cartItem) => {
        if (cartItem.UID_ShoppingCartItemParent.value == null || cartItem.UID_ShoppingCartItemParent.value.length === 0) {
          try {
            await this.qerClient.client.portal_cartitem_move_post(cartItem.GetEntity().GetKeys()[0], { tocart: toCart });
            this.logger.trace(this, 'cart item moved to cart=' + toCart, cartItem);
          } catch (error) {
            this.errorHandler.handleError(error);
            this.logger.trace(this, 'cart item not moved to cart=' + toCart, cartItem);
          }
        }
      })
    );
  }

  private async editItems(entityReferences: string[], cartItemsWithoutParams: PortalCartitem[]): Promise<number> {
    setTimeout(() => this.busyIndicator.hide());

    let result = entityReferences.length + cartItemsWithoutParams.length;

    const cartItems = await Promise.all(entityReferences.map((entityReference) => this.getInteractiveCartitem(entityReference)));

    const results = await this.itemEditService.openEditor(cartItems);
    for (const item of results.bulkItems) {
      try {
        const found = cartItems.find((x) => x.typedEntity.GetEntity().GetKeys()[0] === item.entity.GetEntity().GetKeys()[0]);
        if (item.status === BulkItemStatus.saved) {
          await this.save(found);
          this.logger.debug(this, `${found.typedEntity.GetEntity().GetDisplay} saved`);
        } else {
          await this.removeItems([found.typedEntity]);
          result = result - 1;
          this.logger.debug(this, `${found.typedEntity.GetEntity().GetDisplay} removed`);
        }
      } catch (e) {
        this.logger.error(this, e.message);
      }
    }

    if (!results.submit) {
      this.logger.debug(
        this,
        `The user aborts this "add to cart"-action. So we have to delete all cartitems without params from shopping cart too.`
      );
      await this.removeItems(cartItemsWithoutParams);
      result = result - cartItemsWithoutParams.length;
    }

    return result;
  }
}
