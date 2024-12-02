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

import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { Router } from '@angular/router';
import { EuiLoadingService, EuiSidesheetService } from '@elemental-ui/core';
import { TranslateService } from '@ngx-translate/core';

import { PortalCartitem } from '@imx-modules/imx-api-qer';
import { DisplayColumns, EntitySchema, ValType } from '@imx-modules/imx-qbm-dbts';
import {
  ClassloggerService,
  ClientPropertyForTableColumns,
  ConfirmationService,
  DataViewSource,
  LdsReplacePipe,
  SnackBarService,
  calculateSidesheetWidth,
} from 'qbm';
import { Subject } from 'rxjs';
import { ExtendedEntityWrapper } from '../../parameter-data/extended-entity-wrapper.interface';
import { UserModelService } from '../../user/user-model.service';
import { CartItemCloneService } from '../cart-item-edit/cart-item-clone.service';
import { CartItemEditParameter } from '../cart-item-edit/cart-item-edit-parameter.interface';
import { CartItemEditComponent } from '../cart-item-edit/cart-item-edit.component';
import { CartItemValidationOverviewComponent } from '../cart-item-validation-overview/cart-item-validation-overview.component';
import { CartItemsService } from '../cart-items.service';
import { ShoppingCart } from '../shopping-cart';
import { CartItemCheckStatus } from './cart-item-check-status.enum';

@Component({
  templateUrl: './cart-items.component.html',
  styleUrls: ['./cart-items.component.scss'],
  selector: 'imx-cart-items',
  providers: [DataViewSource],
})
export class CartItemsComponent implements OnInit, OnChanges {
  public CartItemCheckStatus = CartItemCheckStatus;
  public removeButtonLabel = '';
  public readonly entitySchema: EntitySchema;
  public DisplayColumns = DisplayColumns;
  public displayedColumns: ClientPropertyForTableColumns[];

  public readonly itemStatus = {
    enabled: (cartItem: PortalCartitem): boolean => {
      return (
        cartItem.UID_ShoppingCartItemParent.value == null ||
        cartItem.UID_ShoppingCartItemParent.value.length === 0 ||
        cartItem.IsOptionalChild.value
      );
    },
  };

  @Input() public shoppingCart: ShoppingCart;

  @Input() public forLater = false;

  @Output() public dataChange: EventEmitter<boolean> = new EventEmitter();

  @Output() public selectionChange: EventEmitter<PortalCartitem[]> = new EventEmitter();

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
    private readonly cartItemClone: CartItemCloneService,
    private readonly userModelService: UserModelService,
    private readonly ldsReplace: LdsReplacePipe,
    public dataSource: DataViewSource<PortalCartitem>,
  ) {
    this.entitySchema = cartItemsService.PortalCartitemSchema;
    this.displayedColumns = [
      this.entitySchema.Columns[DisplayColumns.DISPLAY_PROPERTYNAME],
      this.entitySchema.Columns[DisplayColumns.DISPLAY_LONG_PROPERTYNAME],
      {
        ColumnName: 'removeItemButton',
        Type: ValType.String,
        afterAdditionals: true,
        untranslatedDisplay: '#LDS#Remove',
      },
    ];
  }

  public async ngOnInit(): Promise<void> {
    if (!this.forLater) {
      this.displayedColumns.splice(2, 0, this.entitySchema.Columns.CheckResult);
      this.removeButtonLabel = await this.translateService.get('#LDS#Remove from cart').toPromise();
    } else {
      this.removeButtonLabel = await this.translateService.get('#LDS#Remove from list').toPromise();
    }
    this.dataSource.itemStatus = this.itemStatus;
  }

  public async ngOnChanges(changes: SimpleChanges): Promise<void> {
    if (changes.shoppingCart) {
      if (this.shoppingCart) {
        await this.dataSource.init({
          execute: () =>
            Promise.resolve({
              totalCount: this.shoppingCart.totalCount,
              Data: this.shoppingCart.getItemsSorted() || [],
            }),
          schema: this.entitySchema,
          columnsToDisplay: this.displayedColumns,
          selectionChange: (selection: PortalCartitem[]) => this.onSelectionChanged(selection),
        });
      }
    }
  }

  public async editCartItem(portalCartitem: PortalCartitem): Promise<void> {
    this.busyService.show();
    const observable = new Subject<void>();
    const entityWrapper = await this.cartItemsService.getInteractiveCartitem(portalCartitem.GetEntity().GetKeys().join(''), () => {
      observable.next();
    });
    this.busyService.hide();
    const cartItem = entityWrapper.typedEntity;
    let reloadItems = false;

    const itemEditParameter: CartItemEditParameter = {
      entityWrapper,
      multiple: false,
      updated: observable,
      cloneItem: this.itemCanBeCloned(cartItem)
        ? async () => {
            reloadItems = true;
            this.logger.trace(this, 'shopping cart must be reloaded');
            this.cartItemClone.cloneItemForPersons({
              personOrderedFkRelations: cartItem.UID_PersonOrdered.GetMetadata().GetFkRelations(),
              accProduct: {
                DataValue: cartItem.UID_AccProduct.value,
                DisplayValue: cartItem.UID_AccProduct.Column.GetDisplayValue(),
              },
              uidITShopOrg: cartItem.UID_ITShopOrg.value,
              display: cartItem.GetEntity().GetDisplay(),
            });
          }
        : undefined,
    };

    const sidesheetRef = this.sidesheetService.open(CartItemEditComponent, {
      title: await this.translateService.get('#LDS#Heading Edit Product').toPromise(),
      subTitle: await this.getSubtitleDisplay(portalCartitem),
      disableClose: true,
      width: calculateSidesheetWidth(700, 0.4),
      testId: 'cart-item-edit-sidesheet',
      data: itemEditParameter,
    });

    sidesheetRef.afterClosed().subscribe(async (doSave) => {
      if (doSave) {
        this.showBusyIndicator();
        try {
          await this.cartItemsService.save(entityWrapper);
          this.logger.debug(this, 'data is cart item saved.');
        } finally {
          this.busyService.hide();
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
    this.selectionChange.emit(this.selectedItems);
  }

  public async moveSelectedToCart(): Promise<void> {
    this.showBusyIndicator();
    try {
      await this.cartItemsService.moveToCart(this.selectedItems);

      this.snackBarService.open({ key: '#LDS#The selected products have been moved to your shopping cart.' });
    } finally {
      await this.userModelService.reloadPendingItems();
      this.busyService.hide();
      this.router.navigate(['/shoppingcart/']);
    }
  }

  public async moveSelectedToLater(): Promise<void> {
    this.showBusyIndicator();
    try {
      await this.cartItemsService.moveToLater(this.selectedItems);

      this.snackBarService.open({ key: '#LDS#The selected products have been moved to your Saved for Later list.' });
    } finally {
      await this.userModelService.reloadPendingItems();
      this.busyService.hide();
      this.dataChange.emit(true);
      this.dataSource.selection.clear();
    }
  }

  public async removeHighlightedItem(cartItem: PortalCartitem): Promise<void> {
    this.removeRequests([cartItem], true);
  }

  public async removeSelectedItems(): Promise<void> {
    this.removeRequests(this.selectedItems, false);
  }

  public async editSelectedItems(): Promise<void> {
    this.showBusyIndicator();
    let entityWrappers: ExtendedEntityWrapper<PortalCartitem>[] = [];
    for await (const selectedItem of this.selectedItems) {
      entityWrappers.push(await this.cartItemsService.getInteractiveCartitem(selectedItem.GetEntity().GetKeys().join('')));
    }
    const baseCartItem = await this.createBaseCartItem(entityWrappers);
    this.busyService.hide();

    const sidesheetRef = this.sidesheetService.open(CartItemEditComponent, {
      title: this.ldsReplace.transform(
        await this.translateService.get('#LDS#Heading Edit Common Request Properties ({0})').toPromise(),
        this.selectedItems.length,
      ),
      width: calculateSidesheetWidth(700, 0.4),
      disableClose: true,
      testId: 'cart-item-edit-sidesheet',
      data: {
        entityWrapper: baseCartItem,
        multiple: true,
      },
    });

    sidesheetRef.afterClosed().subscribe(async (doSave) => {
      if (doSave) {
        this.busyService.show();
        try {
          await this.saveCartItems(baseCartItem, entityWrappers);
          this.logger.debug(this, 'data is cart item saved.');
        } finally {
          this.busyService.hide();
          this.dataChange.emit(false);
        }
      }
    });
  }

  public HasSelectedItems(): boolean {
    return this.selectedItems != null && this.selectedItems.length > 0;
  }

  public itemSelectable(event: any): void {
    const cartItem: PortalCartitem = event.item;
    event.selectableRows.push(
      cartItem.UID_ShoppingCartItemParent.value == null ||
        cartItem.UID_ShoppingCartItemParent.value.length === 0 ||
        cartItem.IsOptionalChild.value,
    );
  }

  public haveSelectedItems(): boolean {
    return this.selectedItems != null && this.selectedItems.length > 0;
  }

  public itemsCanBeMoved(allowOptional: boolean = false): boolean {
    return this.haveSelectedItems() && this.selectedItems.every((item) => this.itemCanBeMoved(item, allowOptional));
  }

  public itemsCanBeDeleted(): boolean {
    return this.itemsCanBeMoved(true);
  }

  public itemsCanBeEdited(): boolean {
    return this.HasSelectedItems() && this.selectedItems.every((item) => !item.IsNoCopyParametersPerson.value);
  }

  public async showValidationOverview(cartItem: PortalCartitem): Promise<void> {
    if (cartItem.CheckResult.value === CartItemCheckStatus.notChecked) {
      return;
    }
    this.sidesheetService.open(CartItemValidationOverviewComponent, {
      title: await this.translateService.get('#LDS#Heading View Validation Results').toPromise(),
      subTitle: await this.getSubtitleDisplay(cartItem),
      width: calculateSidesheetWidth(800),
      testId: 'cart-item-validation-results-sidesheet',
      data: {
        checkResult: this.shoppingCart.getCartItemCheckResult(cartItem),
        personOrderedDisplay: cartItem.UID_PersonOrdered.Column.GetDisplayValue(),
        cartItemDisplay: cartItem.GetEntity().GetDisplay(),
      },
    });
  }

  public setValidationOverviewButtonColor(cartItem: PortalCartitem): string {
    switch (cartItem.CheckResult.value) {
      case CartItemCheckStatus.error:
        return 'warn';
      case CartItemCheckStatus.warning:
        return 'accent';
      default:
        return '';
    }
  }

  private async getSubtitleDisplay(cartItem: PortalCartitem): Promise<string> {
    return this.translateService
      .get(`${cartItem.GetEntity().GetDisplay()} - ${cartItem.UID_PersonOrdered.Column.GetDisplayValue()}`)
      .toPromise();
  }

  private itemCanBeCloned(cartitem: PortalCartitem): boolean {
    return (
      !this.forLater &&
      cartitem.CanCopy.value &&
      (cartitem.UID_ShoppingCartItemParent.value == null || cartitem.UID_ShoppingCartItemParent.value.length === 0) &&
      (cartitem.Assignment.value == null || cartitem.Assignment.value.length === 0) &&
      (cartitem.UID_PersonWantsOrg.value == null || cartitem.UID_PersonWantsOrg.value.length === 0)
    );
  }

  private itemCanBeMoved(cartItem: PortalCartitem, allowOptional: boolean = false, traversed: string[] = []): boolean {
    const uid = cartItem.GetEntity().GetKeys()[0];

    if (uid == null) {
      return false;
    }

    if (traversed.find((itemUid) => itemUid === uid)) {
      return false;
    }

    traversed.push(uid);

    const parent = this.shoppingCart.getItem(cartItem.UID_ShoppingCartItemParent.value);

    if (parent != null && !(allowOptional && cartItem.IsOptionalChild.value)) {
      return this.itemCanBeMoved(parent, allowOptional, traversed);
    }

    return this.selectedItems.find((item) => item.GetEntity().GetKeys()[0] === uid) != null;
  }

  private getNextSelectedAncestor(cartItem: PortalCartitem): PortalCartitem | null {
    const parent = this.shoppingCart.getItem(cartItem.UID_ShoppingCartItemParent.value);

    if (parent == null) {
      return null;
    }

    if (this.selectedItems.find((item) => item.GetEntity().GetKeys()[0] === parent.GetEntity().GetKeys()[0])) {
      return parent;
    }

    return this.getNextSelectedAncestor(parent);
  }

  private async removeRequests(cartItems: PortalCartitem[], singleSelect: boolean): Promise<void> {
    const dialogTitleShoppingCart = singleSelect
      ? '#LDS#Heading Remove Product From Cart'
      : '#LDS#Heading Remove Selected Products From Cart';

    const dialogTitleWatchList = singleSelect
      ? '#LDS#Heading Remove Product From Saved For Later List'
      : '#LDS#Heading Remove Selected Products From Saved For Later List';

    const askForConfirmationShoppingCart = singleSelect
      ? '#LDS#Are you sure you want to remove the product from your shopping cart?'
      : '#LDS#Are you sure you want to remove the selected products from your shopping cart?';

    const askForConfirmationWatchList = singleSelect
      ? '#LDS#Are you sure you want to remove the product from your Saved for Later list?'
      : '#LDS#Are you sure you want to remove the selected products from your Saved for Later list?';

    const snackBarMessageShoppingCart = singleSelect
      ? '#LDS#The product has been successfully removed from your shopping cart.'
      : '#LDS#The selected products have been successfully removed from your shopping cart.';

    const snackBarMessageWatchList = singleSelect
      ? '#LDS#The product has been successfully removed from your Saved for Later list.'
      : '#LDS#The selected products have been successfully removed from your Saved for Later list.';

    if (
      await this.confirmationService.confirm({
        Title: this.forLater ? dialogTitleWatchList : dialogTitleShoppingCart,
        Message: this.forLater ? askForConfirmationWatchList : askForConfirmationShoppingCart,
        identifier: this.forLater ? 'cartitems-watchlist-delete' : 'cartitems-shoppingcart-delete',
      })
    ) {
      this.showBusyIndicator();
      try {
        await this.cartItemsService.removeItems(cartItems.filter((item) => this.getNextSelectedAncestor(item) == null));
        this.logger.debug(this, 'selected items are removed from list');
        this.snackBarService.open({ key: this.forLater ? snackBarMessageWatchList : snackBarMessageShoppingCart }, '#LDS#Close');
      } finally {
        await this.userModelService.reloadPendingItems();
        this.busyService.hide();
        this.dataChange.emit(true);

        this.dataSource.selection.clear();
      }
    }
  }

  private async createBaseCartItem(cartItems: ExtendedEntityWrapper<PortalCartitem>[]): Promise<ExtendedEntityWrapper<PortalCartitem>> {
    const baseCartItem = await this.cartItemsService.getInteractiveCartitem();
    if (
      cartItems.filter(
        (cartItem) =>
          !!cartItem.typedEntity.ValidFrom.value && cartItem.typedEntity.ValidFrom.value === cartItems[0].typedEntity.ValidFrom.value,
      ).length === cartItems.length
    ) {
      await baseCartItem.typedEntity.ValidFrom.Column.PutValue(new Date(cartItems[0].typedEntity.ValidFrom.value));
    }
    if (
      cartItems.filter(
        (cartItem) =>
          !!cartItem.typedEntity.ValidUntil.value && cartItem.typedEntity.ValidUntil.value === cartItems[0].typedEntity.ValidUntil.value,
      ).length === cartItems.length
    ) {
      await baseCartItem.typedEntity.ValidUntil.Column.PutValue(new Date(cartItems[0].typedEntity.ValidUntil.value));
    }
    if (
      cartItems.filter((cartItem) => cartItem.typedEntity.OrderReason.value === cartItems[0].typedEntity.OrderReason.value).length ===
      cartItems.length
    ) {
      await baseCartItem.typedEntity.OrderReason.Column.PutValue(cartItems[0].typedEntity.OrderReason.value);
    }
    if (
      cartItems.filter(
        (cartItem) => cartItem.typedEntity.UID_QERJustificationOrder.value === cartItems[0].typedEntity.UID_QERJustificationOrder.value,
      ).length === cartItems.length
    ) {
      await baseCartItem.typedEntity.UID_QERJustificationOrder.Column.PutValue(cartItems[0].typedEntity.UID_QERJustificationOrder.value);
    }
    return baseCartItem;
  }

  private async saveCartItems(
    baseCartItem: ExtendedEntityWrapper<PortalCartitem>,
    cartItems: ExtendedEntityWrapper<PortalCartitem>[],
  ): Promise<void> {
    const newValidFrom = baseCartItem.typedEntity.ValidFrom.Column.GetValue();
    const newValidUntil = baseCartItem.typedEntity.ValidUntil.Column.GetValue();
    const newOrderReason = baseCartItem.typedEntity.OrderReason.Column.GetValue();
    const newJustificationOrder = baseCartItem.typedEntity.UID_QERJustificationOrder.Column.GetValue();
    for await (const cartItem of cartItems) {
      if (!!newValidFrom) {
        await cartItem.typedEntity.ValidFrom.Column.PutValue(new Date(newValidFrom));
      }
      if (!!newValidUntil) {
        await cartItem.typedEntity.ValidUntil.Column.PutValue(new Date(newValidUntil));
      }
      if (!!newOrderReason) {
        await cartItem.typedEntity.OrderReason.Column.PutValue(newOrderReason);
      }
      if (!!newJustificationOrder) {
        await cartItem.typedEntity.UID_QERJustificationOrder.Column.PutValue(newJustificationOrder);
      }
    }
    await this.cartItemsService.saveItems(cartItems);
  }

  private showBusyIndicator(): void {
    if (this.busyService.overlayRefs.length === 0) {
      this.busyService.show();
    }
  }
}
