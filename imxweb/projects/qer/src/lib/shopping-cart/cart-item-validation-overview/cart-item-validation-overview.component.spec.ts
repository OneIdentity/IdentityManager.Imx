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
import { MatDialogModule } from '@angular/material/dialog';
import { MatListModule } from '@angular/material/list';
import { Pipe, PipeTransform } from '@angular/core';
import { EuiSidesheetService, EUI_SIDESHEET_DATA } from '@elemental-ui/core';
import { configureTestSuite } from 'ng-bullet';

import { CartItemValidationOverviewComponent } from './cart-item-validation-overview.component';
import { CartItemValidationStatus } from '../cart-items/cart-item-validation-status.enum';
import { clearStylesFromDOM } from 'qbm';

@Pipe({ name: 'ldsReplace' })
class MockLdsReplacePipe implements PipeTransform {
  transform(value: any, ..._: any[]): any { return value; }
}

describe('CartItemValidationOverviewComponent', () => {
  let component: CartItemValidationOverviewComponent;
  let fixture: ComponentFixture<CartItemValidationOverviewComponent>;

  const sidesheetServiceStub = {}

  const dialogData = {
    cartItemDisplay: 'RiffRaff 001',
    personOrderedDisplay: 'Piffpaff',
    checkResult: {
      HasWarnings: false,
      HasErrors: false,
      Checks: [
        {
          Status: CartItemValidationStatus.disabled,
          Title: 'Disabled',
          ResultText: 'Disabled'
        },
        {
          Status: CartItemValidationStatus.error,
          Title: 'Error',
          ResultText: 'Error'
        },
        {
          Status: CartItemValidationStatus.pending,
          Title: 'Pending',
          ResultText: 'Pending'
        },
        {
          Status: CartItemValidationStatus.success,
          Title: 'Success',
          ResultText: 'Success'
        },
        {
          Status: CartItemValidationStatus.warning,
          Title: 'Warning',
          ResultText: 'Warning'
        }
      ]
    }
  };

  configureTestSuite(() =>
    TestBed.configureTestingModule({
      declarations: [ CartItemValidationOverviewComponent, MockLdsReplacePipe ],
      imports: [MatDialogModule, MatListModule],
      providers: [ {
        provide: EuiSidesheetService,
        useValue: sidesheetServiceStub
      },
      {
        provide: EUI_SIDESHEET_DATA,
        useValue: dialogData
    },
    ]})
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(CartItemValidationOverviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterAll(() => {
    clearStylesFromDOM();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
