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
import { EuiSidesheetRef, EUI_SIDESHEET_DATA } from '@elemental-ui/core';

import { ColumnDependentReference } from 'qbm';
import { RulesViolationsApproval } from '../rules-violations-approval';
import { RulesViolationsActionService } from '../rules-violations-action/rules-violations-action.service';

/**
 * A sidesheet component to show some information about the selected rules violation.
 */
@Component({
  selector: 'imx-rules-violations-details',
  templateUrl: './rules-violations-details.component.html',
  styleUrls: ['./rules-violations-details.component.scss']
})
export class RulesViolationsDetailsComponent {

  public cdrList: ColumnDependentReference[] = [];

  constructor(
    @Inject(EUI_SIDESHEET_DATA) public data: RulesViolationsApproval,
    private readonly actionService: RulesViolationsActionService,
    private readonly sideSheetRef: EuiSidesheetRef
  ) {
    this.cdrList = this.data.propertyInfo;
  }

  /**
   * Opens the Approve-Sidesheet for the current selected rules violations and closes the sidesheet afterwards.
   */
  public async approve(): Promise<void> {
    await this.actionService.approve([this.data]);
    return this.sideSheetRef.close(true);
  }

  /**
   * Opens the Deny-Sidesheet for the current selected rules violations and closes the sidesheet afterwards.
   */
  public async deny(): Promise<void> {
    await this.actionService.deny([this.data]);
    return this.sideSheetRef.close(true);
  }

  public async resolve(): Promise<void> {
    await this.actionService.resolve(this.data);
    return this.sideSheetRef.close(true);
  }
}
