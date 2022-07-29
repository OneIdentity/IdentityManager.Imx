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
import { configureTestSuite } from 'ng-bullet';
import { LoggerTestingModule } from 'ngx-logger/testing';

import { imx_SessionService } from './imx-session.service';
import { AppConfigService } from '../appConfig/appConfig.service';

describe('imx_SessionService', () => {
  let service: imx_SessionService;

  let sessionResponse;

  const appConfigServiceStub = {
    Config: { },
    BaseUrl: '',
    client: {
      imx_sessions_get: jasmine.createSpy('imx_sessions_get').and.callFake(() => Promise.resolve(sessionResponse)),
      imx_login_post: jasmine.createSpy('imx_login_post').and.callFake(() => Promise.resolve(sessionResponse)),
      imx_logout_post: jasmine.createSpy('imx_logout_post').and.callFake(() => Promise.resolve(sessionResponse)),
    }
  };

  configureTestSuite(() => {
    TestBed.configureTestingModule({
      imports: [LoggerTestingModule],
      providers: [
        imx_SessionService,
        {
          provide: AppConfigService,
          useValue: appConfigServiceStub
        }
      ]
    })
  });

  beforeEach(() => {
    appConfigServiceStub.client.imx_sessions_get.calls.reset();
    appConfigServiceStub.client.imx_login_post.calls.reset();
    appConfigServiceStub.client.imx_logout_post.calls.reset();
    service = TestBed.get(imx_SessionService);
  });

  it('should be created', () => {
    expect(service.Client).toBeTruthy();
  });

  it('could request the sessionstate', async () => {
    sessionResponse = {
      Status: {
        PrimaryAuth: {
          IsAuthenticated: false,
          AuthTime: undefined
        }
      }
    };

    const sessionState = await service.getSessionState();
    expect(appConfigServiceStub.client.imx_sessions_get).toHaveBeenCalled();
    expect(sessionState.IsLoggedIn).toEqual(sessionResponse.Status.PrimaryAuth.IsAuthenticated);
  });

  it('could login', async () => {
    sessionResponse = {
      Status: {
        PrimaryAuth: {
          IsAuthenticated: true,
          AuthTime: undefined
        },
        SecondaryAuth: {}
      }
    };

    const sessionState = await service.login({});
    expect(appConfigServiceStub.client.imx_login_post).toHaveBeenCalled();
    expect(sessionState.IsLoggedIn).toEqual(true);
    expect(sessionState.IsLoggedOut).toEqual(false);
  });

  it('could logout', async () => {
    sessionResponse = {
      Status: {
        PrimaryAuth: {
          IsAuthenticated: false,
          AuthTime: undefined
        }
      }
    };

    const sessionState = await service.logout();
    expect(appConfigServiceStub.client.imx_logout_post).toHaveBeenCalled();
    expect(sessionState.IsLoggedIn).toEqual(false);
    expect(sessionState.IsLoggedOut).toEqual(true);
  });

  it('could get the userName', async () => {
    sessionResponse = {
      Status: {
        PrimaryAuth: {
          IsAuthenticated: true,
          Display: 'username',
          AuthTime: undefined
        },
        SecondaryAuth: {}
      }
    };

    const sessionState = await service.getSessionState();
    expect(appConfigServiceStub.client.imx_sessions_get).toHaveBeenCalled();
    expect(sessionState.Username).toEqual(sessionResponse.Status.PrimaryAuth.Display);
  });
});
