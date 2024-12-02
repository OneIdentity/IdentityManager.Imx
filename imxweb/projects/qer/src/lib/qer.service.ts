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
 * Copyright 2024 One Identity LLC.
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

import { DuplicateCheckComponent } from './shopping-cart-validation-detail/duplicate-check/duplicate-check.component';
import { ExclusionCheckComponent } from './shopping-cart-validation-detail/exclusion-check/exclusion-check.component';
import { ProductDependencyCheckComponent } from './shopping-cart-validation-detail/product-dependency-check/product-dependency-check.component';
import { ShoppingCartValidationDetailService } from './shopping-cart-validation-detail/shopping-cart-validation-detail.service';
import { ClassloggerService, ExtService } from 'qbm';
import { QueueStatusComponent } from './queue/queue-status/queue-status.component';

@Injectable({
  providedIn: 'root',
})
export class QerService {
  constructor(
    private readonly validationDetailService: ShoppingCartValidationDetailService,
    private logger: ClassloggerService,
    private extService: ExtService,
  ) {}

  public init(): void {
    this.validationDetailService.register(ExclusionCheckComponent, 'ExclusionCheck');
    this.validationDetailService.register(DuplicateCheckComponent, 'DuplicateCheck');
    this.validationDetailService.register(ProductDependencyCheckComponent, 'ProductDependencyCheck');
    this.logger.info(this, '▶️ QueueStatusComponent loaded');
    this.extService.register('queueMastButton', {
      instance: QueueStatusComponent,
    });
  }
}
