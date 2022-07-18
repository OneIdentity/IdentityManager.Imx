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

import { Component } from '@angular/core';
import { TestBed, fakeAsync, flush } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { configureTestSuite } from 'ng-bullet';
import { Subject } from 'rxjs';

import { AppConfigService, AuthenticationService, ISessionState } from 'qbm';
import { TsbNamespaceAdminGuardService } from './tsb-namespace-admin-guard.service';
import { TsbPermissionsService } from '../admin/tsb-permissions.service';
import { ActivatedRouteSnapshot } from '@angular/router';

@Component({
  template: `<div>Dummy</div>`
})
class DummyComponent {
}

describe('TsbNamespaceAdminGuardService', () => {
  let service: TsbNamespaceAdminGuardService;

  let isTsbNameSpaceAdminBase = false;

  const tsbPermissionsServiceStub = {
    isTsbNameSpaceAdminBase: jasmine.createSpy('isTsbNameSpaceAdminBase').and.callFake(() => isTsbNameSpaceAdminBase)
  };

  const authenticationServiceStub = {
    onSessionResponse: new Subject<ISessionState>(),
  };

  configureTestSuite(() => {
    TestBed.configureTestingModule({
      declarations: [
        DummyComponent
      ],
      imports: [
        RouterTestingModule.withRoutes([
          { path: 'dashboard', component: DummyComponent }
        ])],
      providers: [
        TsbNamespaceAdminGuardService,
        {
          provide: TsbPermissionsService,
          useValue: tsbPermissionsServiceStub,
        },
        {
          provide: AuthenticationService,
          useValue: authenticationServiceStub,
        },
        {
          provide: AppConfigService,
          useValue: {
            Config: {
              Title: '',
              routeConfig: {
                start: 'dashboard'
              }
            }
          }
        },
      ],
    });
  });


  beforeEach(() => {
    service = TestBed.inject(TsbNamespaceAdminGuardService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('canActivate() should return true if user has TSB_4_NAMESPACEADMIN_BASE group', fakeAsync(() => {
    isTsbNameSpaceAdminBase = true;

    service.canActivate({ url: [{ path: 'admin' }] } as unknown as ActivatedRouteSnapshot, null).subscribe((val: boolean) => {
      expect(val).toEqual(true);
    });

    authenticationServiceStub.onSessionResponse.next({ IsLoggedIn: true });

    flush();
  }));

  it("canActivate() should return false if user doesn't have TSB_4_NAMESPACEADMIN_BASE group", fakeAsync(() => {
    isTsbNameSpaceAdminBase = false;

    service.canActivate({ url: [{ path: 'admin' }] } as unknown as ActivatedRouteSnapshot, null).subscribe((val: boolean) => {
      expect(val).toEqual(false);
    });

    authenticationServiceStub.onSessionResponse.next({ IsLoggedIn: true });

    flush();
  }));
});
