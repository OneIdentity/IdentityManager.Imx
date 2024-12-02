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

import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { EuiCoreModule, EuiMaterialModule } from '@elemental-ui/core';
import { TranslateModule } from '@ngx-translate/core';

import {
  CdrModule,
  ClassloggerService,
  DataSourceToolbarModule,
  DataTableModule,
  DataViewModule,
  ExtService,
  FkAdvancedPickerModule,
  HELP_CONTEXTUAL,
  HelpContextualModule,
  LdsReplaceModule,
  MenuItem,
  MenuService,
  ParameterizedTextModule,
  QbmModule,
  RouteGuardService,
} from 'qbm';
import { ItshopPatternModule } from '../itshop-pattern/itshop-pattern.module';
import { RequestsFeatureGuardService } from '../requests-feature-guard.service';
import { ShoppingCartValidationDetailModule } from '../shopping-cart-validation-detail/shopping-cart-validation-detail.module';
import { UserModule } from '../user/user.module';
import { CartItemEditComponent } from './cart-item-edit/cart-item-edit.component';
import { OrderForAdditionalUsersComponent } from './cart-item-edit/order-for-additional-users.component';
import { CartItemValidationOverviewComponent } from './cart-item-validation-overview/cart-item-validation-overview.component';
import { CartItemsExtensionService } from './cart-items-extension.service';
import { CartItemsService } from './cart-items.service';
import { CartItemDisplayComponent } from './cart-items/cart-item-display.component';
import { CartItemLogicService } from './cart-items/cart-item-logic.service';
import { CartItemsComponent } from './cart-items/cart-items.component';
import { DefaultCartItemDisplayComponent } from './cart-items/default-cart-item-display.component';
import { ConfirmCartSubmitDialog } from './confirm-cart-submit.dialog';
import { ShoppingCartButtonComponent } from './shopping-cart-button/shopping-cart-button.component';
import { ShoppingCartEmptyComponent } from './shopping-cart-empty.component';
import { ShoppingCartForLaterComponent } from './shopping-cart-for-later/shopping-cart-for-later.component';
import { ShoppingCartSubmitWarningsDialog } from './shopping-cart-submit-warnings.dialog';
import { ShoppingCartComponent } from './shopping-cart.component';

const routes: Routes = [
  {
    path: 'shoppingcart',
    component: ShoppingCartComponent,
    canActivate: [RouteGuardService, RequestsFeatureGuardService],
    data: {
      contextId: HELP_CONTEXTUAL.ShoppingCart,
    },
  },
  {
    path: 'shoppingcart/later',
    component: ShoppingCartForLaterComponent,
    canActivate: [RouteGuardService, RequestsFeatureGuardService],
    data: {
      contextId: HELP_CONTEXTUAL.ShoppingCartForLater,
    },
  },
  {
    path: 'shoppingcart/empty',
    component: ShoppingCartEmptyComponent,
    canActivate: [RouteGuardService, RequestsFeatureGuardService],
    data: {
      contextId: HELP_CONTEXTUAL.ShoppingCartEmpty,
    },
  },
];

@NgModule({
  declarations: [
    ShoppingCartComponent,
    ShoppingCartForLaterComponent,
    CartItemEditComponent,
    CartItemDisplayComponent,
    DefaultCartItemDisplayComponent,
    CartItemsComponent,
    ShoppingCartEmptyComponent,
    CartItemValidationOverviewComponent,
    OrderForAdditionalUsersComponent,
    ShoppingCartSubmitWarningsDialog,
    ConfirmCartSubmitDialog,
    ShoppingCartButtonComponent,
  ],
  imports: [
    LdsReplaceModule,
    CdrModule,
    CommonModule,
    DataSourceToolbarModule,
    DataTableModule,
    FkAdvancedPickerModule,
    FormsModule,
    EuiCoreModule,
    EuiMaterialModule,
    ItshopPatternModule,
    ParameterizedTextModule,
    QbmModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes),
    TranslateModule,
    ShoppingCartValidationDetailModule,
    UserModule,
    HelpContextualModule,
    DataViewModule,
  ],
  providers: [CartItemLogicService, CartItemsExtensionService, CartItemsService],
})
export class ShoppingCartModule {
  constructor(
    private readonly extService: ExtService,
    private readonly menuService: MenuService,
    logger: ClassloggerService,
  ) {
    logger.info(this, '▶️ ShoppingCartModule loaded');
    this.setupMenu();

    this.extService.register('mastheadButton', {
      instance: ShoppingCartButtonComponent,
    });
  }

  private setupMenu(): void {
    this.menuService.addMenuFactories((preProps: string[], features: string[]) => {
      const items: MenuItem[] = [];

      if (preProps.includes('ITSHOP')) {
        items.push({
          id: 'QER_Request_ShoppingCart',
          route: 'shoppingcart',
          title: '#LDS#Menu Entry Shopping cart',
          sorting: '10-20',
        });
      }

      if (items.length === 0) {
        return;
      }
      return {
        id: 'ROOT_Request',
        title: '#LDS#Requests',
        sorting: '10',
        items,
      };
    });
  }
}
