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

import { TestBed } from '@angular/core/testing';
import { Router, ActivatedRouteSnapshot } from '@angular/router';
import { MatDialogModule } from '@angular/material/dialog';
import { configureTestSuite } from 'ng-bullet';
import { LoggerTestingModule } from 'ngx-logger/testing';
import { Subject } from 'rxjs';

import { RouteGuardService } from './route-guard.service';
import { AppConfigService } from '../appConfig/appConfig.service';
import { imx_SessionService } from '../session/imx-session.service';
import { OAuthService } from '../authentication/oauth.service';
import { AuthenticationService } from '../authentication/authentication.service';
import { ISessionState } from '../session/session-state';

class AuthenticationServiceStub {
  oauthLogin = jasmine.createSpy('Login').and.returnValue(Promise.resolve({ IsLoggedIn: this.isLoggedInOAuth }));
  onSessionResponse = new Subject<ISessionState>();
  constructor(private isLoggedInOAuth = false) {}
};

describe('RouteGuardService', () => {
  configureTestSuite(() => {
    TestBed.configureTestingModule({
      imports: [
        LoggerTestingModule,
        MatDialogModule
      ],
      providers: [
        {
          provide: AppConfigService,
          useClass: class { }
        },
        {
          provide: Router,
          useClass: class { }
        },
        {
          provide: imx_SessionService,
          useClass: class { }
        },
        {
          provide: OAuthService,
          useValue: {}
        },
        {
          provide: AuthenticationService,
          useValue: new AuthenticationServiceStub()
        }
      ]
    })
  });

  it('should be created', () => {
    const service: RouteGuardService = TestBed.get(RouteGuardService);
    expect(service).toBeTruthy();
  });
});

function createOAuthServiceStub(oauthParameters: string[] = []) {
  return {
    IsOAuthParameter: jasmine
      .createSpy('IsOAuthParameter')
      .and.callFake(
        (name: string) => oauthParameters.findIndex((param: string) => param === name) > -1
      ),
      hasRequiredOAuthParameter: jasmine
      .createSpy('hasRequiredOAuthParameter')
      .and.returnValue(true)
  };
}

function createActivatedRouteSnapshot(route: { queryParams: { [key: string]: any }, path?: string }): ActivatedRouteSnapshot {
  return route ?
    {
      queryParamMap: {
        get: name => route.queryParams ? route.queryParams[name] : null,
        keys: route.queryParams ? Object.keys(route.queryParams) : null
      },
      routeConfig: { path: route.path }
    } as ActivatedRouteSnapshot
    :
    undefined;
}

for (const testcase of [
  {
    description: 'navigates away from current page if not logged in',
    sessionState: { IsLoggedIn: false, isLoggedInOAuth: false },
    route: undefined
  },
  {
    description: 'stays on the current page if logged in',
    sessionState: { IsLoggedIn: true, isLoggedInOAuth: false },
    route: undefined
  },
  {
    description: 'navigates away from current page if not logged in and if OAuth-Code results in a not logged in state',
    sessionState: { IsLoggedIn: false, isLoggedInOAuth: false },
    route: { queryParams: { code: 'dummyCode' } }
  },
  {
    description: 'stays on the current page if not logged in and if OAuth-Code results in a logged in state',
    sessionState: { IsLoggedIn: false, isLoggedInOAuth: true, oauthParameters: ['code'] },
    route: { queryParams: { code: 'dummyCode' } }
  }
])
  {
    describe('RouteGuardService canActivate', () => {
      const mockAppConfig = {
        Config: {
          routeConfig: {
            login: 'login'
          }
        }
      };

      const mockRouter = {
        navigate: jasmine.createSpy('navigate')
      };

      const mockSessionService = {
        getSessionState: jasmine.createSpy('getSessionState').and.returnValue(Promise.resolve(testcase.sessionState))
      };

      configureTestSuite(() => TestBed.configureTestingModule({
        imports: [
          LoggerTestingModule,
          MatDialogModule
        ],
        providers: [
          {
            provide: AppConfigService,
            useValue: mockAppConfig
          },
          {
            provide: Router,
            useValue: mockRouter
          },
          {
            provide: imx_SessionService,
            useValue: mockSessionService
          },
          {
            provide: OAuthService,
            useValue: createOAuthServiceStub(testcase.sessionState.oauthParameters)
          },
          {
            provide: AuthenticationService,
            useValue: new AuthenticationServiceStub(testcase.sessionState.isLoggedInOAuth)
          }
        ]
      }));

      it(testcase.description, async () => {
        const service: RouteGuardService = TestBed.get(RouteGuardService);

        const expectedLoginState = testcase.sessionState.IsLoggedIn || testcase.sessionState.isLoggedInOAuth;

        const result = await service.canActivate(
          createActivatedRouteSnapshot(testcase.route),
          null
        );

        expect(result).toEqual(expectedLoginState);

        if (expectedLoginState) {
          expect(mockRouter.navigate).not.toHaveBeenCalled();
        } else {
          expect(mockRouter.navigate).toHaveBeenCalledWith([mockAppConfig.Config.routeConfig.login], { queryParams: {} });
        }
      });
    })
  }

[
  {
    description: 'does nothing if not logged in',
    sessionState: { IsLoggedIn: false, isLoggedInOAuth: false },
    route: undefined
  },
  {
    description: 'does nothing if logged in and if there are no login credentials in the query string',
    sessionState: { IsLoggedIn: true, isLoggedInOAuth: false },
    route: undefined
  },
  {
    description: 'does nothing if logged in and if there are no login credentials in the query string (oauth)',
    sessionState: { IsLoggedIn: false, isLoggedInOAuth: true },
    route: undefined
  },
  {
    description: 'removes login credentials from the query string if logged in and if there are login credentials in the query string',
    sessionState: { IsLoggedIn: true, isLoggedInOAuth: false, oauthParameters: ['code'] },
    route: { queryParams: { code: 'dummyCode', param1: 'param1value' }, path: 'somepath' },
    expectedNavigation: { commands: ['somepath'], extras: { queryParams: { param1: 'param1value' } } }
  }
].forEach(testcase =>
describe('RouteGuardService - resolve', () => {
  const mockRouter = {
    navigate: jasmine.createSpy('navigate')
  };

  const authenticationServiceStub = new AuthenticationServiceStub();

  configureTestSuite(() => TestBed.configureTestingModule({

    imports: [
      LoggerTestingModule,
      MatDialogModule
    ],
    providers: [
      {
        provide: AppConfigService,
        useValue: { Config: { routeConfig: { login: 'login' } } }
      },
      {
        provide: Router,
        useValue: mockRouter
      },
      {
        provide: imx_SessionService,
        useValue: { }
      },
      {
        provide: OAuthService,
        useValue: createOAuthServiceStub(testcase.sessionState.oauthParameters)
      },
      {
        provide: AuthenticationService,
        useValue: authenticationServiceStub
      }
    ]
  }));

  it(testcase.description, () => {
    const service: RouteGuardService = TestBed.get(RouteGuardService);

    authenticationServiceStub.onSessionResponse.next(testcase.sessionState);

    service.resolve(
      createActivatedRouteSnapshot(testcase.route),
      null
    );

    if (testcase.expectedNavigation) {
      expect(mockRouter.navigate).toHaveBeenCalledWith(
        testcase.expectedNavigation.commands,
        testcase.expectedNavigation.extras
      );
    } else {
      expect(mockRouter.navigate).not.toHaveBeenCalled();
    }
  });
}));

describe('RouteGuardService canActivate - resolve - OAuth, lastRoute', () => {
  const mockRouter = {
    navigate: jasmine.createSpy('navigate')
  };

  const authenticationServiceStub = new AuthenticationServiceStub();

  const oauthServiceStub = new class {
    oauthParameters = {};
    IsOAuthParameter = jasmine.createSpy('IsOAuthParameter').and.callFake((name: string) => this.oauthParameters[name]);
  }();

  configureTestSuite(() => TestBed.configureTestingModule({
    imports: [
      LoggerTestingModule,
      MatDialogModule
    ],
    providers: [
      {
        provide: AppConfigService,
        useValue: {
          Config: {
            routeConfig: { }
          }
        }
      },
      {
        provide: Router,
        useValue: mockRouter
      },
      {
        provide: imx_SessionService,
        useValue: {
          getSessionState: jasmine.createSpy('getSessionState').and.returnValue(Promise.resolve({}))
        }
      },
      {
        provide: OAuthService,
        useValue: oauthServiceStub
      },
      {
        provide: AuthenticationService,
        useValue: authenticationServiceStub
      }
    ]
  }));

  beforeEach(() => {
    mockRouter.navigate.calls.reset();
  });

  it('redirects to a previous route if it exists (lastRoute)', async () => {
    const service: RouteGuardService = TestBed.get(RouteGuardService);
    
    const routeCanActivate = { path: 'somePath', queryParams: { someKey: 'someValue', code: 'dummyCode' } };

    oauthServiceStub.oauthParameters = { code: 'dummyCode' };

    authenticationServiceStub.onSessionResponse.next({ IsLoggedIn: false });

    await service.canActivate(
      createActivatedRouteSnapshot(routeCanActivate),
      null
    );

    mockRouter.navigate.calls.reset();

    authenticationServiceStub.onSessionResponse.next({ IsLoggedIn: true });

    service.resolve(createActivatedRouteSnapshot({ path: 'someOtherPath', queryParams: { } }), null);
    expect(mockRouter.navigate).toHaveBeenCalledWith([routeCanActivate.path], { queryParams: { someKey: 'someValue' } });
  });
})