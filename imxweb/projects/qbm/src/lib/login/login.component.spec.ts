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
import { ComponentFixture, TestBed, fakeAsync, tick, waitForAsync } from '@angular/core/testing';
import { Router } from '@angular/router';
import { MatSelectModule } from '@angular/material/select';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { EuiLogoComponent, EuiLoadingService } from '@elemental-ui/core';
import { configureTestSuite } from 'ng-bullet';
import { LoggerTestingModule } from 'ngx-logger/testing';
import { Subject } from 'rxjs';

import { LoginComponent } from './login.component';
import { ISessionState } from '../session/session-state';
import { AuthenticationService } from '../authentication/authentication.service';
import { AppConfigService } from '../appConfig/appConfig.service';
import { TwoFactorAuthenticationComponent } from '../two-factor-authentication/two-factor-authentication.component';
import { Globals } from 'imx-qbm-dbts';
import { clearStylesFromDOM } from '../testing/clear-styles.spec';
import { AuthConfigProvider } from '../authentication/auth-config-provider.interface';

@Component({
  selector: 'imx-usermessage',
  template: '<p>MockUserMessageComponent</p>'
})
class MockUserMessageComponent {
  message: any;
  @Input() public panelClass: string;
}

  describe('LoginComponent', () => {
    let component: LoginComponent;
    let fixture: ComponentFixture<LoginComponent>;

    const mockAuthenticationService = {
      onSessionResponse: new Subject<ISessionState>(),
      update: jasmine.createSpy('update'),
      login: jasmine.createSpy('login'),
      oauthRedirect: jasmine.createSpy('oauthRedirect').and.returnValue(Promise.resolve())
    };

    const mockRouter = {
      navigate: jasmine.createSpy('navigate'),
      url: 'some url'
    };

    const mockImxAppConfigService = {
      onConfigTitleUpdated: { 
        subscribe: () => { return { unsubscribe: () => { } } }
      },
      getImxConfig: jasmine.createSpy('getImxConfig').and.returnValue(Promise.resolve({ProductName: null})),
      Config: {
        Basepath: '',
        BaseUrl: '',
        Title: ''
      }
    };

    const euiLoadingServiceStub = {
      hide: jasmine.createSpy('hide'),
      show: jasmine.createSpy('show')
    };

    configureTestSuite(() => {
      TestBed.configureTestingModule({
        declarations: [
          EuiLogoComponent,
          LoginComponent,
          TwoFactorAuthenticationComponent,
          MockUserMessageComponent
        ],
        imports: [
          BrowserModule,
          FormsModule,
          LoggerTestingModule,
          MatSelectModule,
          ReactiveFormsModule
        ],
        providers: [
          {
            provide: AuthenticationService,
            useValue: mockAuthenticationService
          },
          {
            provide: Router,
            useValue: mockRouter
          },
          {
            provide: AppConfigService,
            useValue: mockImxAppConfigService
          },
          {
            provide: EuiLoadingService,
            useValue: euiLoadingServiceStub
          }
        ]
      });
    });

    beforeEach(waitForAsync(() => {
      mockAuthenticationService.update.calls.reset();
      mockAuthenticationService.login.calls.reset();
      mockAuthenticationService.oauthRedirect.calls.reset();
      mockRouter.navigate.calls.reset();
      euiLoadingServiceStub.hide.calls.reset();
      euiLoadingServiceStub.show.calls.reset();
      mockImxAppConfigService.getImxConfig.calls.reset();
    }));

    beforeEach(() => {
      fixture = TestBed.createComponent(LoginComponent);
      component = fixture.componentInstance;
    });

    afterAll(() => {
      clearStylesFromDOM();
    });

    it('should create', () => {
      expect(component).toBeTruthy();
      expect(component.product.name).toEqual(Globals.QIM_ProductNameFull);
      expect(component.product.copyright).toEqual(Globals.QBM_Copyright);
    });

    it('could be initialized by angular', fakeAsync(() => {
      fixture.detectChanges();
      tick();
      expect(mockImxAppConfigService.getImxConfig).toHaveBeenCalled();
    }));

    it('resets the loginData when AuthConfig is selected', () => {
      component.selectedConfigProvider = {
        name: 'TestDummyConfigName0',
        display: 'TestDummyConfigDisplay0',
        isOAuth2: true
      };

      component.onSelectAuthConfig();
      expect(Object.keys(component.loginData).length).toEqual(1);
      expect(component.loginData['Module']).toEqual(component.selectedConfigProvider.name);
    });

    it('provides a login method with a busy indicator', fakeAsync(() => {
      component.login();
      tick();
      expect(mockAuthenticationService.login).toHaveBeenCalled();
      expect(euiLoadingServiceStub.show).toHaveBeenCalled();
      expect(euiLoadingServiceStub.hide).toHaveBeenCalled();
    }));

    it('provides a login method that redirects to an OAuth page', async () => {
      const authConfigProvider = {
        name: 'some config provider name',
        isOAuth2: true
      } as AuthConfigProvider;

      component.selectedConfigProvider = authConfigProvider;

      await component.login();
      expect(mockAuthenticationService.oauthRedirect).toHaveBeenCalledWith(authConfigProvider.name);
      expect(mockAuthenticationService.login).not.toHaveBeenCalled();
    });

    it('unsubscribes on destroy', () => {
      fixture.detectChanges();

      expect(mockAuthenticationService.onSessionResponse.observers.length).toBeGreaterThan(0);

      fixture.destroy();

      expect(mockAuthenticationService.onSessionResponse.observers.length).toEqual(0);
    });
  });
