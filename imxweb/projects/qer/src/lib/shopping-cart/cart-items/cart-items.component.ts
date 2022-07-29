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

import { OverlayRef } from '@angular/cdk/overlay';
import { Component, Input, EventEmitter, Output, OnChanges, SimpleChanges, OnInit, ViewChild } from '@angular/core';
import { EuiLoadingService, EuiSidesheetService } from '@elemental-ui/core';
import { TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';

import { PortalCartitem, PortalCartitemInteractive } from 'imx-api-qer';
import {
  DataSourceToolbarSettings,
  SnackBarService,
  ClassloggerService,
  DataTableComponent,
  ConfirmationService,
  ClientPropertyForTableColumns
} from 'qbm';
import { DisplayColumns, EntitySchema, IClientProperty, TypedEntity, ValType } from 'imx-qbm-dbts';
import { CartItemEditComponent } from '../cart-item-edit/cart-item-edit.component';
import { CartItemsService } from '../cart-items.service';
import { ShoppingCart } from '../shopping-cart';
import { CartItemCheckStatus } from './cart-item-check-status.enum';
import { CartItemValidationOverviewComponent } from '../cart-item-validation-overview/cart-item-validation-overview.component';
import { CartItemCloneService } from '../cart-item-edit/cart-item-clone.service';

@Component({
  templateUrl: './cart-items.component.html',
  styleUrls: ['./cart-items.component.scss'],
  selector: 'imx-cart-items'
})
export class CartItemsComponent implements OnInit, OnChanges {
  public CartItemCheckStatus = CartItemCheckStatus;
  public dstSettings: DataSourceToolbarSettings;
  public removeButtonLabel = '';
  public readonly entitySchema: EntitySchema;
  public DisplayColumns = DisplayColumns;
  public displayedColumns: ClientPropertyForTableColumns[];

  public readonly itemStatus = {
    enabled: (cartItem: PortalCartitem): boolean => {
      return cartItem.UID_ShoppingCartItemParent.value == null ||
        cartItem.UID_ShoppingCartItemParent.value.length === 0 ||
        cartItem.IsOptionalChild.value;
    }
  };

  @Input() public shoppingCart: ShoppingCart;

  @Input() public forLater = false;

  @Output() public dataChange: EventEmitter<boolean> = new EventEmitter();

  @Output() public selectionChange: EventEmitter<PortalCartitem[]> = new EventEmitter();

  @ViewChild(DataTableComponent) private cartItemsTable: DataTableComponent<TypedEntity>;

  private selectedItems: PortalCartitem[] = [];

  constructor(
    private readonly confirmationService: ConfirmationService,
    private readonly busyService: EuiLoadingService,
    private readonly cartItemsService: CartItemsService,
    private readonly logger: ClassloggerService,
    private readonly router: Router,
    private readonly snackBarService: SnackBarService,
    private readonly translateService: TranslateService,
    private readonly sidesheetService: EuiSidesheetService,
    private readonly cartItemClone: CartItemCloneService
  ) {
    this.entitySchema = cartItemsService.PortalCartitemSchema;
    this.displayedColumns = [
      this.entitySchema.Columns[DisplayColumns.DISPLAY_PROPERTYNAME],
      this.entitySchema.Columns[DisplayColumns.DISPLAY_LONG_PROPERTYNAME],
      {
        ColumnName: 'removeItemButton',
        Type: ValType.String,
        afterAdditionals: true
      }

    ];
  }

  public async ngOnInit(): Promise<void> {
    if (!this.forLater) {
      this.displayedColumns.splice(2, 0, this.entitySchema.Columns.CheckResult);
      this.removeButtonLabel = await this.translateService.get('#LDS#Remove from cart').toPromise();
    } else {
      this.removeButtonLabel = await this.translateService.get('#LDS#Remove from list').toPromise();
    }
  }

  public ngOnChanges(changes: SimpleChanges): void {
    if (changes.shoppingCart) {
      if (this.shoppingCart) {
        this.dstSettings = {
          dataSource: {
            totalCount: this.shoppingCart.totalCount,
            Data: this.shoppingCart.getItemsSorted()
          },
          entitySchema: this.entitySchema,
          navigationState: {},
          displayedColumns: this.displayedColumns
        };
      } else {
        this.dstSettings = undefined;
      }
    }
  }

  public async editCartItem(portalCartitem: PortalCartitem): Promise<void> {
    const entityWrapper = await this.cartItemsService.getInteractiveCartitem(
      portalCartitem.GetEntity().GetKeys().join('')
    );

    const cartItem = entityWrapper.typedEntity;

    let reloadItems = false;

    const title = await this.translateService.get(
      `${cartItem.GetEntity().GetDisplay()} - ${cartItem.UID_PersonOrdered.Column.GetDisplayValue()}`
    ).toPromise();

    const sidesheetRef = this.sidesheetService.open(
      CartItemEditComponent,
      {
        title,
        width: '700px',
        headerColour: 'iris-blue',
        data: {
          entityWrapper,
          cloneItem: this.itemCanBeCloned(cartItem) ?
            () => {
              reloadItems = true;
              this.logger.trace(this, 'shopping cart must be reloaded');
              this.cartItemClone.cloneItemForPersons({
                personOrderedFkRelations: cartItem.UID_PersonOrdered.GetMetadata().GetFkRelations(),
                accProduct: {
                  DataValue: cartItem.UID_AccProduct.value,
                  DisplayValue: cartItem.UID_AccProduct.Column.GetDisplayValue()
                },
                uidITShopOrg: cartItem.UID_ITShopOrg.value,
                display: cartItem.GetEntity().GetDisplay()
              });
            }
            : undefined
        }
      });


    sidesheetRef.afterClosed().subscribe(async doSave => {
      if (doSave) {
        setTimeout(() => this.busyService.show());
        try {
          await this.cartItemsService.save(entityWrapper);
          this.logger.debug(this, 'data is cart item saved.');
        } finally {
          setTimeout(() => this.busyService.hide());
          this.dataChange.emit(false);
        }
      } else {
        if (reloadItems) {
          this.dataChange.emit(false);
        }
      }
    });
  }

  public onSelectionChanged(items: PortalCartitem[]): void {
    this.logger.trace(this, 'selection changed', items);
    this.selectedItems = items;
    this.selectionChange.emit(items);
  }

  public async moveSelectedToCart(): Promise<void> {
    setTimeout(() => this.busyService.show());
    try {
      await this.cartItemsService.moveToCart(this.selectedItems);

      this.snackBarService.open({ key: '#LDS#The selected products have been moved to your shopping cart.' });
    } finally {
      setTimeout(() => this.busyService.hide());
      this.router.navigate(['/shoppingcart/']);
    }
  }

  public async moveSelectedToLater(): Promise<void> {
    setTimeout(() => this.busyService.show());
    try {
      await this.cartItemsService.moveToLater(this.selectedItems);

      this.snackBarService.open({ key: '#LDS#The selected products have been moved to your Saved for Later list.' });
    } finally {
      setTimeout(() => this.busyService.hide());
      this.dataChange.emit(true);
      if (this.cartItemsTable) {
        this.cartItemsTable.clearSelection();
      }
    }
  }

  public async removeHighlightedItem(cartItem: PortalCartitem): Promise<void> {
    this.removeRequests([cartItem], true);
  }

  public async removeSelectedItems(): Promise<void> {
    this.removeRequests(this.selectedItems, false);
  }


  public HasSelectedItems(): boolean {
    return this.selectedItems != null && this.selectedItems.length > 0;
  }

  public itemSelectable(event: any): void {
    const cartItem: PortalCartitem = event.item;
    event.selectableRows.push(
      cartItem.UID_ShoppingCartItemParent.value == null ||
      cartItem.UID_ShoppingCartItemParent.value.length === 0 ||
      cartItem.IsOptionalChild.value
    );
  }

  public haveSelectedItems(): boolean {
    return this.selectedItems != null &&
      this.selectedItems.length > 0;
  }

  public itemsCanBeMoved(allowOptional: boolean = false): boolean {
    return this.haveSelectedItems() &&
      this.selectedItems.every(item => this.itemCanBeMoved(item, allowOptional));
  }

  public itemsCanBeDeleted(): boolean {
    return this.itemsCanBeMoved(true);
  }

  public getCheckStatusIcon(cartItem: PortalCartitem): string {
    switch (cartItem.CheckResult.value) {
      case CartItemCheckStatus.ok:
        return 'check';
      case CartItemCheckStatus.notChecked:
        return 'question';
      case CartItemCheckStatus.warning:
        return 'warning';
      case CartItemCheckStatus.error:
        return 'error';
    }
  }

  public async showValidationOverview(cartItem: PortalCartitem): Promise<void> {
    if (cartItem.CheckResult.value === CartItemCheckStatus.notChecked) {
      return;
    }

    this.sidesheetService.open(
      CartItemValidationOverviewComponent,
      {
        title: await this.translateService.get('#LDS#Heading View Validation Results').toPromise(),
        width: '750px',
        headerColour: 'iris-blue',
        data: {
          checkResult: this.shoppingCart.getCartItemCheckResult(cartItem),
          personOrderedDisplay: cartItem.UID_PersonOrdered.Column.GetDisplayValue(),
          cartItemDisplay: cartItem.GetEntity().GetDisplay()
        }
      });
  }

  public setValidationOverviewButtonColor(cartItem: PortalCartitem): string {
    switch (cartItem.CheckResult.value) {
      case CartItemCheckStatus.error: return 'warn';
      case CartItemCheckStatus.warning: return 'accent';
      default: return '';
    }
  }

  private itemCanBeCloned(cartitem: PortalCartitemInteractive): boolean {
    return !this.forLater &&
      cartitem.CanCopy.value &&
      (cartitem.UID_ShoppingCartItemParent.value == null || cartitem.UID_ShoppingCartItemParent.value.length === 0) &&
      (cartitem.Assignment.value == null || cartitem.Assignment.value.length === 0) &&
      (cartitem.UID_PersonWantsOrg.value == null || cartitem.UID_PersonWantsOrg.value.length === 0);
  }

  private itemCanBeMoved(cartItem: PortalCartitem, allowOptional: boolean = false, traversed: string[] = []): boolean {
    const uid = cartItem.GetEntity().GetKeys()[0];

    if (uid == null) {
      return false;
    }

    if (traversed.find(itemUid => itemUid === uid)) {
      return false;
    }

    traversed.push(uid);

    const parent = this.shoppingCart.getItem(cartItem.UID_ShoppingCartItemParent.value);

    if (parent != null && !(allowOptional && cartItem.IsOptionalChild.value)) {
      return this.itemCanBeMoved(parent, allowOptional, traversed);
    }

    return this.selectedItems.find(item => item.GetEntity().GetKeys()[0] === uid) != null;
  }

  private getNextSelectedAncestor(cartItem: PortalCartitem): PortalCartitem {
    const parent = this.shoppingCart.getItem(cartItem.UID_ShoppingCartItemParent.value);

    if (parent == null) {
      return null;
    }

    if (this.selectedItems.find(item => item.GetEntity().GetKeys()[0] === parent.GetEntity().GetKeys()[0])) {
      return parent;
    }

    return this.getNextSelectedAncestor(parent);
  }

  private async removeRequests(cartItems: PortalCartitem[], singleSelect: boolean): Promise<void> {

    const dialogTitleShoppingCart = singleSelect ?
      '#LDS#Heading Remove Product From Cart' :
      '#LDS#Heading Remove Selected Products From Cart';

    const dialogTitleWatchList = singleSelect ?
      '#LDS#Heading Remove Product From Saved For Later List' :
      '#LDS#Heading Remove Selected Products From Saved For Later List';

    const askForConfirmationShoppingCart = singleSelect ?
      '#LDS#Are you sure you want to remove the product from your shopping cart?' :
      '#LDS#Are you sure you want to remove the selected products from your shopping cart?';

    const askForConfirmationWatchList = singleSelect ?
      '#LDS#Are you sure you want to remove the product from your Saved for Later list?' :
      '#LDS#Are you sure you want to remove the selected products from your Saved for Later list?';

    const snackBarMessageShoppingCart = singleSelect ?
      '#LDS#The product has been successfully removed from your shopping cart.' :
      '#LDS#The selected products have been successfully removed from your shopping cart.';

    const snackBarMessageWatchList = singleSelect ?
      '#LDS#The product has been successfully removed from your Saved for Later list.' :
      '#LDS#The selected products have been successfully removed from your Saved for Later list.';

    if (await this.confirmationService.confirm({
      Title: this.forLater ? dialogTitleWatchList : dialogTitleShoppingCart,
      Message: this.forLater ? askForConfirmationWatchList : askForConfirmationShoppingCart,
      identifier: this.forLater ? 'cartitems-watchlist-delete' : 'cartitems-shoppingcart-delete'
    })) {
      let overlayRef: OverlayRef;
      setTimeout(() => overlayRef = this.busyService.show());
      try {
        await this.cartItemsService.removeItems(cartItems.filter(item => this.getNextSelectedAncestor(item) == null));
        this.logger.debug(this, 'selected items are removed from list');
        this.snackBarService.open({ key: this.forLater ? snackBarMessageWatchList : snackBarMessageShoppingCart }, '#LDS#Close');
      } finally {
        setTimeout(() => this.busyService.hide(overlayRef));
        this.dataChange.emit(true);

        this.cartItemsTable?.clearSelection();
      }
    }
  }
}
