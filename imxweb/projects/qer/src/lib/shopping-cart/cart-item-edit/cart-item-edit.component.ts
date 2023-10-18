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

import { ChangeDetectorRef, Component, Inject, OnDestroy, QueryList, ViewChildren } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { EuiSidesheetRef, EUI_SIDESHEET_DATA } from '@elemental-ui/core';
import { Subscription } from 'rxjs';

import { CartItemEditParameter } from './cart-item-edit-parameter.interface';
import { PortalCartitem } from 'imx-api-qer';
import { CartItemsService } from '../cart-items.service';
import { IEntityColumn } from 'imx-qbm-dbts';
import { ConfirmationService, EntityColumnEditorComponent } from 'qbm';

@Component({
  templateUrl: './cart-item-edit.component.html',
  selector: 'imx-cart-item-edit',
  styleUrls: ['./cart-item-edit.component.scss'],
})
export class CartItemEditComponent implements OnDestroy {
  public readonly shoppingCartItem: PortalCartitem;
  public readonly cartItemForm = new UntypedFormGroup({});
  public columns: IEntityColumn[];
  private readonly subscriptions: Subscription[] = [];

  @ViewChildren(EntityColumnEditorComponent) editors: QueryList<EntityColumnEditorComponent>;

  constructor(
    @Inject(EUI_SIDESHEET_DATA) public readonly data: CartItemEditParameter,
    public readonly cartItemSvc: CartItemsService,
    public readonly sideSheetRef: EuiSidesheetRef,
    confirmation: ConfirmationService,
    changeDetector: ChangeDetectorRef
  ) {
    this.shoppingCartItem = this.data.entityWrapper.typedEntity;

    this.initColumns();

    if (data.updated) {
      this.subscriptions.push(
        data.updated.subscribe(() => {
          this.editors.forEach((elem) => elem.update());
          changeDetector.detectChanges();
        })
      );
    }
    this.subscriptions.push(
      sideSheetRef.closeClicked().subscribe(async () => {
        if (this.cartItemForm.dirty && !(await confirmation.confirmLeaveWithUnsavedChanges())) {
          return;
        }

        sideSheetRef.close(false);
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((s) => s.unsubscribe());
  }

  private initColumns(): void {
    let defaultColumns = [this.shoppingCartItem.OrderReason.Column, this.shoppingCartItem.UID_QERJustificationOrder.Column];
    if (!this.data.multiple) {
      defaultColumns.push(this.shoppingCartItem.PWOPriority.Column);
    }
    if (this.shoppingCartItem.RequestType.value === 'Prolongate' && !this.data.multiple) {
      defaultColumns.push(this.shoppingCartItem.ProlongationDate.Column);
    } else if (['Unsubscribe', 'UnsubscribeWithDate'].includes(this.shoppingCartItem.RequestType.value) && !this.data.multiple) {
      defaultColumns.push(this.shoppingCartItem.ValidUntilUnsubscribe.Column);
    } else {
      defaultColumns.push(this.shoppingCartItem.ValidFrom.Column, this.shoppingCartItem.ValidUntil.Column);
    }

    this.columns = this.mergeColumns(
      (this.data.entityWrapper.parameterCategoryColumns ?? []).map((item) => item.column),
      defaultColumns
    );
  }

  private mergeColumns(columns: IEntityColumn[], columnsToAdd: IEntityColumn[]): IEntityColumn[] {
    return [...columns, ...columnsToAdd.filter((columnToAdd) => !columns.find((column) => column.ColumnName === columnToAdd.ColumnName))];
  }
}
