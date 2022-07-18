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

import { imx_SessionService } from '../session/imx-session.service';
import { OAuthService } from './oauth.service';
import { AppConfigService } from '../appConfig/appConfig.service';

describe('OAuthService', () => {
  const dummyProviderUrl = 'dummyProviderUrl';

  const mockSessionService = {
    Client: jasmine.createSpyObj('Client', {
      'imx_oauth_get': Promise.resolve(dummyProviderUrl)
    }),
    login: jasmine.createSpy('login').and.returnValue(Promise.resolve({}))
  }

  configureTestSuite(() => {
    TestBed.configureTestingModule({
      providers: [
        OAuthService,
        {
          provide: imx_SessionService,
          useValue: mockSessionService,
        },
        {
          provide: AppConfigService,
          useClass: class {
            Config = {
              WebAppIndex: 'dummyApi',
            }
          }
        }
      ]
    });
  });

  beforeEach(() => {
    mockSessionService.Client.imx_oauth_get.calls.reset();
    mockSessionService.login.calls.reset();
  });

  it('should be created', () => {
    const service: OAuthService = TestBed.get(OAuthService);
    expect(service).toBeDefined();
  });

  it('could get the providerUrl of an Authentifier', async () => {
    const service: OAuthService = TestBed.get(OAuthService);
    const providerUrl = await service.GetProviderUrl('dummyAuthentifier');
    expect(providerUrl).toBe(dummyProviderUrl);
    expect(mockSessionService.Client.imx_oauth_get).toHaveBeenCalled();
  });

  it('identifies Module, Code, code and state as OAuth credentials', () => {
    const service: OAuthService = TestBed.get(OAuthService);
    expect(service.IsOAuthParameter('Module')).toEqual(true);
    expect(service.IsOAuthParameter('Code')).toEqual(true);
    expect(service.IsOAuthParameter('code')).toEqual(true);
    expect(service.IsOAuthParameter('state')).toEqual(true);
    expect(service.IsOAuthParameter('other')).toEqual(false);
  });
});
