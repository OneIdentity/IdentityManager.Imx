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
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { configureTestSuite } from 'ng-bullet';
import { LoggerTestingModule } from 'ngx-logger/testing';
import { Subject } from 'rxjs';

import { AuthenticationGuardService } from './authentication-guard.service';
import { AuthenticationService } from './authentication.service';
import { Message } from '../user-message/message.interface';
import { UserMessageService } from '../user-message/user-message.service';
import { AuthConfigProvider } from './auth-config-provider.interface';
import { imx_SessionService } from '../session/imx-session.service';
import { OAuthService } from './oauth.service';

describe('AuthenticationGuardService', () => {
  let service: AuthenticationGuardService;

  const sessionServiceStub = {
    getSessionState: jasmine.createSpy('getSessionState').and.returnValue(Promise.resolve({}))
  };

  const mockRouter = {
    navigate: jasmine.createSpy('navigate'),
    url: 'some url'
  };

  const authenticationServiceStub = new class {
    sessionResponse = {};
    oauthLogin = jasmine.createSpy('oauthLogin').and.callFake(() => Promise.resolve(this.sessionResponse));
    oauthRedirect = jasmine.createSpy('oauthRedirect');
  }();

  const userMessageServiceStub = {
    subject: new Subject<Message>()
  };

  configureTestSuite(() => {
    TestBed.configureTestingModule({
      imports: [
        LoggerTestingModule
      ],
      providers: [
        {
          provide: imx_SessionService,
          useValue: sessionServiceStub
        },
        {
          provide: AuthenticationService,
          useValue: authenticationServiceStub
        },
        {
          provide: OAuthService,
          useValue: {}
        },
        {
          provide: Router,
          useValue: mockRouter
        },
        {
          provide: UserMessageService,
          useValue: userMessageServiceStub
        }
      ]
    });
    service = TestBed.inject(AuthenticationGuardService);
  });


  beforeEach(() => {
    authenticationServiceStub.oauthRedirect.calls.reset();
    mockRouter.navigate.calls.reset();
  });

  it('canActivate', () => {
    expect(service).toBeTruthy();
  });

  for (const testcase of [
    { configurationProvidersIsOAuth: [ ] as boolean[] },
    { configurationProvidersIsOAuth: [ true ], expectedOAuthRedirect: true },
    { configurationProvidersIsOAuth: [ false ] },
    { configurationProvidersIsOAuth: [ true, true ] },
    { configurationProvidersIsOAuth: [ true, false ] },
    { configurationProvidersIsOAuth: [ true ], message: { text: 'some error message' } },
  ]) {
    it('canActivate' + (testcase.expectedOAuthRedirect ? ' redirects to an OAuth page' : ''), async () => {
      const name = 'some config provider name';

      authenticationServiceStub.sessionResponse = {
        configurationProviders: testcase.configurationProvidersIsOAuth.map(isOAuth2 => ({
          name,
          isOAuth2
        } as AuthConfigProvider))
      };

      userMessageServiceStub.subject.next(testcase.message);

      const canActivate = await service.canActivate(
        {
          queryParamMap: {
            keys: [''],
            get: _ => undefined
          }
        } as ActivatedRouteSnapshot,
        undefined
      );

      if (testcase.expectedOAuthRedirect) {
        expect(authenticationServiceStub.oauthRedirect).toHaveBeenCalledWith(name);
        expect(canActivate).toBeFalsy();
      } else {
        expect(authenticationServiceStub.oauthRedirect).not.toHaveBeenCalled();
        expect(canActivate).toBeTruthy();
      }
    });
  }
});
