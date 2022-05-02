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

import { Component, Inject, Input, OnInit } from '@angular/core';
import { EuiLoadingService, EUI_SIDESHEET_DATA } from '@elemental-ui/core';
import { EntitySchema } from 'imx-qbm-dbts';
import { RequestParameterDataEntity } from 'qer';
import { ApplicableRule, ViolationDetail } from '../../item-validator/cart-item-compliance-check/cart-item-compliance-check.component';
import { ItemValidatorService } from '../../item-validator/item-validator.service';
import { ComplianceViolationService } from './compliance-violation.service';

@Component({
  selector: 'imx-compliance-violation-details',
  templateUrl: './compliance-violation-details.component.html',
  styleUrls: ['./compliance-violation-details.component.scss'],
})
export class ComplianceViolationDetailsComponent implements OnInit {
  @Input() public pwoId: string;
  @Input() public request: RequestParameterDataEntity;

  public rules: ApplicableRule[];
  public schema: EntitySchema;

  private applicableRulesLoaded = false;

  constructor(
    private readonly validator: ItemValidatorService,
    private complianceApi: ComplianceViolationService,
    private readonly loadingService: EuiLoadingService,
    @Inject(EUI_SIDESHEET_DATA) public data?: ApplicableRule[]
  ) {
    this.schema = this.validator.getRulesSchema();

    if (data && this.isAnApplicableRuleList(data)) {
      this.rules = data;
      this.applicableRulesLoaded = true;
    }
  }

  public async ngOnInit(): Promise<void> {
    const ref = this.loadingService.show();

    try {
      if (!this.applicableRulesLoaded) {
        const violations = await this.complianceApi.getRequestViolations(this.pwoId);
        this.rules = [];

        violations.forEach(violation => {
          this.rules.push({
            violationDetail: violation  as ViolationDetail
          });
        });
      }
    } finally {
      this.loadingService.hide(ref);
    }
  }

   // ApplicableRule[] type guard
   private isAnApplicableRuleList(obj: any): obj is ApplicableRule[] {
    if (obj.constructor !== Array || obj.length === 0) {
      return false;
    }

    return 'violationDetail' in obj[0];
  }
}
