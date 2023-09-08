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

import { TestBed } from '@angular/core/testing';
import { DuplicateCheckComponent } from './duplicate-check/duplicate-check.component';
import { ExclusionCheckComponent } from './exclusion-check/exclusion-check.component';
import { ProductDependencyCheckComponent } from './product-dependency-check/product-dependency-check.component';

import { ShoppingCartValidationDetailService } from './shopping-cart-validation-detail.service';

describe('ShoppingCartValidationDetailService', () => {
  let service: ShoppingCartValidationDetailService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ShoppingCartValidationDetailService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should add detail viewers to the registry', () => {
    service.register(ExclusionCheckComponent, 'ExclusionCheck');
    service.register(DuplicateCheckComponent, 'DuplicateCheck');
    service.register(ProductDependencyCheckComponent, 'ProductDependencyCheck');
    expect(service.viewers.length).toBe(3);
  })
});
