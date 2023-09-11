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

import { Component, AfterViewInit } from '@angular/core';
import { EuiLoadingService } from '@elemental-ui/core';
import { Router } from '@angular/router';

import { ClassloggerService, ConfirmationService } from 'qbm';
import { PortalCartitem } from 'imx-api-qer';
import { CartItemsService } from '../cart-items.service';
import { ShoppingCart } from '../shopping-cart';

@Component({
  styleUrls: ['./shopping-cart-for-later.component.scss'],
  templateUrl: './shopping-cart-for-later.component.html'
})
export class ShoppingCartForLaterComponent implements AfterViewInit {
  public shoppingCart: ShoppingCart;
  public selectedItems: PortalCartitem[] = [];

  constructor(
    private readonly confirmationService: ConfirmationService,
    private readonly busyService: EuiLoadingService,
    private readonly cartItemService: CartItemsService,
    private readonly logger: ClassloggerService,
    private readonly router: Router) { }

  public async ngAfterViewInit(): Promise<void> {
    return this.updateShoppingCart();
  }

  public async getData(): Promise<void> {
    await this.updateShoppingCart();

    if (this.shoppingCart == null || this.shoppingCart.numberOfItems === 0) {
      this.router.navigate(['/shoppingcart']);
    }
  }

  public async clearForLaterList(): Promise<void> {
    if (await this.confirmationService.confirm({
      Title: '#LDS#Heading Delete Saved for Later List',
      Message: '#LDS#Are you sure you want to delete all products from your Saved for Later list?',
      identifier: 'shoppingcart-for-later-delete'
    })) {
      setTimeout(() => this.busyService.show());

      try {
        await this.cartItemService.removeItems(this.shoppingCart.getItems(item => item.UID_ShoppingCartItemParent.value === ''));
        this.logger.debug(this, 'The "for later list" is cleared');
      } finally {
        setTimeout(() => this.busyService.hide());
        this.router.navigate(['/shoppingcart/']);
      }
    }
  }

  public selectionChanged(items: PortalCartitem[]): void {
    this.selectedItems = items;
  }

  private async updateShoppingCart(): Promise<void> {
    setTimeout(() => this.busyService.show());

    try {
      this.shoppingCart = new ShoppingCart(await this.cartItemService.getItemsForCart());
      this.logger.debug(this, 'The "for later list" loaded');
    } finally {
      setTimeout(() => this.busyService.hide());
    }
  }
}
