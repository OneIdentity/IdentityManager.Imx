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

import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatStepperModule } from '@angular/material/stepper';
import { EuiLoadingService, EuiSidesheetRef, EUI_SIDESHEET_DATA } from '@elemental-ui/core';
import { configureTestSuite } from 'ng-bullet';
import { Subject } from 'rxjs';

import { TermsOfUseAcceptComponent } from './terms-of-use-accept.component';
import { TermsOfUseService } from './terms-of-use.service';
import { TypedEntity } from 'imx-qbm-dbts';
import { Approval } from '../itshopapprove/approval';

describe('TermsOfUseAcceptComponent', () => {
  let component: TermsOfUseAcceptComponent;
  let fixture: ComponentFixture<TermsOfUseAcceptComponent>;

  const item1 = {
    GetEntity: () => ({
      GetDisplay: () => 'Item 1',
      GetKeys: () => ['123']
    })
  } as TypedEntity;

  const item2 = {
    GetEntity: () => ({
      GetDisplay: () => 'Item 1',
      GetKeys: () => ['456']
    })
  } as TypedEntity;

  const item3 = {
    GetEntity: () => ({
      GetDisplay: () => 'Item 1',
      GetKeys: () => ['789']
    })
  } as TypedEntity;

  const data = { cartItems: [item1, item2, item3] };

  const sidesheetRefStub = {
    closeClicked: () => new Subject(),
    close: jasmine.createSpy('close'),
  }

  const acceptCartItemsWithoutAuthenticationSpy = jasmine.createSpy('acceptCartItemsWithoutAuthentication');
  const acceptApprovalItemsWithoutAuthenticationSpy = jasmine.createSpy('acceptApprovalItemsWithoutAuthentication');

  const termsOfUseServiceStub = {
    getTermsOfUse: jasmine.createSpy('getTermsOfUse'),
    acceptCartItemsWithoutAuthentication: acceptCartItemsWithoutAuthenticationSpy,
    acceptApprovalItemsWithoutAuthentication: acceptApprovalItemsWithoutAuthenticationSpy
  };

  const formBuilder: FormBuilder = new FormBuilder();

  configureTestSuite(() => {
    TestBed.configureTestingModule({
      schemas: [
        CUSTOM_ELEMENTS_SCHEMA
      ],
      declarations: [
        TermsOfUseAcceptComponent
      ],
      imports: [
        FormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatStepperModule,
        NoopAnimationsModule,
        ReactiveFormsModule,
      ],
      providers: [
        {
          provide: EUI_SIDESHEET_DATA,
          useValue: data
        },
        {
          provide: EuiSidesheetRef,
          useValue: sidesheetRefStub
        },
        {
          provide: TermsOfUseService,
          useValue: termsOfUseServiceStub
        },
        {
          provide: EuiLoadingService,
          useValue: {
            show: jasmine.createSpy('show'),
            hide: jasmine.createSpy('hide')
          }
        },
        {
          provide: FormBuilder,
          useValue: formBuilder
        }
      ]
    })
      .compileComponents();
  });

  beforeEach(waitForAsync(() => {
    acceptCartItemsWithoutAuthenticationSpy.calls.reset();
    acceptApprovalItemsWithoutAuthenticationSpy.calls.reset();
    sidesheetRefStub.close.calls.reset();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TermsOfUseAcceptComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should accept the terms of use of the cart items and close the sidesheet with true', async() => {
    await component.acceptWithoutAuthentication();

    expect(acceptCartItemsWithoutAuthenticationSpy).toHaveBeenCalledTimes(component.data.cartItems.length);
    // expect(acceptApprovalItemsWithoutAuthenticationSpy).not.toHaveBeenCalled();
    expect(sidesheetRefStub.close).toHaveBeenCalledWith(true);
  });

  it('should accept the terms of use of the approval items and close the sidesheet with true', async() => {
    component.data.cartItems = []
    component.data.approvalItems = [item1 as Approval, item2 as Approval, item3 as Approval];

    await component.acceptWithoutAuthentication();

    expect(acceptApprovalItemsWithoutAuthenticationSpy).toHaveBeenCalledTimes(component.data.approvalItems.length);
    expect(acceptCartItemsWithoutAuthenticationSpy).not.toHaveBeenCalled();
    expect(sidesheetRefStub.close).toHaveBeenCalledWith(true);
  });

  it('should close the sidesheet and returns false', () => {
    component.cancel();

    expect(sidesheetRefStub.close).toHaveBeenCalledWith(false);
  });
});
