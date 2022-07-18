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

import { Component, Input } from '@angular/core';
import { TestBed, ComponentFixture, fakeAsync, flush, waitForAsync } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { EuiLoadingService } from '@elemental-ui/core';
import { Subject, of } from 'rxjs';
import { AppComponent } from './app.component';
import { AuthenticationService, ISessionState, clearStylesFromDOM, imx_SessionService, SnackBarService, SystemInfoService, IeWarningService, ExtService } from 'qbm';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ArcGovernanceTestBed } from '../test/arc-governance-test-bed';
import { ProjectConfigurationService, UserModelService } from 'qer';
import { AttestationFeatureGuardService } from 'att';

@Component({
  selector: 'imx-mast-head',
  template: '<p>MockMastHeadComponent</p>',
})
class MockMastHeadComponent {
  @Input() menuList: any;
}

@Component({
  selector: 'imx-menu',
  template: '<p>MockMenuComponent</p>',
})
class MockMenuComponent {
  @Input() menuItems: any;
}

@Component({
  selector: 'imx-usermessage',
  template: '<p>MockUserMessageComponent</p>',
})
class MockUserMessageComponent {
  @Input() public panelClass: string;
}

@Component({
  selector: 'imx-test-blank',
  template: '<p>MockBlankComponent</p>',
})
class MockBlankComponent { }

@Component({
  selector: 'imx-test-simple',
  template: '<p>MockSimpleComponent</p>',
})
class MockSimpleComponent { }

const euiLoadingServiceStub = {
  hide: jasmine.createSpy('hide'),
  show: jasmine.createSpy('show'),
};

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;
  let alertSpy;

  const mockAuthenticationService = {
    onSessionResponse: new Subject<ISessionState>(),
    update: jasmine.createSpy('update'),
    logout: jasmine.createSpy('logout'),
  };

  const mockSessionService = {
    getSessionState: jasmine.createSpy('getSessionState').and.returnValue(
      Promise.resolve({
        IsLoggedOut: true,
        IsLoggedIn: false,
        Config: [],
        SecondaryAuthName: '',
        UserUid: '',
        Status: {
          PrimaryAuth: {
            IsAuthenticated: false,
          },
        },
      })
    ),
  };

  const mockUserModelService = {
    getGroups: () => {
      return Promise.resolve([]);
    },
    getUserConfig: () => {
      return Promise.resolve({});
    }
  };

  const mockSystemInfoService = {
    get: () => {
      return { UpdatePhase: 0, PreProps:[] };
    },
  };

  const mockAttFeatureGuardService = {
    getAttestationConfig: () => {
      return Promise.resolve({});
    }
  };

  const ieWarningServiceStub = {
    showIe11Banner: () => Promise.resolve()
  };

  ArcGovernanceTestBed.configureTestingModule({
    imports: [
      RouterTestingModule.withRoutes([
        { path: '', component: MockBlankComponent },
        { path: 'simple', component: MockSimpleComponent },
        { path: 'data/explorer', component: MockBlankComponent },
      ]),
      NoopAnimationsModule,
    ],
    declarations: [AppComponent, MockMastHeadComponent, MockMenuComponent, MockUserMessageComponent],
    providers: [
      {
        provide: AuthenticationService,
        useValue: mockAuthenticationService,
      },
      {
        provide: EuiLoadingService,
        useValue: euiLoadingServiceStub,
      },
      {
        provide: imx_SessionService,
        useValue: mockSessionService,
      },
      {
        provide: SnackBarService,
        useValue: {
          open: jasmine.createSpy('open'),
        },
      },
      {
        provide: UserModelService,
        useValue: mockUserModelService,
      },
      {
        provide: SystemInfoService,
        useValue: mockSystemInfoService,
      },
      {
        provide: AttestationFeatureGuardService,
        useValue: mockAttFeatureGuardService,
      },
      {
        provide: ExtService,
        useValue: {
          register: () => { }
        }
      },
      {
        provide: IeWarningService,
        useValue: ieWarningServiceStub,
      },
      {
        provide: ProjectConfigurationService,
        useValue: {
          getConfig: __ => Promise.resolve({})
        }
      }
    ]
  });

  beforeEach(waitForAsync(() => {
    mockAuthenticationService.update.calls.reset();
    mockAuthenticationService.logout.calls.reset();
    euiLoadingServiceStub.show.calls.reset();
    euiLoadingServiceStub.hide.calls.reset();
    mockSessionService.getSessionState.calls.reset();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterAll(() => {
    clearStylesFromDOM();
  });

  [
    {
      state: { IsLoggedIn: false, configurationProviders: [{ name: 'test', display: 'test', isOAuth2: true }] },
      expectedNavigationSetupCalls: 0,
    },
    {
      state: { IsLoggedIn: true, UserUid: '10', configurationProviders: [{ name: 'test', display: 'test', isOAuth2: true }] },
      expectedNavigationSetupCalls: 1,
    },
  ].forEach((testcase) =>
    it('gets the menu items only when logged in', fakeAsync(() => {
      const setupNavSpy: jasmine.Spy = spyOn<any>(component, 'setupNavigationItems');
      mockAuthenticationService.onSessionResponse.next(testcase.state);
      flush();
      expect(setupNavSpy).toHaveBeenCalledTimes(testcase.expectedNavigationSetupCalls);
    }))
  );

  it('should init the app and show the loading service while navigation', () => {
    component.ngOnInit();
    expect(mockAuthenticationService.update).toHaveBeenCalled();
    const router = TestBed.get(Router) as Router;
    fixture.ngZone.run(() => {
      router.navigate(['']);
      fixture.detectChanges();
      fixture.whenStable().then(() => {
        expect(euiLoadingServiceStub.show).toHaveBeenCalled();
        expect(euiLoadingServiceStub.show.calls.count).toBe(1);
      });
      router.navigate(['simple']);
      fixture.detectChanges();
      fixture.whenStable().then(() => {
        expect(euiLoadingServiceStub.show).toHaveBeenCalled();
        expect(euiLoadingServiceStub.show.calls.count).toBe(2);
      });
    });
  });

  it('should call onSessionResponse unsubscribe on destroy', () => {
    const onSessionRespUnsubscribeSpy = spyOn<any>(component['onSessionResponse'], 'unsubscribe');
    fixture.componentInstance.ngOnDestroy();
    expect(onSessionRespUnsubscribeSpy).toHaveBeenCalled();
  });

  describe('system update check', () => {
    beforeEach(() => {
      alertSpy = spyOn<any>(component, 'openUpgradeAlert');
      spyOn(mockSystemInfoService, 'get').and.returnValue({ UpdatePhase: 1 , PreProps:[]});
      spyOn(component['translate'], 'get').and.returnValue(of('test'));
    });

    it('should call openUpgradeAlert() if system UpdatePhase is not 0', fakeAsync(() => {
      component['checkSystemInfo']();
      flush();
      expect(alertSpy).toHaveBeenCalled();
    }));
  });

  describe('logout() tests', () => {
    let routerSpy: jasmine.Spy;
    beforeEach(() => (routerSpy = spyOn<any>(component['router'], 'navigate')));

    it(`should log out the user when logout is called`, async () => {
      await component.logout();
      expect(mockAuthenticationService.logout).toHaveBeenCalled();
    });
  });
});
