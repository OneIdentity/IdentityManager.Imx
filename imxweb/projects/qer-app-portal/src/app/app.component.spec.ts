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
import { TestBed, fakeAsync, tick, waitForAsync } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { EuiLoadingService } from '@elemental-ui/core';
import { configureTestSuite } from 'ng-bullet';
import { LoggerTestingModule } from 'ngx-logger/testing';
import { Subject } from 'rxjs';

import { AppComponent } from './app.component';
import { AuthenticationService, ISessionState, clearStylesFromDOM, MenuService, SystemInfoService, IeWarningService, SplashService } from 'qbm';
import { ProjectConfigurationService, UserModelService } from 'qer';

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

const userModelServiceStub = {
  getGroups: jasmine.createSpy('getGroups').and.returnValue(Promise.resolve([])),
  getPendingItems: jasmine.createSpy('getPendingItems').and.returnValue({
    CountProductsInShoppingCart: 1,
  }),
  onPendingItemsChange: new Subject(),
};

const authenticationServiceStub = {
  onSessionResponse: new Subject<ISessionState>(),
  update: jasmine.createSpy('update'),
};

const ieWarningServiceStub = {
  showIe11Banner: () => Promise.resolve()
};

describe('AppComponent', () => {
  const menuServiceStub = {
    getMenuItems: jasmine.createSpy('getMenuItems').and.returnValue(Promise.resolve([])),
  };

  const splashServiceStub = {
    init: jasmine.createSpy('init'),
    update: jasmine.createSpy('update'),
    close: jasmine.createSpy('close'),
  }

  configureTestSuite(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule.withRoutes([
          { path: '', component: MockBlankComponent },
          { path: 'simple', component: MockSimpleComponent },
        ]),
        LoggerTestingModule,
      ],
      declarations: [
        AppComponent,
        MockMastHeadComponent,
        MockMenuComponent,
        MockUserMessageComponent
      ],
      providers: [
        {
          provide: AuthenticationService,
          useValue: authenticationServiceStub,
        },
        {
          provide: MenuService,
          useValue: menuServiceStub,
        },
        {
          provide: SystemInfoService,
          useValue: {
            get: jasmine.createSpy('get').and.returnValue(Promise.resolve({})),
          },
        },
        {
          provide: EuiLoadingService,
          useValue: euiLoadingServiceStub,
        },
        {
          provide: SplashService,
          useValue: splashServiceStub
        },
        {
          provide: UserModelService,
          useValue: userModelServiceStub,
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
      ],
    });
  });

  beforeEach(waitForAsync(() => {
    menuServiceStub.getMenuItems.calls.reset();
    authenticationServiceStub.update.calls.reset();
    euiLoadingServiceStub.show.calls.reset();
    euiLoadingServiceStub.hide.calls.reset();
  }));

  afterAll(() => {
    clearStylesFromDOM();
  });

  it('should init the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.debugElement.componentInstance.ngOnInit();
    expect(authenticationServiceStub.update).toHaveBeenCalled();
  });

  for (const testcase of [
    { state: { IsLoggedIn: false }, expectedMenuItemsCalls: 0 },
    { state: { IsLoggedIn: true }, expectedMenuItemsCalls: 1 },
  ]) {
    it(`gets the menu items only when logged (state=${testcase.state.IsLoggedIn})`, fakeAsync(() => {
      TestBed.createComponent(AppComponent);
      authenticationServiceStub.onSessionResponse.next(testcase.state);
      tick();
      expect(menuServiceStub.getMenuItems).toHaveBeenCalledTimes(testcase.expectedMenuItemsCalls);
    }));
  }

  it('should show the loading service while navigation', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.debugElement.componentInstance.ngOnInit();
    expect(authenticationServiceStub.update).toHaveBeenCalled();

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
});
