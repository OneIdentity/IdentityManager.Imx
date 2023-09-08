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

import { Component } from '@angular/core';
import { EuiSidesheetService } from '@elemental-ui/core';
import { TranslateService } from '@ngx-translate/core';

import { ICartItemCheck } from 'imx-api-qer';
import { ComplianceViolationDetailsComponent } from '../../request/compliance-violation-details/compliance-violation-details.component';

@Component({
  selector: 'imx-cart-item-compliance-check',
  templateUrl: './cart-item-compliance-check.component.html',
  styleUrls: ['./cart-item-compliance-check.component.scss'],
})
export class CartItemComplianceCheckComponent {
  public check: ICartItemCheck;

  constructor(
    private readonly sidesheetService: EuiSidesheetService, 
    private readonly translateService: TranslateService
  ) {}

  public async onOpenDetails(): Promise<void> {
    this.sidesheetService.open(ComplianceViolationDetailsComponent, {
      title: await this.translateService.get('#LDS#Heading View Rule Violation Details').toPromise(),
      width: 'max(550px,50%)',
      padding: '0px',
      data: this.check,
      testId: 'cart-item-compliance-violation-details',
    });
  }
}

