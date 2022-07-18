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

import { Component, Input } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatTabsModule } from '@angular/material/tabs';
import { EUI_SIDESHEET_DATA } from '@elemental-ui/core';
import { configureTestSuite } from 'ng-bullet';
import { CdrModule } from 'qbm';

import { ProductDetailsSidesheetComponent } from './product-details-sidesheet.component';

@Component({
  selector: 'imx-product-entitlements',
  template: '<p>MockEntitlmentsTab</p>'
})
class MockEntitlements {
  @Input() cdr: any;
}


describe('ProductDetailsSidesheetComponent', () => {
  let component: ProductDetailsSidesheetComponent;
  let fixture: ComponentFixture<ProductDetailsSidesheetComponent>;

  configureTestSuite(() => {
    TestBed.configureTestingModule({
      declarations: [
        ProductDetailsSidesheetComponent,
        MockEntitlements
      ],
      imports: [
        CdrModule,
        MatTabsModule,
      ],
      providers: [
        {
          provide: EUI_SIDESHEET_DATA,
          useValue: {
            item: {
              GetEntity: ()=> ({
                GetColumn: ()=> ({})
              }),
              TableName:{
                Column: {}
              },
              Tags:{
                Column: {}
              }
            },
            projectConfig: {ITShopConfig:{
              AccProductProperties:[]
            }}
          }
        }
      ]
    })
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProductDetailsSidesheetComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
