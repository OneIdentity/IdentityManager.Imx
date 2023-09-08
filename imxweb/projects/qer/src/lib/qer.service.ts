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

import { Injectable } from '@angular/core';

import { ExtService } from 'qbm';

import { ObjectOverviewPersonComponent } from './ops/objectOverviewPerson.component';
import { ShoppingCartValidationDetailService } from './shopping-cart-validation-detail/shopping-cart-validation-detail.service';
import { ExclusionCheckComponent } from './shopping-cart-validation-detail/exclusion-check/exclusion-check.component';
import { DuplicateCheckComponent } from './shopping-cart-validation-detail/duplicate-check/duplicate-check.component';
// tslint:disable-next-line: max-line-length
import { ProductDependencyCheckComponent } from './shopping-cart-validation-detail/product-dependency-check/product-dependency-check.component';

@Injectable({
  providedIn: 'root'
})
export class QerService {
  constructor(
    private extService: ExtService,
    private readonly validationDetailService: ShoppingCartValidationDetailService,
  ) { }

  public init(): void {

    this.extService.register('QBM_ops_ObjectOverview_Actions', { instance: ObjectOverviewPersonComponent });

    this.validationDetailService.register(ExclusionCheckComponent, 'ExclusionCheck');
    this.validationDetailService.register(DuplicateCheckComponent, 'DuplicateCheck');
    this.validationDetailService.register(ProductDependencyCheckComponent, 'ProductDependencyCheck');
  }
}
