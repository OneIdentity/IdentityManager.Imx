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
import { GovernanceMastheadComponent } from './governance-masthead.component';
import { MastHeadComponent, AppConfigService, clearStylesFromDOM, ISessionState, AuthenticationService } from 'qbm';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Router } from '@angular/router';
import { ArcGovernanceTestBed } from '../../test/arc-governance-test-bed';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EuiCoreModule } from '@elemental-ui/core';
import { ReplaySubject } from 'rxjs';

describe('GovernanceMastheadComponent', () => {
  let component: GovernanceMastheadComponent;
  let fixture: ComponentFixture<GovernanceMastheadComponent>;

  const mockSessionService = {
    logout: jasmine.createSpy('logout'),
    getSessionState: jasmine.createSpy('getSessionState').and.returnValue(Promise.resolve({
      IsLoggedOut: true,
      IsLoggedIn: false,
      Status: {
        PrimaryAuth: {
          IsAuthenticated: false
        }
      }
    }))
  };

  const mockAuthenticationService = {
    onSessionResponse: new ReplaySubject<ISessionState>()
  };

  const mockRouter = { navigate: jasmine.createSpy('navigate')};

  ArcGovernanceTestBed.configureTestingModule({
    declarations: [MastHeadComponent],
    imports: [
      CommonModule,
      EuiCoreModule,
      NoopAnimationsModule,
    ],
    providers: [
      {
        provide: Router,
        useValue: mockRouter
      },
      {
        provide: AuthenticationService,
        useValue: mockAuthenticationService,
      },
      {
        provide: AppConfigService,
        useValue: { Config: { Title: '', routeConfig: { start: 'dashboard'} } }
      }
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
  });

  beforeEach(waitForAsync(() => {
    mockSessionService.logout.calls.reset();
    mockSessionService.getSessionState.calls.reset();
    mockRouter.navigate.calls.reset();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GovernanceMastheadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterAll(() => {
    clearStylesFromDOM();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set the sessionState when the authentication onSessionResponse subject is updated', async() => {
    const mockSessionState = { IsLoggedIn: true };
    component['authentication'].onSessionResponse.next(mockSessionState);
    expect(component.sessionState).toEqual(mockSessionState);
  });

  it('should call sessionState$ unsubscribe on destroy of component', () => {
    const sessionStateUnsubscribeSpy = spyOn<any>(component['sessionState$'], 'unsubscribe');
    fixture.componentInstance.ngOnDestroy();
    expect(sessionStateUnsubscribeSpy).toHaveBeenCalled();
  });

  it('should navigate to the configured app start when goHome is called', () => {
    component.goHome();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['dashboard'], { queryParams: {} });
  });
});
