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

import { Component, ViewEncapsulation, Inject, OnDestroy } from '@angular/core';
import { EUI_SIDESHEET_DATA, EuiSidesheetRef } from '@elemental-ui/core';
import { Subscription } from 'rxjs';

import { ITShopConfig, PortalItshopApproveHistory } from 'imx-api-qer';
import { AuthenticationService } from 'qbm';
import { Approval } from '../approval';
import { WorkflowActionService } from '../workflow-action/workflow-action.service';
import { ItshopService } from '../../itshop/itshop.service';

@Component({
  selector: 'imx-approvals-sidesheet',
  templateUrl: './approvals-sidesheet.component.html',
  styleUrls: ['./approvals-sidesheet.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class ApprovalsSidesheetComponent implements OnDestroy {
  public readonly hasPeerGroupAnalysis: boolean;

  public currentUserId: string;

  private readonly subscriptions: Subscription[] = [];

  constructor(
    @Inject(EUI_SIDESHEET_DATA)
    public readonly data: {
      pwo: Approval;
      itShopConfig: ITShopConfig;
    },
    public readonly actionService: WorkflowActionService,
    private readonly sideSheetRef: EuiSidesheetRef,
    itshop: ItshopService,
    authentication: AuthenticationService
  ) {
    this.subscriptions.push(this.actionService.applied.subscribe(() => this.sideSheetRef.close()));
    this.subscriptions.push(authentication.onSessionResponse.subscribe((state) => (this.currentUserId = state.UserUid)));

    if (this.data.pwo.pwoData?.WorkflowHistory) {
      const history = itshop.createTypedHistory(this.data.pwo.pwoData);
      this.hasPeerGroupAnalysis = history.some((item) =>
        ['EXWithPeerGroupAnalysis', 'Peer group analysis'].includes(item.Ident_PWODecisionStep.value)
      );
    }
  }

  public ngOnDestroy(): void {
    this.subscriptions.forEach((s) => s.unsubscribe());
  }

  public async acceptTermsOfUse(): Promise<void> {
    /* TODO #241926
    lock DoApprove as long as MustApproveTermsOfUse is true for a PWOToDecide

    QER_ITShop_AcceptTermsOfUse({
        HeaderText: '#LDS#You must accept the terms of use before proceeding.',
        AccProductFilter: this.SelectedRequest.UID_AccProduct.value,
        OnTermsOfUseAccepted: () => {
            this.session.Client.termsofuse_accept_post(bla);
            // TODO later: trigger reload of decision history for this request
            this.router.navigate(["form:Approvals"], {});
        }
    });
    */
  }

  public canDenyApproval(): boolean {
    return this.data.pwo.canDenyApproval(this.currentUserId);
  }

  public askForHelp(): void {
    // TODO later
    // this.dialog.open(QueryPersonComponent);
  }

  public showEntireRequest(): void {
    /* TODO later
    RedirectFormModule({ "ScriptItemUID": "RedirectForm1", "ID": "VI_ITShop_PWOOverviewForShoppingCartOrder" }, () => {
        VirtualTableMapping({ "ScriptItemUID": "VirtualTableMapping7", "VirtualTable": "PersonWantsOrg", "DataTable": "PWOToDecide" });
    });
    */
  }

  public modifyPriority(): void {
    // TODO later
  }
}
