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

import { ExtendedTypedEntityCollection } from 'imx-qbm-dbts';
import { PortalCartitem, CartItemDataRead, CartItemCheckResult } from 'imx-api-qer';

export class ShoppingCart {
    public get totalCount(): number {
        return this.itemCollection ? this.itemCollection.totalCount : 0;
    }

    public get numberOfItems(): number {
        return this.itemCollection && this.itemCollection.Data ? this.itemCollection.Data.length : 0;
    }

    public readonly hasErrors: boolean = false;
    public readonly hasWarnings: boolean = false;

    constructor(private readonly itemCollection?: ExtendedTypedEntityCollection<PortalCartitem, CartItemDataRead>) {
        if (this.itemCollection && this.itemCollection.extendedData && this.itemCollection.extendedData.CheckResults) {
            this.hasErrors = this.itemCollection.extendedData.CheckResults.find(item => item && item.HasErrors) != null;
            this.hasWarnings = this.itemCollection.extendedData.CheckResults.find(item => item && item.HasWarnings) != null;
        }
    }

    public getItems(filter: (item: PortalCartitem) => boolean): PortalCartitem[] {
        return this.itemCollection && this.itemCollection.Data ? this.itemCollection.Data.filter(filter) : undefined;
    }

    public getItemsSorted(): PortalCartitem[] {
        if (this.itemCollection && this.itemCollection.Data) {
            return this.itemCollection.Data
                .map(cartItem => ({
                    recursiveId: this.getRecursiveId(cartItem),
                    cartItem
                }))
                .sort((item1, item2) => item1.recursiveId.localeCompare(item2.recursiveId))
                .map(cartItemWithRecursiveId => cartItemWithRecursiveId.cartItem);
        }

        return undefined;
    }

    public getCartItemCheckResult(cartItem: PortalCartitem): CartItemCheckResult {
        return this.itemCollection && this.itemCollection.extendedData && this.itemCollection.extendedData.CheckResults ?
            this.itemCollection.extendedData.CheckResults.find(item =>
                item != null && item.UidShoppingCartItem === cartItem.GetEntity().GetKeys()[0]
            )
        : undefined;
    }

    public hasParent(child: PortalCartitem): boolean {
        return this.getItem(child.UID_ShoppingCartItemParent.value) != null;
    }

    public getItem(uid: string): PortalCartitem {
        return this.itemCollection && this.itemCollection.Data &&
            this.itemCollection.Data.find(item => item.GetEntity().GetKeys()[0] === uid);
    }

    private getRecursiveId(cartItem: PortalCartitem): string {
        const key = cartItem.GetEntity().GetKeys()[0];
        const parentUid = cartItem.UID_ShoppingCartItemParent.value;

        if (parentUid != null && parentUid.length > 0 && parentUid !== key) {
            const parent = this.getItem(parentUid);

            if (parent) {
                return `${this.getRecursiveId(parent)}_${key}`;
            }
        }

        return key;
    }
}
