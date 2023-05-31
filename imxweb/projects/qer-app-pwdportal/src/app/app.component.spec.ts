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
import { NavigationCancel, NavigationEnd, NavigationError, NavigationStart, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { configureTestSuite } from 'ng-bullet';
import { of, Subject } from 'rxjs';

import { AppConfigService, AuthenticationService, clearStylesFromDOM, SplashService } from 'qbm';
import { AppComponent } from './app.component';
import { ProjectConfigurationService } from 'qer';

for (const navigationState of [
  new NavigationStart(2, ''),
  new NavigationCancel(2,'',''),
  new NavigationEnd(2, '',''),
  new NavigationError(2,'','')
]) {

  describe('AppComponent', () => {

    const projectConfigService = {
      getConfig: jasmine.createSpy('getConfig')
    };

    const mockRouter = {
      navigate: jasmine.createSpy('navigate'),
      events: of(navigationState)
    };

    const splashServiceStub = {
      init: jasmine.createSpy('init'),
      update: jasmine.createSpy('update'),
      close: jasmine.createSpy('close'),
    }

    const mockAuthService = {
      onSessionResponse: new Subject()
    };

    configureTestSuite(() => {
      TestBed.configureTestingModule({
        imports: [
          RouterTestingModule
        ],
        declarations: [
          AppComponent
        ],
        providers: [
          {
            provide: Router,
            useValue: mockRouter
          },
          {
            provide: AuthenticationService,
            useValue: mockAuthService
          },
          {
            provide: ProjectConfigurationService,
            useValue: projectConfigService
          },
          {
            provide: SplashService,
            useValue: splashServiceStub
          },
           {
            provide: AppConfigService,
            useValue: {Config: {routeConfig: {start: 'dashboard'}}}
          }
        ]
      });
    });

    afterAll(() => {
      clearStylesFromDOM();
    });

    it('should create the app', () => {
      const fixture = TestBed.createComponent(AppComponent);
      const app = fixture.componentInstance;
      expect(app).toBeTruthy();
    });
  });
}
