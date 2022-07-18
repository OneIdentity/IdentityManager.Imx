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
import { AobApplicationsGuardService } from './aob-applications-guard.service';
import { AobPermissionsService } from '../permissions/aob-permissions.service';

@Component({
  template: `<div>Dummy</div>`
})
class DummyComponent {
}

describe('AobApplicationsGuardService', () => {
  let service: AobApplicationsGuardService;


  const authenticationServiceStub = {
    onSessionResponse: new Subject<ISessionState>(),
  };
  
  let isAobApplicationOwner = false; 
  let isAobApplicationAdmin = false; 

  const aobPermissionsServiceStub = {
    isAobApplicationOwner: jasmine.createSpy('isAobApplicationOwner').and.callFake(() => isAobApplicationOwner),
    isAobApplicationAdmin: jasmine.createSpy('isAobApplicationAdmin').and.callFake(() => isAobApplicationAdmin)
  };

  configureTestSuite(() => {
    TestBed.configureTestingModule({
      declarations: [DummyComponent],
      imports: [RouterTestingModule.withRoutes([
        { path: 'dashboard', component: DummyComponent }
      ])],
      providers: [
        AobApplicationsGuardService,
        {
          provide: AobPermissionsService,
          useValue: aobPermissionsServiceStub,
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
    service = TestBed.inject(AobApplicationsGuardService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('canActivate() should return true if user has AOB_4_AOB_ADMIN group', fakeAsync(() => {
    isAobApplicationAdmin = true;
    isAobApplicationOwner = false;

    service.canActivate().subscribe((val: boolean) => {
      expect(val).toEqual(true);
    });

    authenticationServiceStub.onSessionResponse.next({ IsLoggedIn: true });

    flush();
  }));

  it('canActivate() should return true if user has AOB_4_AOBAPP_OWNER group', fakeAsync(() => {
    isAobApplicationOwner = true;
    isAobApplicationAdmin = false;

    service.canActivate().subscribe((val: boolean) => {
      expect(val).toEqual(true);
    });

    authenticationServiceStub.onSessionResponse.next({ IsLoggedIn: true });

    flush();
  }));

  it("canActivate() should return false if user doesn't have AOB_4_AOB_ADMIN or AOB_4_AOBAPP_OWNER group", fakeAsync(() => {
    isAobApplicationOwner = false;  
    isAobApplicationAdmin = false;

    service.canActivate().subscribe((val: boolean) => {
      expect(val).toEqual(false);
    });

    authenticationServiceStub.onSessionResponse.next({ IsLoggedIn: true });

    flush();
  }));
});
