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

import { Component } from '@angular/core';

import { PortalCartitem } from '@imx-modules/imx-api-qer';
import { ParameterizedText } from 'qbm';
import { CartItemsService } from '../cart-items.service';
import { CartItemLogic } from './cart-item-logic.interface';

/** Default display component for cart items; simply displaying the service item. */
@Component({
  template: `<div data-imx-identifier="default-cart-item-display">{{ cartItem.GetEntity().GetDisplay() }}</div>
    <div subtitle>
      <span>{{ '#LDS#Recipient' | translate }}: </span>
      <span data-imx-identifier="default-cart-item-recipient">{{ cartItem.UID_PersonOrdered?.Column?.GetDisplayValue() }}</span>
    </div>
    <div *ngIf="parameterizedText">
      <imx-parameterized-text [parameterizedText]="parameterizedText"></imx-parameterized-text>
    </div>`,
  styleUrls: ['./default-cart-item-display.component.scss'],
})
export class DefaultCartItemDisplayComponent implements CartItemLogic {
  private _cartItem: PortalCartitem;
  public get cartItem(): PortalCartitem {
    return this._cartItem;
  }
  public set cartItem(val) {
    this._cartItem = val;
    this.setPText();
  }

  public parameterizedText: ParameterizedText | null;

  constructor(public readonly cartItemSvc: CartItemsService) {}

  private setPText() {
    if (this.cartItem.Assignment?.value) {
      this.parameterizedText = {
        value: this.cartItem.Assignment.value,
        marker: { start: '"%', end: '%"' },
        getParameterValue: (columnName) => this.cartItem.GetEntity().GetColumn(columnName).GetDisplayValue(),
      };
    } else {
      this.parameterizedText = null;
    }
  }
}
