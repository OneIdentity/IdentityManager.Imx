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
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { FormArray, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { configureTestSuite } from 'ng-bullet';

import { clearStylesFromDOM } from 'qbm';
import { ReportSubscription } from '../report-subscription/report-subscription';
import { SubscriptionPropertiesComponent } from './subscription-properties.component';

@Component({
  selector: 'imx-cdr-editor',
  template: '<p>MockRequestTable</p>'
})
class MockCdr {
  @Input() cdr: any;
  @Output() controlCreated = new EventEmitter<any>();
}

describe('SubscriptionPropertiesComponent', () => {
  let component: SubscriptionPropertiesComponent;
  let fixture: ComponentFixture<SubscriptionPropertiesComponent>;

  configureTestSuite(() => {
    TestBed.configureTestingModule({
      imports: [
        NoopAnimationsModule,
        ReactiveFormsModule,
        MatCardModule
      ],
      declarations: [
        MockCdr,
        SubscriptionPropertiesComponent
      ]
    });
  });


  afterAll(() => {
    clearStylesFromDOM();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SubscriptionPropertiesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('can init', () => {
    fixture.detectChanges();
    component.formGroup = new FormGroup({});
    component.ngOnInit();
    expect(component.formGroup.get('subscriptionProperties')).toBeDefined();
    expect(component.formGroup.get('subscriptionParameter')).toBeDefined();
  });

  for (const testcase of [
    null,
    {
      getCdrs: jasmine.createSpy('getCdrs'),//() => [],
      getParameterCdr: jasmine.createSpy('getParameterCdr'),//() => []
    } as unknown as ReportSubscription
  ]) {
    it('can update changes', () => {
      component.formGroup = new FormGroup({});
      component.subscription = testcase;
      component.ngOnInit()
      component.ngOnChanges();

      if (testcase != null) {
        expect(testcase.getCdrs).toHaveBeenCalled();
        expect(testcase.getParameterCdr).toHaveBeenCalled();
      }

    });
  }

  for (const testcase of [
    'test reload',
    'test not reload'
  ]) {
    it('can update changes', () => {

      component.formGroup = new FormGroup({});
      component.subscription = {
        columnsWithParameterReload: ['test reload'],
        getCdrs: jasmine.createSpy('getCdrs'),
        calculateParameterColumns: jasmine.createSpy('calculateParameterColumns'),
        getParameterCdr: jasmine.createSpy('getParameterCdr'),
      } as unknown as ReportSubscription;
      component.ngOnInit()

      component.valueHasChanged(testcase);

      if (testcase  === 'test reload') {
        expect(component.subscriptionParameterFormArray.length).toEqual(0);
        expect(component.subscription.getParameterCdr).toHaveBeenCalled();
      }

    });
  }

  it('can add control', fakeAsync(() => {
    const array = new FormArray([]);
    component.addFormControl(array, new FormControl());
    tick(1000);
    expect(array.length).toEqual(1);
  }))
});
