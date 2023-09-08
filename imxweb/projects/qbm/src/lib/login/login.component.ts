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
 * Copyright 2023 One Identity LLC.
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

import { OverlayRef } from '@angular/cdk/overlay';
import { Component, OnInit, OnDestroy, ViewChild, ComponentFactoryResolver } from '@angular/core';
import { Router } from '@angular/router';
import { EuiLoadingService, EuiSplashScreenService, EuiTheme, EuiThemeService } from '@elemental-ui/core';
import { Subscription } from 'rxjs';

import { Globals } from 'imx-qbm-dbts';
import { ISessionState } from '../session/session-state';
import { AuthenticationService } from '../authentication/authentication.service';
import { AppConfigService } from '../appConfig/appConfig.service';
import { AuthConfigProvider } from '../authentication/auth-config-provider.interface';
import { ClassloggerService } from '../classlogger/classlogger.service';
import { ExtDirective } from '../ext/ext.directive';
import { SystemInfoService } from '../system-info/system-info.service';
import { HighContrastModeDetector } from '@angular/cdk/a11y';

@Component({
  selector: 'imx-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit, OnDestroy {
  @ViewChild(ExtDirective, { static: true }) public directive: ExtDirective;

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

  private readonly newUserConfigProviderName = 'NewUser';
  private readonly authProviderStorageKey = 'selectedAuthProvider';
  private readonly subscriptions: Subscription[] = [];

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
    private readonly detector: HighContrastModeDetector
  ) {
    this.title = this.appConfigService.Config.Title;
    this.subscriptions.push(
      this.appConfigService.onConfigTitleUpdated.subscribe(() => {
        this.title = this.appConfigService.Config.Title;
      })
    );

    this.subscriptions.push(
      this.authentication.onSessionResponse.subscribe((sessionState: ISessionState) => {
        this.logger.debug(this, 'LoginComponent - subscription - onSessionResponse');
        this.logger.trace(this, 'sessionState', sessionState);
        const existingConfig = this.sessionState?.configurationProviders;
        this.sessionState = sessionState;
        if (this.sessionState.IsLoggedIn) {
          this.logger.debug(this, 'subscription - call navigate');
          this.router.navigate([this.appConfigService.Config.routeConfig.start], { queryParams: {} });
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
            this.selectedConfigProvider =
              this.sessionState.configurationProviders.find(
                (authProvider) => authProvider.name === localStorage.getItem(this.authProviderStorageKey)
              ) || this.sessionState.configurationProviders[0];
            this.onSelectAuthConfig();
          }
        }
      })
    );
  }

  public async logoutOAuth(): Promise<void> {
    this.logger.debug(this, 'logoutOAuth');
    return this.authentication.logout(this.sessionState);
  }

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

    let overlayRef: OverlayRef;
    setTimeout(() => (overlayRef = this.busyService.show()));
    try {
      await this.authentication.login(this.loginData);
    } finally {
      this.logger.debug(this, 'LoginComponent - login - attempt completed');
      setTimeout(() => this.busyService.hide(overlayRef));
    }

    return Promise.resolve();
  }

  public async ngOnInit(): Promise<void> {
    const config = await this.systemInfoService.getImxConfig();
    if (config.DefaultHtmlTheme) {
      let key = Object.keys(EuiTheme).find((x) => x.toUpperCase() == config.DefaultHtmlTheme?.toUpperCase());
      if (key === 'AUTO' && this.detector.getHighContrastMode() > 0) {
        this.themeService.setTheme(EuiTheme['CONTRAST']);
      } else if (this.title === 'Administration Portal') {
        this.themeService.setTheme(EuiTheme['LIGHT']);
      } else {
        this.themeService.setTheme(EuiTheme[key]);
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
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }

  public onSelectAuthConfig(): void {
    this.logger.debug(this, 'LoginComponent - onSelectAuthConfig', this.selectedConfigProvider.name);
    localStorage.setItem(this.authProviderStorageKey, this.selectedConfigProvider.name);
    this.loginData = { Module: this.selectedConfigProvider.name };
    this.initCustomAuthFlowView(this.selectedConfigProvider);
  }

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

  private initCustomAuthFlowView(configProvider: AuthConfigProvider, shouldClear = true): void {
    if (this.directive) {
      if (shouldClear) {
        this.directive.viewContainerRef.clear();
      }
      if (configProvider?.customAuthFlow) {
        this.directive.viewContainerRef.createComponent(
          this.componentFactoryResolver.resolveComponentFactory(configProvider.customAuthFlow.getEntryComponent())
        );
      }
    }
  }

  public async createNewAccount(): Promise<void> {
    // Prevent the content from being cleared incase the sidesheet is closed unsuccessfully
    this.initCustomAuthFlowView(this.newUserConfigProvider, false);
  }
}
