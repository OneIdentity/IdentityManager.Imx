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
import { ReactiveFormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { EuiLoadingService, EuiSidesheetRef, EUI_SIDESHEET_DATA } from '@elemental-ui/core';
import { configureTestSuite } from 'ng-bullet';
import { of } from 'rxjs';

import { clearStylesFromDOM, ConfirmationService } from 'qbm';
import { ReportSubscription } from '../report-subscription/report-subscription';
import { SubscriptionDetailsComponent } from './subscription-details.component';


@Component({
  selector: 'imx-cdr-editor',
  template: '<p>MockRequestTable</p>'
})
class MockCdr {
  @Input() cdr: any;
  @Output() controlCreated = new EventEmitter<any>();
}

@Component({
  selector: 'imx-subscription-properties',
  template: '<p>MockSubscriptionParameterComponent</p>'
})
export class MockSubscriptionParameterComponent {
  @Input() public subscription: any;
  @Input() public formGroup: any;
}

describe('SubscriptionDetailsComponent', () => {
  let component: SubscriptionDetailsComponent;
  let fixture: ComponentFixture<SubscriptionDetailsComponent>;

  const mockSidesheetRef = {
    close: jasmine.createSpy('close'),
    closeClicked: jasmine.createSpy('closeClicked').and.returnValue(of(undefined))
  };

  const euiLoadingServiceStub = {
    hide: jasmine.createSpy('hide'),
    show: jasmine.createSpy('show')
  };

  let confirm = true;
  const mockConfirmationService = {
    confirmLeaveWithUnsavedChanges: jasmine.createSpy('confirmLeaveWithUnsavedChanges')
      .and.callFake(() => Promise.resolve(confirm))
  }

  const data = { submit: jasmine.createSpy('submit') } as unknown as ReportSubscription;

  configureTestSuite(() => {
    TestBed.configureTestingModule({
      imports: [
        NoopAnimationsModule,
        ReactiveFormsModule
      ],
      declarations: [
        MockCdr,
        MockSubscriptionParameterComponent,
        SubscriptionDetailsComponent
      ],
      providers: [
        {
          provide: EuiLoadingService,
          useValue: euiLoadingServiceStub
        },
        {
          provide: ConfirmationService,
          useValue: mockConfirmationService
        },
        {
          provide: EuiSidesheetRef,
          useValue: mockSidesheetRef
        },
        { provide: EUI_SIDESHEET_DATA, useValue: data }
      ]
    })
      .compileComponents();
  });

  afterAll(() => {
    clearStylesFromDOM();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SubscriptionDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('calls submit', async () => {
    await component.submit();
    expect(component.subscription.submit).toHaveBeenCalled();
  });
});
