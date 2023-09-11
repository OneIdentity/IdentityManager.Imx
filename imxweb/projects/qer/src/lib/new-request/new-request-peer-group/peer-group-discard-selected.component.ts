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

import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

import { NewRequestAddToCartService } from '../new-request-add-to-cart.service';
import { NewRequestSelectionService } from '../new-request-selection.service';

/** 
 * Component that is displayed when more than one Recipient and at least one product has 
 * been selected, asking the user how to handle this situation.
*/
@Component({
  selector: 'imx-peer-group-discard-selected',
  templateUrl: './peer-group-discard-selected.component.html',
  styleUrls: ['./peer-group-discard-selected.component.scss'],
})
export class PeerGroupDiscardSelectedComponent implements OnInit, OnDestroy {
  
  public readonly dialogMessage =
    '#LDS#Recommended products can only be displayed for one recipient, but you have selected multiple recipients. If you proceed, the selected recipients are reset to one recipient and you have to add your selected products to the shopping cart or discard them.';

  private readonly subscriptions: Subscription[] = [];
  
  constructor(
    private readonly router: Router,
    private readonly selection: NewRequestSelectionService,
    private readonly addToCartService: NewRequestAddToCartService,
    private readonly dialogRef: MatDialogRef<PeerGroupDiscardSelectedComponent>
  ) {
    this.subscriptions.push(
      this.dialogRef.keydownEvents().subscribe(event => {
        if (event.key === 'Escape') {
            this.onDoNotDiscardSelection();
        }
      }),
      this.dialogRef.backdropClick().subscribe(() => {
        this.onDoNotDiscardSelection()     
      })
    );
  }

  /**
   * @ignore Used internally.
   */
  public ngOnInit(): void {}

  /**
   * @ignore Used internally.
   */
  public ngOnDestroy(): void {
    this.subscriptions.forEach(s => s.unsubscribe());
  }

  /**
   * Action, when the user clicks on the "No" button or on the backdrop.
   */
  public onDoNotDiscardSelection(): void {
    this.router.navigate(['newrequest/allProducts']);
    this.dialogRef.close(false);
  }

  /**
   * Action, when the user clicks on the "Discard and proceed" button.
   */
  public onDiscardSelection(): void {
    this.selection.clearProducts();
    this.dialogRef.close(true);
  }

  /**
   * Action, when the user clicks on the "Add products to cart and proceed" button.
   */
  public async onAddToCart(): Promise<void> {
    await this.addToCartService.addItemsToCart();
    this.dialogRef.close(true);
  }
}
