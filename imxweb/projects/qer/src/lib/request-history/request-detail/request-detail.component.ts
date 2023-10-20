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


import { Component, Inject, OnDestroy } from '@angular/core';
import { EUI_SIDESHEET_DATA, EuiSidesheetRef } from '@elemental-ui/core';
import { Subscription } from 'rxjs';

import { RequestDetailParameter } from './request-detail-parameter.interface';
import { RequestActionService } from '../request-action/request-action.service';

@Component({
  templateUrl: './request-detail.component.html',
  selector: 'imx-request-detail',
  styleUrls: ['./request-detail.component.scss']

})
export class RequestDetailComponent implements OnDestroy {
  public readonly allowedActionCount: number;

  private readonly subscriptions: Subscription[] = [];

  constructor(
    @Inject(EUI_SIDESHEET_DATA) public readonly data: RequestDetailParameter,
    public readonly actionService: RequestActionService,
    private readonly sideSheetRef: EuiSidesheetRef
  ) {
    this.allowedActionCount =
      data.disableActions === true
        ? 0
        : [
            // TODO Later: this.data.personWantsOrg.ResendRequestAllowed.value,
            this.data.personWantsOrg.canProlongate,
            this.data.personWantsOrg.CancelRequestAllowed.value,
            this.data.personWantsOrg.canWithdrawDelegation && this.data.itShopConfig.VI_ITShop_OrderHistory_CancelOrder,
            this.data.personWantsOrg.canWithdrawAdditionalApprover && this.data.itShopConfig.VI_ITShop_OrderHistory_CancelOrder,
            this.data.personWantsOrg.canRecallLastQuestion,
            this.data.personWantsOrg.canRevokeHoldStatus,
            this.data.personWantsOrg.canRecallDecision,
            this.data.personWantsOrg.canCopyItems,
            this.data.personWantsOrg.UnsubscribeRequestAllowed.value,
          ].filter((condition) => condition).length;

    this.subscriptions.push(this.actionService.applied.subscribe(() => this.sideSheetRef.close(true)));
  }

  public ngOnDestroy(): void {
    this.subscriptions.forEach(s => s.unsubscribe());
  }

  // ToDo later
  // public submitAgain(): void {
  //     // TODO VI_ITShop_PersonWantsOrg_Resubmit({ PersonWantsOrg: PersonWantsOrg});
  //     // Benötigt den ShoppingCart Branch
  //    this.dialogRef.close(this.reload);
  // }
}
