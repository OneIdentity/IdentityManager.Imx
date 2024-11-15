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
 * Copyright 2024 One Identity LLC.
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

import {
  AfterViewChecked,
  ChangeDetectorRef,
  Component,
  ComponentFactoryResolver,
  OnDestroy,
  OnInit,
  QueryList,
  ViewChild,
  ViewChildren,
} from '@angular/core';
import { Router } from '@angular/router';
import { EuiLoadingService, EuiSplashScreenService, EuiTheme, EuiThemeService } from '@elemental-ui/core';
import { Subscription } from 'rxjs';

import { HighContrastModeDetector } from '@angular/cdk/a11y';
import { MatInput } from '@angular/material/input';
import { Globals } from '@imx-modules/imx-qbm-dbts';
import { ReCaptchaV3Service } from 'ng-recaptcha-2';
import { AppConfigService } from '../appConfig/appConfig.service';
import { AuthConfigProvider, PreAuthStateType } from '../authentication/auth-config-provider.interface';
import { AuthenticationService } from '../authentication/authentication.service';
import { ErrorService } from '../base/error.service';
import { CaptchaService } from '../captcha/captcha.service';
import { ClassloggerService } from '../classlogger/classlogger.service';
import { ExtDirective } from '../ext/ext.directive';
import { ISessionState } from '../session/session-state';
import { SystemInfoService } from '../system-info/system-info.service';

@Component({
  selector: 'imx-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit, OnDestroy, AfterViewChecked {
  @ViewChild(ExtDirective, { static: true }) public directive: ExtDirective;
  @ViewChildren('authPropertyInput') authPropertyInput: QueryList<MatInput>;
  @ViewChildren('preAuthPropertyInput') preAuthPropertyInput: QueryList<MatInput>;

  private firstTime: boolean = true;
  public title: string;
  public readonly product: { name: string; copyright: string } = {
    name: Globals.QIM_ProductNameFull,
    copyright: Globals.QBM_Copyright,
  };
  public loginData: { [id: string]: string } = {};
  public selectedConfigProvider: AuthConfigProvider;
  public sessionState: ISessionState;
  public configurationProviders: AuthConfigProvider[];
  public logoUrl: string;
  public newUserConfigProvider: AuthConfigProvider;
  public preAuthStateType = PreAuthStateType;

  private readonly newUserConfigProviderName = 'NewUser';
  private readonly authProviderStorageKey = 'selectedAuthProvider';
  private readonly subscriptions: Subscription[] = [];
  private disposable: () => void;

  constructor(
    public readonly appConfigService: AppConfigService,
    private readonly authentication: AuthenticationService,
    private readonly router: Router,
    private readonly logger: ClassloggerService,
    private readonly systemInfoService: SystemInfoService,
    private readonly componentFactoryResolver: ComponentFactoryResolver,
    private readonly splash: EuiSplashScreenService,
    private readonly busyService: EuiLoadingService,
    private readonly themeService: EuiThemeService,
    private readonly detector: HighContrastModeDetector,
    private readonly errorService: ErrorService,
    private readonly captchaService: CaptchaService,
    private readonly recaptchaV3Service: ReCaptchaV3Service,
    private readonly changeDetection: ChangeDetectorRef,
  ) {
    this.title = this.appConfigService.Config.Title;
    this.subscriptions.push(
      this.appConfigService.onConfigTitleUpdated.subscribe(() => {
        this.title = this.appConfigService.Config.Title;
      }),
    );

    this.subscriptions.push(
      this.authentication.onSessionResponse.subscribe(async (sessionState: ISessionState) => {
        this.logger.debug(this, 'LoginComponent - subscription - onSessionResponse');
        this.logger.trace(this, 'sessionState', sessionState);
        const existingConfig = this.sessionState?.configurationProviders;
        this.sessionState = sessionState;
        if (this.sessionState.IsLoggedIn) {
          this.logger.debug(this, 'subscription - call navigate');
          await this.router.navigate([this.appConfigService.Config.routeConfig?.start], { queryParams: {} });
        } else {
          // Cover the case where an error has occurred and the new sessionState does not contain the configurationProviders
          if (!this.sessionState.configurationProviders) {
            // fallback to the previous known configuration, so the login form fields can still be displayed
            this.logger.debug(this, 'subscription - no new session config, falling back to previous');
            this.sessionState.configurationProviders = existingConfig;
          }

          this.buildConfigurationProviders();

          if (this.sessionState.configurationProviders && this.sessionState.configurationProviders.length > 0) {
            this.logger.debug(this, 'subscription - updating session config');
            this.sessionState.configurationProviders.map((configProvider) => {
              configProvider.preAuthState = !!configProvider.preAuthState ? this.preAuthStateType.PreAuth : undefined;
            });
            this.selectedConfigProvider =
              this.sessionState.configurationProviders.find(
                (authProvider) => authProvider.name === localStorage.getItem(this.authProviderStorageKey),
              ) || this.sessionState.configurationProviders[0];
            this.onSelectAuthConfig();
          }
        }
      }),
    );
    this.disposable = this.errorService.setTarget('login');
  }

  public ngAfterViewChecked(): void {
    this.authPropertyInput.changes.subscribe(() => this.focusAuthProperty(false));
    this.preAuthPropertyInput.changes.subscribe(() => this.focusAuthProperty(true));

    if (this.firstTime) {
      this.firstTime = false;
      this.focusAuthProperty(true);
    }
  }

  public async ngOnInit(): Promise<void> {
    const config = await this.systemInfoService.getImxConfig();
    if (config.DefaultHtmlTheme) {
      if (config.DefaultHtmlTheme === 'eui-auto-theme' && this.detector.getHighContrastMode() > 0) {
        this.themeService.setTheme(EuiTheme.CONTRAST);
      } else if (this.title === 'Administration Portal') {
        this.themeService.setTheme(EuiTheme.LIGHT);
      } else {
        this.themeService.setTheme(<EuiTheme>config.DefaultHtmlTheme);
      }
    }
    if (config.CompanyLogoUrl) {
      // make relative URL absolute if needed
      this.logoUrl = new URL(config.CompanyLogoUrl, this.appConfigService.BaseUrl).href;
    }
    const name = config.ProductName;
    if (name) {
      this.product.name = name;
    }

    this.initCustomAuthFlowView(this.selectedConfigProvider);
    this.splash.close();
  }

  public ngOnDestroy(): void {
    this.disposable();
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }

  /**
   * Calls authentication service logout function.
   */
  public async logoutOAuth(): Promise<void> {
    this.logger.debug(this, 'logoutOAuth');
    return this.authentication.logout(this.sessionState);
  }

  /**
   * Calls the required login method.
   */
  public async login(): Promise<void> {
    this.logger.debug(this, 'LoginComponent - login');

    if (this.selectedConfigProvider) {
      if (this.selectedConfigProvider.isOAuth2) {
        this.logger.debug(this, 'LoginComponent - login - oauth2');
        await this.authentication.oauthRedirect(this.selectedConfigProvider.name);
        return;
      } else if (this.selectedConfigProvider.customAuthFlow) {
        throw new Error('Method not valid for a custom auth flow.');
      }
    }

    if (this.busyService.overlayRefs.length === 0) {
      this.busyService.show();
    }
    try {
      await this.authentication.login(this.loginData);
    } finally {
      this.logger.debug(this, 'LoginComponent - login - attempt completed');
      this.busyService.hide();
    }

    return Promise.resolve();
  }

  /**
   * Updates the localStorage and calls initCustAuthFlowView with the selected configuration provider.
   */
  public onSelectAuthConfig(): void {
    this.logger.debug(this, 'LoginComponent - onSelectAuthConfig', this.selectedConfigProvider.name);
    localStorage.setItem(this.authProviderStorageKey, this.selectedConfigProvider.name);
    this.loginData = { Module: this.selectedConfigProvider.name };
    this.configurationProviders.map((provider) => {
      if (provider.preAuthState === this.preAuthStateType.Captcha || provider.preAuthState === this.preAuthStateType.Auth) {
        provider.preAuthState = this.preAuthStateType.PreAuth;
      }
    });
    this.initCustomAuthFlowView(this.selectedConfigProvider);
  }

  public async createNewAccount(): Promise<void> {
    // Prevent the content from being cleared incase the sidesheet is closed unsuccessfully
    this.initCustomAuthFlowView(this.newUserConfigProvider, false);
  }

  /**
   * Checks if the login proceess needs captcha verification.
   */
  public async checkPreAuth(): Promise<void> {
    let overlayRef = this.busyService.show();
    try {
      const response = await this.authentication.preAuth(this.loginData);
      if (response) {
        this.setupCaptcha();
      } else {
        this.selectedConfigProvider.preAuthState = this.preAuthStateType.Auth;
        this.focusAuthProperty(false);
      }
    } finally {
      this.busyService.hide(overlayRef);
    }
  }

  /**
   * Setup the selected configuration provider to preAuth state.
   */
  public async backToPreAuth(): Promise<void> {
    this.selectedConfigProvider.preAuthState = this.preAuthStateType.PreAuth;
    this.selectedConfigProvider.authProps
      ?.filter((authProp) => !authProp.disabled)
      .map((authProp) => {
        if (this.loginData && authProp.name) delete this.loginData[authProp.name];
      });
  }

  /**
   * Verify the captcha with the recaptcha image component.
   */
  public async onVerifyCaptcha(): Promise<void> {
    this.authentication.preAuthVerify(this.captchaService.Response);
  }

  /**
   * Checks, weather the form should be hidden.
   */
  public get isFormHidden(): boolean {
    return this.selectedConfigProvider?.isOAuth2 || !!this.selectedConfigProvider.preAuthProps?.length;
  }

  /**
   * Returns the selected configuration providere preAuthState.
   */
  public get selectedProviderPreAuthState(): null | PreAuthStateType {
    return this.selectedConfigProvider?.preAuthState ?? null;
  }

  /**
   * Checks, weather the login button should be hidden.
   */
  public get showLoginButton(): boolean {
    return this.selectedProviderPreAuthState == this.preAuthStateType.Auth || !this.selectedProviderPreAuthState;
  }

  /**
   * Checks, weather the back button should be hidden.
   */
  public get showBackButton(): boolean {
    return (
      this.selectedProviderPreAuthState == this.preAuthStateType.Auth || this.selectedProviderPreAuthState == this.preAuthStateType.Captcha
    );
  }

  public get showCreateAccountButton(): boolean {
    return (
      this.newUserConfigProvider &&
      (this.selectedProviderPreAuthState === this.preAuthStateType.PreAuth ||
        (!this.selectedProviderPreAuthState && !!this.selectedConfigProvider?.authProps?.length))
    );
  }

  /**
   * Builds the login options.
   */
  private buildConfigurationProviders(): void {
    const providers = this.sessionState?.configurationProviders ?? [];

    this.authentication.authConfigProviders.forEach((registeredProvider) => {
      if (!providers.find((provider) => provider.name === registeredProvider.name)) {
        providers.push(registeredProvider);
      }
    });

    const newUserIndex = providers.findIndex((x) => x.name === this.newUserConfigProviderName);
    if (newUserIndex > -1) {
      // Remove the newuser provider from the list, it isn't a dropdown option but rather a button
      [this.newUserConfigProvider] = providers.splice(newUserIndex, 1);
    }
    this.configurationProviders = providers;
  }

  /**
   * Initializes the custom authentication by creating the entry component.
   */
  private initCustomAuthFlowView(configProvider: AuthConfigProvider, shouldClear = true): void {
    if (this.directive) {
      if (shouldClear) {
        this.directive.viewContainerRef.clear();
      }
      if (configProvider?.customAuthFlow) {
        this.directive.viewContainerRef.createComponent(
          this.componentFactoryResolver.resolveComponentFactory(configProvider.customAuthFlow.getEntryComponent()),
        );
      }
    }
  }

  /**
   * Setup captcha verification.
   */
  private async setupCaptcha(): Promise<void> {
    if (this.captchaService.isReCaptchaV3) {
      let overlayRef = this.busyService.show();
      this.recaptchaV3Service.execute('login').subscribe(async (result) => {
        try {
          await this.authentication.preAuthVerify(result);
          this.selectedConfigProvider.preAuthState = this.preAuthStateType.Auth;
        } finally {
          this.busyService.hide(overlayRef);
        }
      });
    } else {
      this.selectedConfigProvider.preAuthState = this.preAuthStateType.Captcha;
    }
  }

  /**
   * Focuses an authentication property
   *
   */
  private focusAuthProperty(preAuth: boolean) {
    this.changeDetection.detectChanges();
    const index = preAuth ? 0 : 1;
    const iterable = preAuth ? this.preAuthPropertyInput.toArray() : this.authPropertyInput.toArray();
    if (iterable.length > index) {
      iterable[index]?.focus();
    }
    this.changeDetection.detectChanges();
  }
}
