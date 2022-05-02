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
 * Copyright 2021 One Identity LLC.
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

import {
  FilterData,
  ExtendedTypedEntityCollection,
  CompareOperator,
  FilterType,
  EntitySchema,
  TypedEntity
} from 'imx-qbm-dbts';
import {
  CartCheckResult, CheckMode, PortalCartitem, RequestableProductForPerson, CartItemDataRead, PortalCartitemInteractive
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
  ) { }

  public async getItemsForCart(uidShoppingCart?: string): Promise<ExtendedTypedEntityCollection<PortalCartitem, CartItemDataRead>> {
    return this.get([{
      CompareOp: CompareOperator.Equal,
      Type: FilterType.Compare,
      ColumnName: 'UID_ShoppingCartOrder',
      Value1: uidShoppingCart
    }]);
  }

  public async addItemsFromRoles(objectKeyMemberships: string[], recipients: string[]): Promise<any> {
    return Promise.all(objectKeyMemberships.map(async key =>
      Promise.all(recipients.map(async recipient => {
        const cartItem = this.qerClient.typedClient.PortalCartitem.createEntity();
        cartItem.RoleMembership.value = key;
        cartItem.UID_PersonOrdered.value = recipient;
        await this.qerClient.typedClient.PortalCartitem.Post(cartItem);
      }))
    ));
  }

  public async addItems(requestableServiceItemsForPersons: RequestableProductForPerson[]): Promise<boolean> {
    // TODO for later: Show product-specific editors, if any

    const addedItems: { [uidAccProduct: string]: PortalCartitem } = {};
    const cartitemReferences: string[] = [];
    const cartItemsWithoutParams: PortalCartitem[] = [];

    for (const requestableServiceItemForPerson of requestableServiceItemsForPersons) {
      const cartItem = this.qerClient.typedClient.PortalCartitem.createEntity();
      cartItem.UID_PersonOrdered.value = requestableServiceItemForPerson.UidPerson;
      cartItem.UID_ITShopOrg.value = requestableServiceItemForPerson.UidITShopOrg;
      if (requestableServiceItemForPerson.UidAccProductParent) {
        const cartItemParent = addedItems[requestableServiceItemForPerson.UidAccProductParent];
        if (cartItemParent) {
          cartItem.UID_ShoppingCartItemParent.value = cartItemParent.GetEntity().GetKeys()[0];
        } else {
          throw new Error('Cart item parent for optional cart item not found');
        }
      }

      // TODO: this call does not work yet. await cartItem.GetEntity().Commit(true);
      cartItem.reload = true;
      const cartItemCollection = await this.qerClient.typedClient.PortalCartitem.Post(cartItem);

      if (cartItemCollection && cartItemCollection.Data) {
        const index = 0;

        const hasParameters = this.parameterDataService.hasParameters({
          Parameters: cartItemCollection.extendedData?.Parameters,
          index
        });

        if (hasParameters) {
          cartitemReferences.push(cartItemCollection.Data[index].GetEntity().GetKeys().join(''));
        } else {
          cartItemsWithoutParams.push(cartItemCollection.Data[index]);
        }
      }
    }
    let result = false;

    if (cartitemReferences.length > 0) {
      result = await this.editItems(cartitemReferences, cartItemsWithoutParams);
      return result;
    } else {
      return requestableServiceItemsForPersons.length > 0;
    }
  }

  public async removeItems(cartItems: PortalCartitem[], filter?: (cartItem: PortalCartitem) => boolean): Promise<void> {
    for (const cartItem of cartItems) {
      if (filter == null || filter(cartItem)) {
        try {
          await this.qerClient.client.portal_cartitem_delete(cartItem.GetEntity().GetKeys()[0]);
          this.logger.trace(this, 'cart item removed:', cartItem);
        } catch (error) {
          this.errorHandler.handleError(error);
          this.logger.trace(this, 'cart item not removed:', cartItem);
        }
      }
    }
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
    for (const cartItem of cartItems) {
      if (cartItem.UID_ShoppingCartItemParent.value == null || cartItem.UID_ShoppingCartItemParent.value.length === 0) {
        try {
          await this.qerClient.client.portal_cartitem_move_post(cartItem.GetEntity().GetKeys()[0], toCart);
          this.logger.trace(this, 'cart item moved to cart=' + toCart, cartItem);
        } catch (error) {
          this.errorHandler.handleError(error);
          this.logger.trace(this, 'cart item not moved to cart=' + toCart, cartItem);
        }
      }
    }
  }

  private async editItems(entityReferences: string[], cartItemsWithoutParams: PortalCartitem[]): Promise<boolean> {
    setTimeout(() => this.busyIndicator.hide());

    const cartItems = await Promise.all(entityReferences.map(entityReference =>
      this.getInteractiveCartitem(entityReference)
    ));

    const results = await this.itemEditService.openEditor(cartItems);
    for (const item of results.bulkItems) {
      try {
        const found = cartItems.find(x => x.typedEntity.GetEntity().GetKeys()[0] === item.entity.GetEntity().GetKeys()[0]);
        if (item.status === BulkItemStatus.saved) {
          await this.save(found);
          this.logger.debug(this, `${found.typedEntity.GetEntity().GetDisplay} saved`);
        } else {
          await this.removeItems([found.typedEntity]);
          this.logger.debug(this, `${found.typedEntity.GetEntity().GetDisplay} removed`);
        }
      } catch (e) {
        this.logger.error(this, e.message);
      }
    }

    if (!results.submit) {
      this.logger.debug(this, `The user aborts this "add to cart"-action. So we have to delete all cartitems without params from shopping cart too.`);
      await this.removeItems(cartItemsWithoutParams);
    }

    return results.submit;
  }
}
