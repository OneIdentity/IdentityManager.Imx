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

import { Component, Inject } from '@angular/core';

import { CartItemValidationResult } from './cart-item-validation-result.interface';
import { ICartItemCheck } from 'imx-api-qer';
import { CartItemValidationStatus, getCartItemValidationStatus } from '../cart-items/cart-item-validation-status.enum';
import { EUI_SIDESHEET_DATA } from '@elemental-ui/core';

@Component({
  selector: 'imx-cart-item-validation-overview',
  templateUrl: './cart-item-validation-overview.component.html',
  styleUrls: ['./cart-item-validation-overview.component.scss']
})
export class CartItemValidationOverviewComponent {
  public checks: ICartItemCheck[][] = [];

    constructor(@Inject(EUI_SIDESHEET_DATA) public readonly data: CartItemValidationResult) {
    const checks = this.data.checkResult.Checks;

    this.checks.push(checks.filter(item => item.Status === CartItemValidationStatus.error));
    this.checks.push(checks.filter(item => item.Status === CartItemValidationStatus.warning));
    this.checks.push(checks.filter(item => item.Status === CartItemValidationStatus.disabled));
    this.checks.push(checks.filter(item => item.Status === CartItemValidationStatus.pending));
    this.checks.push(checks.filter(item => item.Status === CartItemValidationStatus.success));
  }

  public getStatus(check: ICartItemCheck): { status: string, icon: string } {
    return getCartItemValidationStatus(check);
  }

  public isError(check: ICartItemCheck): boolean {
    return check.Status === CartItemValidationStatus.error;
  }

  public isWarning(check: ICartItemCheck): boolean {
    return check.Status === CartItemValidationStatus.warning;
  }

}
