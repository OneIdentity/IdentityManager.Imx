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

import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { PendingItemsType } from '../../user/pending-items-type.interface';
import { UserModelService } from '../../user/user-model.service';
import { DashboardService } from '../../wport/start/dashboard.service';

@Component({
  selector: 'imx-shopping-cart-button',
  templateUrl: './shopping-cart-button.component.html',
  styleUrls: ['./shopping-cart-button.component.scss'],
})
export class ShoppingCartButtonComponent implements OnInit {
  public pendingItems: PendingItemsType;

  public LdsTooltip = '#LDS#Shopping cart';

  constructor(
    private readonly router: Router,
    private readonly dashboardService: DashboardService,
    private readonly userModelSvc: UserModelService,
  ) {}

  public async ngOnInit(): Promise<void> {
    this.userModelSvc.onPendingItemsChange.subscribe(async () => {
      this.pendingItems = await this.userModelSvc.getPendingItems();
    });
    const busy = this.dashboardService.beginBusy();

    try {
      this.pendingItems = await this.userModelSvc.getPendingItems();
    } finally {
      busy.endBusy();
    }
  }

  /**
   * Navigates to the shopping cart page.
   */
  public navigateToShoppingCart(): void {
    this.router.navigate(['shoppingcart']);
  }
}
