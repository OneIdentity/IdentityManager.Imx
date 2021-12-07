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
 * Copyright 2021 One Identity LLC.
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
import { FormsModule } from '@angular/forms';
import { EuiLoadingService } from '@elemental-ui/core';
import { configureTestSuite } from 'ng-bullet';

import { AuthenticationService, clearStylesFromDOM, imx_SessionService } from 'qbm';
import { StarlingComponent } from './starling.component';
import { StarlingService } from './starling.service';

describe('StarlingComponent', () => {
  let component: StarlingComponent;
  let fixture: ComponentFixture<StarlingComponent>;

  const mockAuthentication = {
    logout: jasmine.createSpy('logout')
  };

  const starlingServiceStub = {
    sendCall: jasmine.createSpy('sendCall'),
    sendPush: jasmine.createSpy('sendPush'),
    sendSms: jasmine.createSpy('sendSms'),
    verify: jasmine.createSpy('verify')
  };


  const euiLoadingServiceStub = {
    hide: jasmine.createSpy('hide'),
    show: jasmine.createSpy('show')
  };

  configureTestSuite(() => {
    TestBed.configureTestingModule({
      declarations: [StarlingComponent],
      imports: [FormsModule],
      providers: [
        {
          provide: AuthenticationService,
          useValue: mockAuthentication
        },
        {
          provide: imx_SessionService,
          useValue: {
            SessionState: {
              SecondaryErrorMessage: null
            }
          }
        },
        {
          provide: EuiLoadingService,
          useValue: euiLoadingServiceStub
        },
        {
          provide: StarlingService,
          useValue: starlingServiceStub
        }
      ]
    });
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StarlingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    starlingServiceStub.sendPush.calls.reset();
    starlingServiceStub.verify.calls.reset();
    starlingServiceStub.sendSms.calls.reset();
    starlingServiceStub.sendCall.calls.reset();

    mockAuthentication.logout.calls.reset();
  });

  afterAll(() => {
    clearStylesFromDOM();
  });

  it('should create', () => {
    expect(component).toBeDefined();
  });

  it('could send a call', async () => {
    await component.SendCall();
    expect(starlingServiceStub.sendCall).toHaveBeenCalled();
  });

  it('could send a sms', async () => {
    await component.SendSms();
    expect(starlingServiceStub.sendSms).toHaveBeenCalled();
  });

  it('could send send a push', async () => {
    await component.SendPush();
    expect(starlingServiceStub.sendPush).toHaveBeenCalled();
  });

  it('could verify', async () => {
    component.code = 'bla';
    await component.Verify();
    expect(starlingServiceStub.verify).toHaveBeenCalledWith(component.code);
  });

  it('could do a session-logout', async () => {
    await component.Logout();
    expect(mockAuthentication.logout).toHaveBeenCalled();
  });
});
