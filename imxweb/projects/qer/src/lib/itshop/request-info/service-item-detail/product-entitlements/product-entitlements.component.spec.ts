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

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EuiLoadingService } from '@elemental-ui/core';
import { configureTestSuite } from 'ng-bullet';
import { MetadataService } from 'qbm';
import { ProductDetailsService } from '../product-details.service';

import { ProductEntitlementsComponent } from './product-entitlements.component';

describe('ProductEntitlementsComponent', () => {
  let component: ProductEntitlementsComponent;
  let fixture: ComponentFixture<ProductEntitlementsComponent>;

  configureTestSuite(() => {
    TestBed.configureTestingModule({
      declarations: [
        ProductEntitlementsComponent,
      ],
      imports: [
      ],
      providers: [
        {
          provide: EuiLoadingService,
          useValue: {
            hide: jasmine.createSpy('hide'),
            show: jasmine.createSpy('show')
          }
        },
        {
          provide: MetadataService,
          useValue: {
            GetTableMetadata: jasmine.createSpy('GetTableMetadata').and.returnValue(Promise.resolve({DisplaySingular:''}))
          }
        },
        {
          provide: ProductDetailsService,
          useValue: {
            getRoleEntitlements: jasmine.createSpy('getRoleEntitlements').and.returnValue(Promise.resolve({totalCount:0, Data:  []})),
            productEntitlementSchema:{
              Columns:{
                TargetEntitlement:{}
              }
            }
          }
        }
      ]
    })
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProductEntitlementsComponent);
    component = fixture.componentInstance;
  });


  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
