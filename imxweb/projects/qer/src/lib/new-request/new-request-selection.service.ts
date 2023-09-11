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
  GetSelectedProductType,
  SelectedProductItem,
  SelectedProductSource,
} from './new-request-selected-products/selected-product-item.interface';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';
import {
  PortalItshopPatternItem,
  PortalItshopPatternRequestable,
  PortalItshopPeergroupMemberships,
  PortalShopServiceitems,
} from 'imx-api-qer';

@Injectable({
  providedIn: 'root',
})
export class NewRequestSelectionService {
  private selectedProductsProperty: SelectedProductItem[] = [];
  public get selectedProducts(): SelectedProductItem[] {
    return this.selectedProductsProperty;
  }
  public set selectedProducts(value: SelectedProductItem[]) {
    this.selectedProductsProperty = value;
  }
  public selectedProducts$ = new BehaviorSubject<SelectedProductItem[]>([]);
  public selectedProductsCleared$ = new BehaviorSubject<boolean>(true);

  constructor() {}

  public clearProducts(): void {
    this.selectedProducts = [];
    this.selectedProductsCleared$.next(true);
  }

  public addProducts(
    products: PortalShopServiceitems[] | PortalItshopPeergroupMemberships[] | PortalItshopPatternItem[],
    productSource: SelectedProductSource = SelectedProductSource.Undefined,
    wholeBundle: boolean = false,
    productBundle?: PortalItshopPatternRequestable
  ): void {
    productSource === SelectedProductSource.ProductBundles
      ? this.addBundleItems(products as PortalItshopPatternItem[], productBundle, wholeBundle)
      : this.addNonBundleItems(products as PortalShopServiceitems[] | PortalItshopPeergroupMemberships[], productSource);
  }

  private addNonBundleItems(
    products: PortalShopServiceitems[] | PortalItshopPeergroupMemberships[],
    productSource: SelectedProductSource = SelectedProductSource.Undefined
  ): void {
    this.selectedProducts = this.selectedProducts.filter((x) => x.source != productSource);

    products.forEach((x) => {
      this.selectedProducts.push({ item: x, type: GetSelectedProductType(x), source: productSource });
    });
  }

  private addBundleItems(products: PortalItshopPatternItem[], productBundle: PortalItshopPatternRequestable, wholeBundle: boolean): void {
    wholeBundle
      ? (this.selectedProducts = this.selectedProducts.filter(
          (x) =>
            !(x.item instanceof PortalItshopPatternItem) ||
            (x.item instanceof PortalItshopPatternItem &&
              x.item.GetEntity().GetColumn('UID_ShoppingCartPattern').GetValue() != productBundle.UID_ShoppingCartPattern.value)
        ))
      : (this.selectedProducts = this.selectedProducts.filter((x) => !(x.item instanceof PortalItshopPatternItem)));

    products.forEach((x) => {
      this.selectedProducts.push({
        item: x,
        type: GetSelectedProductType(x),
        source: SelectedProductSource.ProductBundles,
        bundle: productBundle,
      });
    });
  }
}
