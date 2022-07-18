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
import { UserModelService } from '../user/user-model.service';
import { PersonAdminGuardService } from './person-admin-guard.service';
import { QerPermissionsService } from '../admin/qer-permissions.service';

@Component({
  template: `<div>Dummy</div>`
})
class DummyComponent {
}

describe('PersonAdminGuardService', () => {
  let service: PersonAdminGuardService;

  const mockUserModelService = {
    getGroups: () => {
      return [];
    },
  };

  const authenticationServiceStub = {
    onSessionResponse: new Subject<ISessionState>(),
  };
  
  let isPersonAdmin = false; 

  const qerPermissionsServiceStub = {
    isPersonAdmin: jasmine.createSpy('isPersonAdmin').and.callFake(() => isPersonAdmin)
  };

  configureTestSuite(() => {
    TestBed.configureTestingModule({
      declarations: [DummyComponent],
      imports: [RouterTestingModule.withRoutes([
        { path: 'dashboard', component: DummyComponent }
      ])],
      providers: [
        PersonAdminGuardService,
        {
          provide: QerPermissionsService,
          useValue: qerPermissionsServiceStub,
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
    service = TestBed.inject(PersonAdminGuardService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('canActivate() should return true if user has VI_4_PERSONADMIN group', fakeAsync(() => {
    isPersonAdmin = true;

    service.canActivate(undefined, null).subscribe((val: boolean) => {
      expect(val).toEqual(true);
    });

    authenticationServiceStub.onSessionResponse.next({ IsLoggedIn: true });

    flush();
  }));

  it("canActivate() should return false if user doesn't have VI_4_PERSONADMIN group", fakeAsync(() => {
    isPersonAdmin = false; 

    service.canActivate(undefined, null).subscribe((val: boolean) => {
      expect(val).toEqual(false);
    });

    authenticationServiceStub.onSessionResponse.next({ IsLoggedIn: true });

    flush();
  }));
});
