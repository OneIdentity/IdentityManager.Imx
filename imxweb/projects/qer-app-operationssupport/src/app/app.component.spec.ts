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
import { TestBed, waitForAsync } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { EuiLoadingService } from '@elemental-ui/core';
import { configureTestSuite } from 'ng-bullet';
import { Subject } from 'rxjs';

import { AppComponent } from './app.component';
import { AppConfigService, clearStylesFromDOM, ISessionState, AuthenticationService, MenuService, MenuFactory, imx_SessionService, SplashService } from 'qbm';
import { UserService } from './user/user.service';
import { FeatureConfigService } from 'qer';

@Component({
  selector: 'imx-mast-head',
  template: '<p>MockMastHeadComponent</p>'
})
class MockMastHeadComponent { }

@Component({
  selector: 'imx-menu',
  template: '<p>MockMenuComponent</p>'
})
class MockMenuComponent {
  @Input() menuItems: any;
}

@Component({
  selector: 'imx-usermessage',
  template: '<p>MockUserMessageComponent</p>'
})
class MockUserMessageComponent {
  @Input() public panelClass: string;
}

@Component({
  selector: 'imx-test-blank',
  template: '<p>MockBlankComponent</p>'
})
class MockBlankComponent {
}

@Component({
  selector: 'imx-test-simple',
  template: '<p>MockSimpleComponent</p>'
})
class MockSimpleComponent {
}


const euiLoadingServiceStub = {
  hide: jasmine.createSpy('hide'),
  show: jasmine.createSpy('show')
};

describe('AppComponent', () => {
  const mockAuthenticationService = {
    onSessionResponse: new Subject<ISessionState>(),
    update: jasmine.createSpy('update')
  };

  let menuFactories: MenuFactory[];

  const menuServiceStub = {
    addMenuFactories: jasmine.createSpy('addMenuFactories').and.callFake((...factories: any[]) => {
      menuFactories = [];
      menuFactories.push(...factories);
    })
  };

  const splashServiceStub = {
    init: jasmine.createSpy('init'),
    update: jasmine.createSpy('update'),
    close: jasmine.createSpy('close'),
  }

  configureTestSuite(() => {
    TestBed.configureTestingModule({
      declarations: [
        AppComponent,
        MockMastHeadComponent,
        MockMenuComponent,
        MockUserMessageComponent
      ],
      imports: [
        RouterTestingModule.withRoutes(
          [
            { path: '', component: MockBlankComponent },
            { path: 'simple', component: MockSimpleComponent }
          ]
        )
      ],
      providers: [
        {
          provide: AppConfigService,
          useValue: {
            Config: {
              basePath: '',
              baseUrl: '',
              title: '',
              webAppIndex: '',
              notificationUpdateInterval: 0,
              treshold: 0,
              translation: { Langs: [''] }
            }
          }
        },
        {
          provide: EuiLoadingService,
          useValue: euiLoadingServiceStub
        },
        {
          provide: SplashService,
          useValue: splashServiceStub
        },
        {
          provide: AuthenticationService,
          useValue: mockAuthenticationService
        },
        {
          provide: MenuService,
          useValue: menuServiceStub
        },
        {
          provide: UserService,
          useValue: {
            getGroups: jasmine.createSpy('getGroups').and.returnValue({
              Uid: 'QER_4_ManageOutstanding',
              Name: 'QER_4_ManageOutstanding'
            })
          }
        },
        {
          provide: imx_SessionService,
          useValue: {
            Client: { opsupport_config_get: jasmine.createSpy('opsupport_config_get').and.returnValue({DefaultPageSize:20}) }
          }
        },
        {
          provide: FeatureConfigService,
          useValue: {
            getFeatureConfig: jasmine.createSpy('getFeatureConfig').and.returnValue(Promise.resolve({
              EnableSystemStatus:true
            }))
          }
        }
      ]
    });
  });

  beforeEach(waitForAsync(() => {
    mockAuthenticationService.update.calls.reset();
    menuServiceStub.addMenuFactories.calls.reset();
    euiLoadingServiceStub.show.calls.reset();
    euiLoadingServiceStub.hide.calls.reset();
  }));

  afterAll(() => {
    clearStylesFromDOM();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance;
    expect(app).toBeDefined();
  });

  it('should init the app', async () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance;
    await app.ngOnInit();
    expect(mockAuthenticationService.update).toHaveBeenCalled();
  });

  it('should show the loading service while navigation', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.debugElement.componentInstance.ngOnInit();
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
});
