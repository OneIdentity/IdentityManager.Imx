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
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { ICartItemCheck } from 'imx-api-qer';
import { getCartItemValidationStatus } from './cart-items/cart-item-validation-status.enum';

@Component({
  selector: 'imx-shopping-cart-submit-result',
  templateUrl: './shopping-cart-submit-warnings.dialog.html',
  styleUrls: ['./shopping-cart-submit-warnings.dialog.scss']
})
// tslint:disable-next-line: component-class-suffix
export class ShoppingCartSubmitWarningsDialog {
  constructor(
    public dialogRef: MatDialogRef<ShoppingCartSubmitWarningsDialog>,
    @Inject(MAT_DIALOG_DATA) public readonly data: any
  ) { }

  public getStatus(check: ICartItemCheck): { status: string, icon: string } {
    return getCartItemValidationStatus(check);
  }
}
