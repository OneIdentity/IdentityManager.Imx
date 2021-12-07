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

import { AfterViewInit, Component, Inject, OnInit } from '@angular/core';
import { EuiLoadingService, EuiSidesheetRef, EUI_SIDESHEET_DATA } from '@elemental-ui/core';
import { EntitySchema } from 'imx-qbm-dbts';
import { ApplicableRule } from '../cart-item-compliance-check/cart-item-compliance-check.component';
import { ItemValidatorService } from '../item-validator.service';

@Component({
  selector: 'imx-cart-item-violation-details',
  templateUrl: './cart-item-violation-details.component.html',
  styleUrls: ['./cart-item-violation-details.component.scss'],
})
export class CartItemViolationDetailsComponent implements OnInit, AfterViewInit {
  public schema: EntitySchema;

  constructor(
    private readonly validator: ItemValidatorService,
    private readonly loadingService: EuiLoadingService,
    @Inject(EUI_SIDESHEET_DATA) public rules?: ApplicableRule[]
  ) {
    this.schema = this.validator.getRulesSchema();
  }

  public ngOnInit(): void {
    this.loadingService.show();
  }

  public ngAfterViewInit(): void {
    this.loadingService.hide();
  }
}
