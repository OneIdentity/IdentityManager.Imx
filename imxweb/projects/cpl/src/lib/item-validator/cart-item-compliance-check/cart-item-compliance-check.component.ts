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
 * Copyright 2021 One Identity LLC.
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

import { AfterViewInit, Component, OnInit } from '@angular/core';
import { EuiLoadingService, EuiSidesheetService } from '@elemental-ui/core';
import { TranslateService } from '@ngx-translate/core';
import { PortalRules } from 'imx-api-cpl';
import { ICartItemCheck } from 'imx-api-qer';
import { DetailsView } from 'qer';
import { ComplianceViolationDetailsComponent } from '../../request/compliance-violation-details/compliance-violation-details.component';
import { ItemValidatorService } from '../item-validator.service';

@Component({
  selector: 'imx-cart-item-compliance-check',
  templateUrl: './cart-item-compliance-check.component.html',
  styleUrls: ['./cart-item-compliance-check.component.scss'],
})
export class CartItemComplianceCheckComponent implements DetailsView, AfterViewInit {
  public check: ICartItemCheck;
  public cartItemDisplay: string;
  public detail: any;

  private readonly applicableRules: ApplicableRule[] = [];
  private portalRules: PortalRules[] = [];

  constructor(
    private readonly validator: ItemValidatorService,
    private readonly sidesheetService: EuiSidesheetService,
    private readonly translateService: TranslateService,
    private readonly busy: EuiLoadingService,
  ) {

  }

  public ngOnInit(): void {
    if (this.check) {
      this.detail = this.check.Detail;
   }
  }

  public async ngAfterViewInit(): Promise<void> {
    this.busy.show();

    try {
      this.portalRules = (await this.validator.getRules()).Data;

      this.check.Detail.Violations.forEach((item) => {
        const rule = this.portalRules.find((x) => x.GetEntity().GetKeys()[0] === item.UidComplianceRule);
        if (rule) {
          this.applicableRules.push({ rule: rule, violationDetail: item });
        }
      });
    } finally {
      this.busy.hide();
    }
  }

  public async onOpenDetails(): Promise<void> {
    this.sidesheetService.open(ComplianceViolationDetailsComponent, {
      title: await this.translateService.get('#LDS#Heading View Rule Violation Details').toPromise(),
      width: '800px',
      bodyColour: 'asher-gray',
      headerColour: 'iris-blue',
      data: this.applicableRules,
      testId: 'violation-details'
    });
  }
}

export interface ApplicableRule {
  rule?: PortalRules;
  violationDetail: ViolationDetail;
}

export interface ViolationDetail {
  DisplayElement: string;
  DisplayPerson: string;
  DisplayRule: string;
  IsNoEffectivePerson: boolean;
  ObjectKeyElement: string;
  UidComplianceRule: string;
  UidComplianceSubRule: string;
  UidPerson: string;
  UidPersonWantsOrg: string;
  UidShoppingCartItem: string;
  ViolationType: string;
  ContributingEntitlements: DetailContributingEntitlements[];
}

export interface DetailContributingEntitlements {
  Display: string;
  ObjectKeyEntitlement: string;
}
