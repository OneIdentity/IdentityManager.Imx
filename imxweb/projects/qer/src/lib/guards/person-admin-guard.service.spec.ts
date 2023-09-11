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
 * Copyright 2023 One Identity LLC.
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

import { fakeAsync, flush } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { AppConfigService, AuthenticationService } from 'qbm';
import { PersonAdminGuardService } from './person-admin-guard.service';
import { QerPermissionsService } from '../admin/qer-permissions.service';
import { MockBuilder, MockRender } from 'ng-mocks';
import { Router, RouterModule } from '@angular/router';
import { QbmDefaultMocks } from '../../../../qbm/src/default-mocks.spec';


describe('PersonAdminGuardService', () => {
  let service: PersonAdminGuardService;
  let isPersonAdmin = false;

  const qerPermissionsServiceStub = {
    isPersonAdmin: jasmine.createSpy('isPersonAdmin').and.callFake(() => isPersonAdmin),
  };

  beforeEach(() => {
    return MockBuilder([PersonAdminGuardService, RouterModule, RouterTestingModule.withRoutes([])])
      .mock(AuthenticationService)
      .mock(QerPermissionsService, qerPermissionsServiceStub)
      .mock(Router, { export: true })
      .mock(AppConfigService, {
        Config: {
          Title: '',
          routeConfig: {
            start: 'dashboard',
          },
        },
      } as unknown);
  });

  beforeEach(() => {
    service = MockRender(PersonAdminGuardService).point.componentInstance;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('canActivate() should return true if user has VI_4_PERSONADMIN group', fakeAsync(() => {
    isPersonAdmin = true;

    service.canActivate(undefined, null).subscribe((val: boolean) => {
      expect(val).toEqual(true);
    });

    QbmDefaultMocks.authServiceStub.onSessionResponse.next({ IsLoggedIn: true });

    flush();
  }));

  it("canActivate() should return false if user doesn't have VI_4_PERSONADMIN group", fakeAsync(() => {
    isPersonAdmin = false;

    service.canActivate(undefined, null).subscribe((val: boolean) => {
      expect(val).toEqual(false);
    });

    QbmDefaultMocks.authServiceStub.onSessionResponse.next({ IsLoggedIn: true });

    flush();
  }));
});
