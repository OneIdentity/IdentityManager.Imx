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

import { PortalCartitem, CartItemDataRead } from 'imx-api-qer';
import { ShoppingCart } from './shopping-cart';

describe('ShoppingCart', () => {
  function createCartItem(item: { key: string; parent: string; } = { key: 'b', parent: undefined }) {
    return {
        GetEntity: () => ({
            GetKeys: () => [item.key]
        }),
        OrderReason: {},
        PWOPriority: {},
        RequestType: {},
        ValidFrom: {},
        ValidUntil: {},
        UID_ShoppingCartItemParent: { value: item.parent }
    } as PortalCartitem;
  }

  it('should be created', () => {
    const data = [createCartItem()];
    const itemCollection = {
        totalCount: data.length + 123,
        Data: data
    };
    const shoppingCart = new ShoppingCart(itemCollection);

    expect(shoppingCart.totalCount).toEqual(itemCollection.totalCount);
    expect(shoppingCart.numberOfItems).toEqual(data.length);
    expect(shoppingCart.hasErrors).toBeFalsy();
    expect(shoppingCart.hasWarnings).toBeFalsy();
  });

  [
    { checkResults: undefined, expected: { hasErrors: false, hasWarnings: false } },
    { checkResults: [], expected: { hasErrors: false, hasWarnings: false } },
    { checkResults: [ undefined, {}, { HasErrors: true, HasWarnings: true } ], expected: { hasErrors: true, hasWarnings: true } },
    { checkResults: [ { HasErrors: true }, { HasWarnings: true } ], expected: { hasErrors: true, hasWarnings: true } },
    { checkResults: [ { HasErrors: false }, { HasWarnings: true } ], expected: { hasErrors: false, hasWarnings: true } },
    { checkResults: [ { HasErrors: true }, { HasWarnings: false } ], expected: { hasErrors: true, hasWarnings: false } }
  ].forEach(testcase =>
  it('validates', () => {
    const data = [createCartItem()];
    const itemCollection = {
        totalCount: data.length,
        Data: data,
        extendedData: {
            CheckResults: testcase.checkResults
        } as CartItemDataRead
    };
    const shoppingCart = new ShoppingCart(itemCollection);

    expect(shoppingCart.hasErrors).toEqual(testcase.expected.hasErrors);
    expect(shoppingCart.hasWarnings).toEqual(testcase.expected.hasWarnings)
  }));

  it('gets items', () => {
    const keys = ['b', 'a'];
    const data = keys.map(key => createCartItem({ key, parent: undefined }));
    const itemCollection = {
        totalCount: data.length,
        Data: data
    };
    const shoppingCart = new ShoppingCart(itemCollection);

    expect(shoppingCart.getItems(item => item.GetEntity().GetKeys()[0] === keys[0]).length).toEqual(1);
  });

  it('gets items sorted', () => {
    const itemFirst = { key: 'b', parent: undefined };
    const itemLast = { key: 'a', parent: 'd' };
    const items = [{ key: 'd', parent: undefined }, itemLast, itemFirst, { key: 'e', parent: 'b' }, { key: 'c', parent: 'e' }];
    const data = items.map(item => createCartItem(item));

    const shoppingCart = new ShoppingCart({
        totalCount: data.length,
        Data: data
    });

    const itemsSorted = shoppingCart.getItemsSorted();

    expect(itemsSorted[0].GetEntity().GetKeys()[0]).toEqual(itemFirst.key);
    expect(itemsSorted[items.length - 1].GetEntity().GetKeys()[0]).toEqual(itemLast.key);
  });

  it('gets CartItemCheckResult', () => {
    const itemToCheck = { key: 'a', parent: undefined };
    const items = [itemToCheck,  { key: 'b', parent: undefined }];
    const data = items.map(item => createCartItem(item));

    const shoppingCart = new ShoppingCart({
        totalCount: data.length,
        Data: data,
        extendedData: {
            CheckResults: [{ UidShoppingCartItem: itemToCheck.key }]
        } as CartItemDataRead
    });

    const checkResult = shoppingCart.getCartItemCheckResult(createCartItem(itemToCheck));

    expect(checkResult.UidShoppingCartItem).toEqual(itemToCheck.key);
  });

  [
    true, false
  ].forEach(expectedParent =>
  it('checks if cart item has parent', () => {
    const itemToCheck = { key: 'a', parent: expectedParent ? 'b' : undefined };
    const items = [itemToCheck, { key: 'b', parent: undefined }];
    const data = items.map(item => createCartItem(item));

    const shoppingCart = new ShoppingCart({
        totalCount: data.length,
        Data: data
    });

    const hasParent = shoppingCart.hasParent(createCartItem(itemToCheck));

    expect(hasParent).toEqual(expectedParent);
  }));
});
