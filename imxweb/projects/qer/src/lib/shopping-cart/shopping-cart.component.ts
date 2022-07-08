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

import { Component, OnInit, AfterViewInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { EuiLoadingService } from '@elemental-ui/core';
import { TranslateService } from '@ngx-translate/core';
import { map } from 'rxjs/operators';

import { PortalItshopCart, CheckMode, ITShopConfig, PortalCartitem } from 'imx-api-qer';
import { ClassloggerService, SnackBarService, LdsReplacePipe, ConfirmationService } from 'qbm';
import { UserModelService } from '../user/user-model.service';
import { ProjectConfigurationService } from '../project-configuration/project-configuration.service';
import { CartItemsService } from './cart-items.service';
import { ShoppingCart } from './shopping-cart';
import { ItshopService } from '../itshop/itshop.service';
import { ConfirmCartSubmitDialog } from './confirm-cart-submit.dialog';
import { ShoppingCartSubmitWarningsDialog } from './shopping-cart-submit-warnings.dialog';
import { ShoppingCartValidator } from './shopping-cart-validator';
import { ItshopPatternCreateService } from '../itshop-pattern/itshop-pattern-create-sidesheet/itshop-pattern-create.service';

@Component({
  templateUrl: './shopping-cart.component.html',
  styleUrls: ['./shopping-cart.component.scss'],
  selector: 'imx-shopping-cart'
})
export class ShoppingCartComponent implements OnInit, AfterViewInit {
  public shoppingCart: ShoppingCart;
  public shoppingCartCandidates: PortalItshopCart[] = [];
  public selectedItshopCart: PortalItshopCart;
  public selectedItems: PortalCartitem[];
  public isEmpty: boolean;
  public canCreateRequestTemplates: boolean;

  private itshopConfig: ITShopConfig;

  constructor(
    private readonly translate: TranslateService,
    private readonly ldsReplace: LdsReplacePipe,
    private readonly router: Router,
    private readonly confirmationService: ConfirmationService,
    private readonly dialogService: MatDialog,
    private readonly userModelService: UserModelService,
    private readonly busyService: EuiLoadingService,
    private readonly logger: ClassloggerService,
    private readonly cartItemService: CartItemsService,
    private readonly projectConfig: ProjectConfigurationService,
    private readonly itshopProvider: ItshopService,
    private readonly patternCreateService: ItshopPatternCreateService,
    private readonly snackBarService: SnackBarService
  ) { }

  public async ngOnInit(): Promise<void> {
    this.itshopConfig = (await this.projectConfig.getConfig()).ITShopConfig;
    this.canCreateRequestTemplates = this.itshopConfig.VI_ITShop_ProductSelectionFromTemplate;
  }

  public async ngAfterViewInit(): Promise<void> {
    return this.getData(true);
  }

  public async validate(): Promise<void> {
    let message = '#LDS#An error ocurred';
    setTimeout(() => this.busyService.show());

    try {
      const uid = this.selectedItshopCart.GetEntity().GetKeys()[0];
      const result = await this.cartItemService.submit(uid, CheckMode.CheckOnly);
      this.logger.debug(this, 'Validation result', result);

      message = result.HasErrors ? '#LDS#At least one request cannot be submitted.' : '#LDS#Your shopping cart may be submitted.';
      await this.getCartItems();
    } finally {
      setTimeout(() => this.busyService.hide());
      this.snackBarService.open(
        { key: message },
        '#LDS#Close'
      );
    }
  }

  public async createItshopPattern(cartItems?: PortalCartitem[]): Promise<void> {
    if (await this.patternCreateService.createItshopPatternFromShoppingCart(cartItems) > 0) {
      await this.getData(true);

      const snackbarRef = this.snackBarService.open(
        { key: '#LDS#The request template has been successfully created.' },
        '#LDS#View my request templates');
      snackbarRef.onAction().subscribe(() => this.router.navigate(['itshop/myrequesttemplates']));

    } else {
      this.snackBarService.open({ key: '#LDS#The request template could not be created.' });
    }
  }

  public async deleteCart(): Promise<void> {
    const docNr = this.selectedItshopCart.DocumentNumber.value;

    const title = await this.translate.get('#LDS#Heading Delete Shopping Cart {0}')
      .pipe(map(text => this.ldsReplace.transform(text, docNr))).toPromise();
    const message = await this.translate.get('#LDS#Are you sure you want to delete all products in the shopping cart "{0}"?')
      .pipe(map(text => this.ldsReplace.transform(text, docNr))).toPromise();

    if (await this.confirmationService.confirm({
      Title: title,
      Message: message,
      identifier: 'shoppingcart-delete',
    })) {
      setTimeout(() => this.busyService.show());

      try {
        await this.cartItemService.removeItems(this.shoppingCart.getItems(item => item.UID_ShoppingCartItemParent.value === ''));
        await this.itshopProvider.deleteShoppingCart(this.selectedItshopCart.GetEntity().GetKeys()[0]);

        await this.getData(true);
        await this.userModelService.reloadPendingItems();
      } finally {
        this.snackBarService.open({ key: '#LDS#The shopping cart "{0}" has been successfully deleted.', parameters: [docNr] });
        setTimeout(() => this.busyService.hide());
      }
    }
  }

  public async submitShoppingCart(): Promise<void> {
    setTimeout(() => this.busyService.show());

    try {
      this.logger.debug(this, 'Submit shopping cart. Validating cart...');
      const uid = this.selectedItshopCart.GetEntity().GetKeys()[0];
      const validator = new ShoppingCartValidator(await this.cartItemService.submit(uid, CheckMode.CheckOnly));

      this.logger.debug(this, `Check shopping cart. Validation errors: ${validator.hasErrors}`);
      this.logger.debug(this, `Check shopping cart. Validation warnings: ${validator.hasWarnings}`);

      if (validator.hasErrors) {
        this.snackBarService.open(
          { key: '#LDS#At least one request cannot be submitted.' },
          '#LDS#Close'
        );
        await this.getCartItems();
        return;
      }

      let confirmSubmit = true;

      if (validator.hasWarnings) {
        const submitRef = this.dialogService.open(
          ShoppingCartSubmitWarningsDialog,
          {
            data: {
              hasErrors: validator.hasErrors,
              hasWarnings: validator.hasWarnings,
              warnings: validator.getWarnings(cartItemUid => this.shoppingCart.getItem(cartItemUid))
            }
          }
        );
        confirmSubmit = await submitRef.afterClosed().toPromise();
      } else if (!this.itshopConfig.VI_ITShop_SubmitOrderImmediately) {
        const confirmSubmitRef = this.dialogService.open(ConfirmCartSubmitDialog);
        confirmSubmit = await confirmSubmitRef.afterClosed().toPromise();
      }

      if (!confirmSubmit) {
        this.snackBarService.open(
          { key: '#LDS#You have canceled the submission of your shopping cart.' },
          '#LDS#Close'
        );
        await this.getCartItems();
        return;
      }

      await this.cartItemService.submit(uid, CheckMode.SubmitWithWarnings);

      this.snackBarService.open(
        { key: '#LDS#Your shopping cart has been successfully submitted.' },
        '#LDS#Close'
      );

      await this.userModelService.reloadPendingItems();
    } finally {
      await this.getData(true);
      setTimeout(() => this.busyService.hide());
    }
  }

  public async saveSelectedCart(): Promise<void> {
    return this.selectedItshopCart.GetEntity().Commit(true);
    // TODO apply the values; save affected items
  }

  public async getData(reloadAll: boolean): Promise<void> {
    setTimeout(() => this.busyService.show());
    try {
      if (reloadAll) {
        this.logger.debug(this, 'get shopping cart list...');
        this.shoppingCartCandidates = (await this.itshopProvider.getCarts()).Data;

        this.isEmpty = (this.shoppingCartCandidates == null || this.shoppingCartCandidates.length === 0);

        if (this.isEmpty) {
          return;
        }

        this.logger.debug(this, 'get shopping cart list - shopping cart candidates', this.shoppingCartCandidates);

        const preSelectedCart = this.selectedItshopCart == null ? null :
          this.shoppingCartCandidates.find(cart =>
            cart.DocumentNumber.value === this.selectedItshopCart.DocumentNumber.value);

        this.selectedItshopCart = preSelectedCart || this.shoppingCartCandidates[this.shoppingCartCandidates.length - 1];
      }

      await this.getCartItems();

      await this.userModelService.reloadPendingItems();
    } finally {
      setTimeout(() => this.busyService.hide());
    }
  }

  public selectionChanged(items: PortalCartitem[]): void {
    this.selectedItems = items;
  }

  private async getCartItems(): Promise<void> {
    if (this.selectedItshopCart) {
      this.logger.debug(this, 'getCartItems - loading...', this.selectedItshopCart.GetEntity().GetDisplay());
      this.shoppingCart = new ShoppingCart(await this.cartItemService.getItemsForCart(this.selectedItshopCart.GetEntity().GetKeys()[0]));
      this.logger.debug(
        this,
        'getCartItems - shopping cart loaded',
        this.selectedItshopCart.GetEntity().GetDisplay()
      );
    } else {
      this.shoppingCart = new ShoppingCart();
      this.logger.debug(this, 'getCartItems - no shopping cart selected');
    }

    this.isEmpty = (this.shoppingCart.numberOfItems === 0 &&
      (this.shoppingCartCandidates == null || this.shoppingCartCandidates.length <= 1));
  }
}
