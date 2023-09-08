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

import { CartCheckResult, PortalCartitem } from 'imx-api-qer';
import { CartItemValidationStatus } from './cart-items/cart-item-validation-status.enum';
import { CartItemValidationResult } from './cart-item-validation-overview/cart-item-validation-result.interface';

export class ShoppingCartValidator {
  public readonly hasErrors: boolean;
  public readonly hasWarnings: boolean;

  constructor(private readonly result: CartCheckResult) {
    this.hasErrors = this.result.HasErrors;
    this.hasWarnings = this.result.HasWarnings;
  }

  public getWarnings(getCartItem: (uid: string) => PortalCartitem): CartItemValidationResult[] {
    const cartItemsResults: CartItemValidationResult[] = [];
    this.result.Items
      .filter(result => result.HasWarnings)
      .forEach(result => {
        const failedChecks = result.Checks.filter(check => check.Status !== CartItemValidationStatus.success);
        if (failedChecks.length > 0) {
          const cartItem = getCartItem(result.UidShoppingCartItem);
          cartItemsResults.push({
            checkResult: {
              ...result,
              ...{
                Checks: failedChecks
              }
            },
            personOrderedDisplay: cartItem.UID_PersonOrdered.Column.GetDisplayValue(),
            cartItemDisplay: cartItem.GetEntity().GetDisplay()
          });
        }
      });

    return cartItemsResults;
  }
}
