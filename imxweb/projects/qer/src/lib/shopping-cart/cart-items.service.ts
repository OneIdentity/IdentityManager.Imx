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

import { ErrorHandler, Injectable, inject } from '@angular/core';
import { EuiLoadingService } from '@elemental-ui/core';

import { CartCheckResult, CartItemDataRead, CheckMode, PortalCartitem, RequestableProductForPerson } from '@imx-modules/imx-api-qer';
import {
  CompareOperator,
  EntitySchema,
  ExtendedTypedEntityCollection,
  FilterData,
  FilterType,
  TypedEntity,
} from '@imx-modules/imx-qbm-dbts';
import { BulkItemStatus, ClassloggerService } from 'qbm';
import { ExtendedEntityWrapper } from '../parameter-data/extended-entity-wrapper.interface';
import { ParameterDataService } from '../parameter-data/parameter-data.service';
import { ItemEditService } from '../product-selection/service-item-edit/item-edit.service';
import { QerApiService } from '../qer-api-client.service';
import { CartItemInteractiveService } from './cart-item-edit/cart-item-interactive.service';
import { CartItemsExtensionService } from './cart-items-extension.service';
import { CartItemsCounter, ICartItemsExtensionService } from './cart-items.model';
import { RequestableProduct } from './requestable-product.interface';

@Injectable()
export class CartItemsService {
  public get PortalCartitemSchema(): EntitySchema {
    return this.qerClient.typedClient.PortalCartitem.GetSchema();
  }

  private cartItemsExtensionService: ICartItemsExtensionService;

  constructor(
    private readonly qerClient: QerApiService,
    private readonly logger: ClassloggerService,
    private readonly errorHandler: ErrorHandler,
    cartItemsExtensionService: CartItemsExtensionService,
    private readonly busyIndicator: EuiLoadingService,
    private readonly itemEditService: ItemEditService,
    private readonly parameterDataService: ParameterDataService,
    private readonly cartItemInteractive: CartItemInteractiveService,
  ) {
    const extService = cartItemsExtensionService.get('AccessRequestService');
    if (extService) {
      this.cartItemsExtensionService = inject(extService);
    }
  }

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
    requestableServiceItemForPerson: RequestableProduct,
    parentCartUid: string | undefined,
  ): Promise<ExtendedTypedEntityCollection<PortalCartitem, CartItemDataRead>> {
    const cartItem = this.qerClient.typedClient.PortalCartitem.createEntity();
    if (cartItem != null) {
      cartItem.UID_PersonOrdered.value = requestableServiceItemForPerson.UidPerson || '';
      cartItem.UID_ITShopOrg.value = requestableServiceItemForPerson.UidITShopOrg || '';
    }
    if (!!requestableServiceItemForPerson?.UidPatternItem?.length) {
      cartItem.UID_PatternItem.value = requestableServiceItemForPerson.UidPatternItem;
    }
    if (parentCartUid != null) {
      cartItem.UID_ShoppingCartItemParent.value = parentCartUid;
    }
    cartItem.reload = true;
    const portalCartItem = await this.qerClient.typedClient.PortalCartitem.Post(cartItem);
    if (this.cartItemsExtensionService) {
      const key = this.getKey(portalCartItem.Data[0]);
      let extendedEntity = await this.getInteractiveCartitem(key);
      extendedEntity = await this.cartItemsExtensionService.OnAfterCreateCartItem(requestableServiceItemForPerson, extendedEntity);
      await this.save(extendedEntity);
    }
    return portalCartItem;
  }

  public async addItems(requestableServiceItemsForPersons: RequestableProduct[]): Promise<CartItemsCounter> {
    const addedItems: PortalCartitem[] = [];
    const cartitemReferences: string[] = [];
    const cartItemsWithoutParams: PortalCartitem[] = [];

    let requestableProducts: RequestableProduct[] = [];
    if (this.cartItemsExtensionService) {
      requestableProducts = await this.cartItemsExtensionService.OnBeforeCreateCartItems(requestableServiceItemsForPersons);
    } else {
      requestableProducts = requestableServiceItemsForPersons;
    }

    // Sort requestables so that children come after parents
    const parentUids = requestableProducts.map((requestable) => requestable.UidAccProductParent);
    const indices = Array.from(parentUids.keys());
    // Logic is to sort all undefined parent uids to front, these are the parents and we want to order them first
    indices.sort((a, b) => {
      if (!parentUids[a]) {
        return -1;
      }
      if (!parentUids[b]) {
        return 1;
      }
      return parentUids[b].localeCompare(parentUids[a]);
    });

    for await (const index of indices) {
      const requestable = requestableProducts[index];
      let parentCartUid: string | undefined;
      if (requestable?.UidAccProductParent) {
        // Look for the parent cart uid from added items first
        const parent = addedItems.find(
          (item) => item.UID_AccProduct.value == requestable.UidAccProductParent && item.UID_PersonOrdered.value == requestable.UidPerson,
        );
        if (parent) {
          parentCartUid = this.getKey(parent);
        } else {
          // Get parent cart ID from known cart items
          parentCartUid = await this.getFromExistingCartItems(addedItems[0].UID_ShoppingCartOrder.value, requestable);
        }
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
      : {
          possibleItems: requestableProducts.length,
          savedItems: requestableProducts.length,
        };
  }

  public async getFromExistingCartItems(cartUid: string, requestable: RequestableProductForPerson): Promise<string | undefined> {
    // Get all cart items to see what is there, unfortunately we have to check each time due to mandatory items appearing
    const allItems = (await this.getItemsForCart(cartUid)).Data;

    const parent = allItems.find(
      (item) => item.UID_AccProduct.value == requestable.UidAccProductParent && item.UID_PersonOrdered.value == requestable.UidPerson,
    );

    if (parent) {
      return this.getKey(parent);
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
      }),
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

  public async saveItems(cartItems: ExtendedEntityWrapper<TypedEntity>[]): Promise<void> {
    for await (const cartItem of cartItems) {
      await this.cartItemInteractive.commitExtendedEntity(cartItem);
    }
  }

  public async getInteractiveCartitem(
    entityReference?: string,
    callbackOnChange?: () => void,
  ): Promise<ExtendedEntityWrapper<PortalCartitem>> {
    return this.cartItemInteractive.getExtendedEntity(entityReference, callbackOnChange);
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
      }),
    );
  }

  private async editItems(entityReferences: string[], cartItemsWithoutParams: PortalCartitem[]): Promise<CartItemsCounter> {
    let result = entityReferences.length + cartItemsWithoutParams.length;
    const cartItems = await Promise.all(entityReferences.map((entityReference) => this.getInteractiveCartitem(entityReference)));

    this.busyIndicator.hide();

    const results = await this.itemEditService.openEditor(cartItems);

    try {
      if (this.busyIndicator.overlayRefs.length === 0) {
        this.busyIndicator.show();
      }
      for (const item of results.bulkItems) {
        try {
          const found = cartItems.find((x) => x.typedEntity.GetEntity().GetKeys()[0] === item.entity.GetEntity().GetKeys()[0]);
          if (found != null) {
            if (item.status === BulkItemStatus.saved && results.submit) {
              await this.save(found);
              this.logger.debug(this, `${found.typedEntity.GetEntity().GetDisplay()} saved`);
            } else {
              await this.removeItems([found.typedEntity]);
              result = result - 1;
              this.logger.debug(this, `${found.typedEntity.GetEntity().GetDisplay()} removed`);
            }
          }
        } catch (e) {
          this.logger.error(this, e.message);
        }
      }

      if (!results.submit) {
        this.logger.debug(
          this,
          `The user aborts this "add to cart"-action. So we have to delete all cartitems without params from shopping cart too.`,
        );
        await this.removeItems(cartItemsWithoutParams);
        result = result - cartItemsWithoutParams.length;
      }
    } finally {
      this.busyIndicator.hide();
    }

    return {
      savedItems: result,
      possibleItems: entityReferences.length + cartItemsWithoutParams.length,
    };
  }
}
