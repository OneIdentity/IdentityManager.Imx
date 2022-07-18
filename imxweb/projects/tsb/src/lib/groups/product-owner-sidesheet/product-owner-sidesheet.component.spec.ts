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

import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatCardModule } from '@angular/material/card';
import { EuiSidesheetRef, EUI_SIDESHEET_DATA } from '@elemental-ui/core';
import { configureTestSuite } from 'ng-bullet';

import { clearStylesFromDOM } from 'qbm';
import { ProductOwnerSidesheetComponent } from './product-owner-sidesheet.component';
import { ProductOwnerSidesheetService } from './product-owner-sidesheet.service';

@Component({
  selector: 'imx-owner-control',
  template: '<p>MockOwnerControlComponent</p>'
})
class MockOwnerControlComponent {
  @Input() public column: any;
  @Output() public formControlCreated = new EventEmitter<any>();
}


describe('ProductOwnerSidesheetComponent', () => {
  let component: ProductOwnerSidesheetComponent;
  let fixture: ComponentFixture<ProductOwnerSidesheetComponent>;

  configureTestSuite(() => {
    TestBed.configureTestingModule({
      declarations: [
        ProductOwnerSidesheetComponent,
        MockOwnerControlComponent
      ],
      imports: [
        MatCardModule
      ],
      providers: [
        {
          provide: EuiSidesheetRef,
          useValue: {
            close: jasmine.createSpy('close')
          }
        },
        {
          provide: EUI_SIDESHEET_DATA,
          useValue: {
            GetEntity : () =>({})
          }
        },
        {
          provide: ProductOwnerSidesheetService,
          useValue: {
            buildOrgRulerColumn: jasmine.createSpy('buildOrgRulerColumn')
          }
        }
      ]
    });
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProductOwnerSidesheetComponent);
    component = fixture.componentInstance;
  });

  afterAll(() => {
    clearStylesFromDOM();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
