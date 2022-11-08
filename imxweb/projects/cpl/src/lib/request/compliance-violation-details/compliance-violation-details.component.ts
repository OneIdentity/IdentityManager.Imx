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

import { Component, Inject, Input, OnInit } from '@angular/core';
import { EuiLoadingService, EUI_SIDESHEET_DATA } from '@elemental-ui/core';
import { ICartItemCheck } from 'imx-api-qer';
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

  public rules: ApplicableRule[] = [];
  public schema: EntitySchema;

  constructor(
    private readonly validator: ItemValidatorService,
    private complianceApi: ComplianceViolationService,
    private readonly loadingService: EuiLoadingService,
    @Inject(EUI_SIDESHEET_DATA) public data?: ICartItemCheck | any
  ) {

  }

  public async ngOnInit(): Promise<void> {
    const ref = this.loadingService.show();

    try {
      this.schema = this.validator.getRulesSchema();
      this.isICartItemCheck(this.data) ? await this.loadCartItemViolations(this.data) : await this.loadRequestViolations(this.pwoId);
    } finally {
      this.loadingService.hide(ref);
    }
  }

  private async loadCartItemViolations(cartItemCheck: ICartItemCheck): Promise<void> {
    let rules = (await this.validator.getRules()).Data;
    this.rules = [];
    cartItemCheck.Detail.Violations.forEach((item) => {
      this.rules.push({ rule: rules.find((x) => x.GetEntity().GetKeys()[0] === item.UidComplianceRule), violationDetail: item });
    });
  }

  private async loadRequestViolations(id: string): Promise<void> {
    const violations = await this.complianceApi.getRequestViolations(id);
    this.rules = [];
    violations.forEach((violation) => {
      this.rules.push({
        violationDetail: violation as ViolationDetail,
      });
    });
  }

  // ICartItemCheck type guard
  private isICartItemCheck(obj: any): obj is ICartItemCheck {
    return 'Id' in obj && 'Status' in obj && 'Title' in obj && 'ResultText' in obj && 'Detail' in obj;
  }
}
