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

import { Component, Inject } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { EuiSidesheetRef, EUI_SIDESHEET_DATA } from '@elemental-ui/core';

import { CartItemEditParameter } from './cart-item-edit-parameter.interface';
import { PortalCartitem } from 'imx-api-qer';
import { CartItemsService } from '../cart-items.service';
import { IEntityColumn } from 'imx-qbm-dbts';

@Component({
  templateUrl: './cart-item-edit.component.html',
  selector: 'imx-cart-item-edit',
  styleUrls: ['./cart-item-edit.component.scss']
})
export class CartItemEditComponent {
  public readonly shoppingCartItem: PortalCartitem;
  public readonly cartItemForm = new FormGroup({});
  public readonly columns: IEntityColumn[];

  constructor(
    @Inject(EUI_SIDESHEET_DATA) public readonly data: CartItemEditParameter,
    public readonly cartItemSvc: CartItemsService,
    public readonly sideSheetRef: EuiSidesheetRef
  ) {
    this.shoppingCartItem = this.data.entityWrapper.typedEntity;

    const defaultColumns = [
      this.shoppingCartItem.OrderReason.Column,
      this.shoppingCartItem.UID_QERJustificationOrder.Column,
      this.shoppingCartItem.PWOPriority.Column
    ];

    if (this.shoppingCartItem.RequestType.value === 'Prolongate') {
      defaultColumns.push(this.shoppingCartItem.ProlongationDate.Column);
    } else if (['Unsubscribe', 'UnsubscribeWithDate'].includes(this.shoppingCartItem.RequestType.value)) {
      defaultColumns.push(this.shoppingCartItem.ValidUntilUnsubscribe.Column);
    } else {
      defaultColumns.push(
        this.shoppingCartItem.ValidFrom.Column,
        this.shoppingCartItem.ValidUntil.Column
      );
    }

    this.columns = this.mergeColumns(
      (this.data.entityWrapper.parameterCategoryColumns ?? []).map(item => item.column),
      defaultColumns
    );
  }

  private mergeColumns(columns: IEntityColumn[], columnsToAdd: IEntityColumn[]): IEntityColumn[] {
    return [
      ...columns,
      ...columnsToAdd.filter(columnToAdd => !columns.find(column => column.ColumnName === columnToAdd.ColumnName))
    ];
  }
}
