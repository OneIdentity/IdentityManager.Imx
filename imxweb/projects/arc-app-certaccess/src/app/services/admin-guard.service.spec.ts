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
import { AuthenticationService, ISessionState } from 'qbm';
import { UserModelService } from 'qer';
import { Subject } from 'rxjs';
import { ArcGovernanceTestBed } from '../../test/arc-governance-test-bed';
import { AdminGuardService } from './admin-guard.service';
import { fakeAsync } from '@angular/core/testing';
import { DataExplorerComponent } from '../data-explorer/data-explorer.component';
import { RouterTestingModule } from '@angular/router/testing';
import { flush } from '@angular/core/testing';

describe('AdminGuardService', () => {
  let service: AdminGuardService;

  const mockUserModelService = {
    getGroups: () => {
      return [];
    },
  };

  const authenticationServiceStub = {
    onSessionResponse: new Subject<ISessionState>(),
  };

  ArcGovernanceTestBed.configureTestingModule({
    declarations: [DataExplorerComponent],
    imports: [RouterTestingModule.withRoutes([{ path: 'dashboard', component: DataExplorerComponent }])],
    providers: [
      AdminGuardService,
      {
        provide: UserModelService,
        useValue: mockUserModelService,
      },
      {
        provide: AuthenticationService,
        useValue: authenticationServiceStub,
      },
    ],
  });

  beforeEach(() => {
    service = TestBed.inject(AdminGuardService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  function testWithGroupName(groupName: string) {
    spyOn(mockUserModelService, 'getGroups').and.returnValue([{ Name: groupName }]);

    service.canActivate(undefined, null).subscribe((val: boolean) => {
      expect(val).toEqual(true);
    });

    authenticationServiceStub.onSessionResponse.next({ IsLoggedIn: true });

    flush();

  }

  it('canActivate() should return true if user has SIM_4_OPAAdmin group', fakeAsync(() => {
    testWithGroupName('SIM_4_OPAAdmin');
  }));

  it('canActivate() should return true if user has SIM_BASEDATA_USERINTERFACE group', fakeAsync(() => {
    testWithGroupName('SIM_BASEDATA_USERINTERFACE');
  }));

  it('canActivate() should return true if user has VI_4_NAMESPACEADMIN_ADS group', fakeAsync(() => {
    testWithGroupName('VI_4_NAMESPACEADMIN_ADS');
  }));

  it('canActivate() should return true if user has VI_4_ITSHOPADMIN_ADMIN', fakeAsync(() => {
    testWithGroupName('VI_4_ITSHOPADMIN_ADMIN');
  }));

  it("canActivate() should return false if user doesn't have SIM_4_OPAAdmin or SIM_BASEDATA_USERINTERFACE group", fakeAsync(() => {
    spyOn(mockUserModelService, 'getGroups').and.returnValue([{ Name: 'test' }]);

    service.canActivate(undefined, null).subscribe((val: boolean) => {
      expect(val).toEqual(false);
    });

    authenticationServiceStub.onSessionResponse.next({ IsLoggedIn: true });

    flush();
  }));
});
