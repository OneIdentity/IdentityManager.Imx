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
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { MatCardModule } from '@angular/material/card';
import { TranslateService } from '@ngx-translate/core';
import { configureTestSuite } from 'ng-bullet';

import { AppComponent } from './app.component';
import { AppConfigService, AuthenticationService, clearStylesFromDOM, ISessionState } from 'qbm';
import { Subject } from 'rxjs';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'imx-mast-head',
  template: '<p>MockMastHeadComponent</p>'
})
class MockMastHeadComponent { }

@Component({
  selector: 'imx-usermessage',
  template: '<p>MockUserMessageComponent</p>'
})
class MockUserMessageComponent { }

describe('AppComponent', () => {

  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;

  const translateCurrentLangSpy = jasmine.createSpy('currentLang').and.returnValue('es_ES');
  const translateUseSpy = jasmine.createSpy('use').and.returnValue(true);

  const mockAuthenticationService = {
    onSessionResponse: new Subject<ISessionState>(),
    update: jasmine.createSpy('update'),
    logout: jasmine.createSpy('logout')
  };
  

  configureTestSuite(() => {
    TestBed.configureTestingModule({
      declarations: [
        AppComponent,
        MockMastHeadComponent,
        MockUserMessageComponent
      ],
      imports: [
        MatCardModule,
        RouterTestingModule
      ],
      providers: [
        {
          provide: TranslateService,
          useClass: class {
            public currentLang = translateCurrentLangSpy;
            public use = translateUseSpy;
            public addLangs = jasmine.createSpy('addLangs').and.callThrough();
            public setDefaultLang = jasmine.createSpy('setDefaultLang').and.callThrough();
            public getBrowserCultureLang = jasmine.createSpy('getBrowserCultureLang').and.callThrough();
            public onLangChange = { subscribe: () => { } };
          }
        },
        {
          provide: Title,
          useValue: {
            setTitle: jasmine.createSpy('setTitle')
          }
        },
        {
          provide: AuthenticationService,
          useValue: mockAuthenticationService
        },
        {
          provide: AppConfigService,
          useClass: class {
            public Config = {
              Basepath: '',
              BaseUrl: '',
              Title: '',
              WebAppIndex: ''
            };
          }
        }
      ]
    });
  });

  afterAll(() => {
    clearStylesFromDOM();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    mockAuthenticationService.logout.calls.reset();
  });

  it('should create the app', () => {
    const app: AppComponent = fixture.debugElement.componentInstance;
    expect(app).toBeDefined();
  });

  describe('logout() tests', () => {
    let routerSpy: jasmine.Spy;
    beforeEach(() => (routerSpy = spyOn<any>(component['router'], 'navigate')));

    it(`should log the user out and redirect back to the app root when logout is called`, async () => {
      await component.logout();
      expect(mockAuthenticationService.logout).toHaveBeenCalled();
      expect(routerSpy).toHaveBeenCalledWith([''], { queryParams: {} });
    });
  });
});
