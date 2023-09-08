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

import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { first } from 'rxjs/operators';

import { PendingItemsType } from '../user/pending-items-type.interface';
import { UserModelService } from '../user/user-model.service';
import { HELP_CONTEXTUAL, HelpContextualValues } from 'qbm';

@Component({
  templateUrl: './approvals.component.html',
  selector: 'imx-itshop-approvals',
  styleUrls: ['./approvals.component.scss'],
})
export class ApprovalsComponent implements OnInit {
  public params: Params = {};
  public tabIndex = 0;
  public hasInquiries = false;
  public viewReady = false;

  constructor(
    private readonly activatedRoute: ActivatedRoute,
    private readonly usermodelService: UserModelService
  ) {}

  public async ngOnInit(): Promise<void> {
    try {
      const pendingItems: PendingItemsType = await this.usermodelService.getPendingItems();
      this.hasInquiries = pendingItems.OpenInquiries > 0;
      const queryParams = await this.activatedRoute.queryParams.pipe(first()).toPromise();
      const result = {};
      for (const [key, value] of Object.entries(queryParams)) {
        result[key.toLowerCase()] = value;
      }

      this.params = result;

      if (this.params.inquiries) {
        this.tabIndex = 1;
        this.hasInquiries = true;}
    } finally {
      this.viewReady = true;
    }
  }

  public get contextId(): HelpContextualValues{
    if(this.tabIndex === 0){
      return HELP_CONTEXTUAL.PendingRequest;
    }else{
      return HELP_CONTEXTUAL.PendingRequestInquiries;
    }
  }
}
