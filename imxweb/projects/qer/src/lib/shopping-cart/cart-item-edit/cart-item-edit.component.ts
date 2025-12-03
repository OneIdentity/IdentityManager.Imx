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

import { ChangeDetectorRef, Component, Inject, OnDestroy, OnInit, QueryList, ViewChildren } from '@angular/core';
import { AbstractControl, UntypedFormGroup } from '@angular/forms';
import { EUI_SIDESHEET_DATA, EuiSidesheetRef } from '@elemental-ui/core';
import { Subscription } from 'rxjs';

import { PortalCartitem } from '@imx-modules/imx-api-qer';
import { IEntityColumn } from '@imx-modules/imx-qbm-dbts';
import { ConfirmationService, EntityColumnEditorComponent } from 'qbm';
import { CartItemsService } from '../cart-items.service';
import { CartItemEditParameter } from './cart-item-edit-parameter.interface';

@Component({
  templateUrl: './cart-item-edit.component.html',
  selector: 'imx-cart-item-edit',
  styleUrls: ['./cart-item-edit.component.scss'],
})
export class CartItemEditComponent implements OnInit, OnDestroy {
  public readonly shoppingCartItem: PortalCartitem;
  public readonly cartItemForm = new UntypedFormGroup({});
  public formGroupIsPending = false;
  public columns: IEntityColumn[];
  private readonly subscriptions: Subscription[] = [];
  public orderReasonType: number;

  private justificationRequiresText: boolean = false;

  @ViewChildren(EntityColumnEditorComponent) editors: QueryList<EntityColumnEditorComponent>;

  constructor(
    @Inject(EUI_SIDESHEET_DATA) public readonly data: CartItemEditParameter,
    public readonly cartItemSvc: CartItemsService,
    public readonly sideSheetRef: EuiSidesheetRef,
    confirmation: ConfirmationService,
    private readonly changeDetector: ChangeDetectorRef,
  ) {
    this.shoppingCartItem = this.data.entityWrapper.typedEntity;

    this.initColumns();

    if (data.updated) {
      this.subscriptions.push(
        data.updated.subscribe(() => {
          this.editors.forEach((elem) => elem.update());
          changeDetector.detectChanges();
        }),
      );
    }
    this.subscriptions.push(
      sideSheetRef.closeClicked().subscribe(async () => {
        if (this.cartItemForm.dirty && !(await confirmation.confirmLeaveWithUnsavedChanges())) {
          return;
        }

        sideSheetRef.close(false);
      }),
    );
  }

  public async ngOnInit(): Promise<void> {
    this.justificationRequiresText = await this.cartItemSvc.getJustificationTextIsRequired(
      this.shoppingCartItem.UID_QERJustificationOrder.value,
    );

    this.shoppingCartItem.UID_QERJustificationOrder.Column.ColumnChanged.subscribe(async () => {
      this.justificationRequiresText = await this.cartItemSvc.getJustificationTextIsRequired(
        this.shoppingCartItem.UID_QERJustificationOrder.value,
      );
    });
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((s) => s.unsubscribe());
  }

  public onPendingChanged(value: boolean) {
    this.formGroupIsPending = value;
  }

  /**
   * Adds a control to the card item after creation.
   * Removes old control with the name, to make sure, the new one is added correctly
   * @param name the name of the control
   * @param control the abstract control, that is registered
   */
  public addControlToCartItemForm(name: string, control: AbstractControl): void {
    this.cartItemForm.removeControl(name);
    this.changeDetector.detectChanges();
    this.cartItemForm.addControl(name, control);
    this.changeDetector.detectChanges();
    control.updateValueAndValidity({ onlySelf: false, emitEvent: true });
  }

  public isMandatory(column: IEntityColumn): boolean {
    switch (column.ColumnName) {
      case 'OrderReason':
        return this.orderReasonType === 2 || this.justificationRequiresText;
      case 'UID_QERJustificationOrder':
        return this.orderReasonType === 1;
    }

    return false;
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

    this.orderReasonType = this.shoppingCartItem.OrderReasonType.value;

    this.columns = this.mergeColumns(
      (this.data.entityWrapper.parameterCategoryColumns ?? []).map((item) => item.column),
      defaultColumns,
    );
  }

  private mergeColumns(columns: IEntityColumn[], columnsToAdd: IEntityColumn[]): IEntityColumn[] {
    return [...columns, ...columnsToAdd.filter((columnToAdd) => !columns.find((column) => column.ColumnName === columnToAdd.ColumnName))];
  }
}
