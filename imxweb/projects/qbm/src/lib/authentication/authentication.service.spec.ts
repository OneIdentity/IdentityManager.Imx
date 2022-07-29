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

import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { configureTestSuite } from 'ng-bullet';
import { LoggerTestingModule } from 'ngx-logger/testing';

import { AuthenticationService } from './authentication.service';
import { imx_SessionService } from '../session/imx-session.service';
import { OAuthService } from './oauth.service';
import { UserMessageService } from '../user-message/user-message.service';
import { SnackBarService } from '../snackbar/snack-bar.service';
import { RedirectService } from './redirect.service';
import { AppConfigService } from '../appConfig/appConfig.service';

describe('AuthenticationService', () => {
  let service: AuthenticationService;

  const sessionServiceStub = new class {
    externalLogoutUrl: string;
    readonly getSessionState = jasmine.createSpy('getSessionState').and.callFake(() => Promise.resolve({
      externalLogoutUrl: this.externalLogoutUrl
    }));
    readonly login = jasmine.createSpy('login').and.returnValue(Promise.resolve({}));
    readonly logout = jasmine.createSpy('logout').and.callFake(() => Promise.resolve({
      IsLoggedOut: true
    }));

    reset() {
      this.getSessionState.calls.reset();
      this.login.calls.reset();
      this.logout.calls.reset();
      this.externalLogoutUrl = undefined;
    }
  }();

  const oauthServiceStub = new class {
    hasOAuthLoginData = false;
    readonly loginData = {
      Module: 'someModule',
      Code: 'some code'
    };
    readonly providerUrl = 'some url';
    readonly GetProviderUrl = jasmine.createSpy('GetProviderUrl').and.returnValue(Promise.resolve(this.providerUrl));
    readonly convertToOAuthLoginData = jasmine.createSpy('convertToOAuthLoginData').and.callFake(() => this.hasOAuthLoginData ? this.loginData : undefined);
  }();

  const redirectServiceStub = {
    redirect: jasmine.createSpy('redirect')
  };

  const snackBarServiceStub = {
    open: jasmine.createSpy('open')
  };

  const userMessageServiceStub = {
    subject: { next: jasmine.createSpy('next') }
  };

  const routerStub = {
    navigate: jasmine.createSpy('navigate')
  };

  configureTestSuite(() => {
    TestBed.configureTestingModule({
      imports: [LoggerTestingModule],
      providers: [
        {
          provide: imx_SessionService,
          useValue: sessionServiceStub
        },
        {
          provide: OAuthService,
          useValue: oauthServiceStub
        },
        {
          provide: UserMessageService,
          useValue: userMessageServiceStub
        },
        {
          provide: SnackBarService,
          useValue: snackBarServiceStub
        },
        {
          provide: RedirectService,
          useValue: redirectServiceStub
        },
        {
          provide: AppConfigService,
          useValue: { Config: { routeConfig: {} } }
        },
        {
          provide: Router,
          useValue: routerStub
        }
      ]
    });
  });

  beforeEach(() => {
    service = TestBed.get(AuthenticationService);

    sessionServiceStub.reset();
    oauthServiceStub.GetProviderUrl.calls.reset();
    redirectServiceStub.redirect.calls.reset();
    snackBarServiceStub.open.calls.reset();
    userMessageServiceStub.subject.next.calls.reset();
    routerStub.navigate.calls.reset();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('update', async () => {
    await service.update();
    expect(sessionServiceStub.getSessionState).toHaveBeenCalled();
  });

  it('login', async () => {
    await service.login({});
    expect(sessionServiceStub.login).toHaveBeenCalled();
  });

  for (const externalLogoutUrl of [
    'some external logout URL',
    undefined
  ]) {
    it('logout', async () => {
      sessionServiceStub.externalLogoutUrl = externalLogoutUrl;

      await service.logout();
      expect(sessionServiceStub.logout).toHaveBeenCalled();
      expect(userMessageServiceStub.subject.next).toHaveBeenCalled();

      if (externalLogoutUrl) {
        expect(redirectServiceStub.redirect).toHaveBeenCalledWith(externalLogoutUrl);
      } else {
        expect(snackBarServiceStub.open).toHaveBeenCalled();
        expect(routerStub.navigate).toHaveBeenCalled();
      }
    });
  }

  it('oauthRedirect', async () => {
    await service.oauthRedirect(undefined);
    expect(oauthServiceStub.GetProviderUrl).toHaveBeenCalled();
    expect(redirectServiceStub.redirect).toHaveBeenCalledWith(oauthServiceStub.providerUrl);
  });

  it('attempts to login when OAuth credentials exist', async () => {
    const service = TestBed.get(AuthenticationService);
    oauthServiceStub.hasOAuthLoginData = true;
    await service.oauthLogin(null);
    expect(sessionServiceStub.login).toHaveBeenCalledWith(oauthServiceStub.loginData);
  });

  it('does not attempt to login when no OAuth credentials exist', async () => {
    const service = TestBed.get(AuthenticationService);
    oauthServiceStub.hasOAuthLoginData = false;
    await service.oauthLogin(null);
    expect(sessionServiceStub.login).not.toHaveBeenCalled();
  });
});
