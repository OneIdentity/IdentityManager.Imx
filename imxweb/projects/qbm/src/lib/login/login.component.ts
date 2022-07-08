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
 * Copyright 2021 One Identity LLC.
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
import { EuiLoadingService } from '@elemental-ui/core';
import { Subscription } from 'rxjs';

import { Globals } from 'imx-qbm-dbts';
import { ISessionState } from '../session/session-state';
import { AuthenticationService } from '../authentication/authentication.service';
import { AppConfigService } from '../appConfig/appConfig.service';
import { AuthConfigProvider } from '../authentication/auth-config-provider.interface';
import { ClassloggerService } from '../classlogger/classlogger.service';
import { ExtDirective } from '../ext/ext.directive';

@Component({
  selector: 'imx-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit, OnDestroy {

  @ViewChild(ExtDirective, { static: true }) public directive: ExtDirective;

  public readonly title: string;
  public readonly product: { name: string; copyright: string; } = {
    name: Globals.QIM_ProductNameFull,
    copyright: Globals.QBM_Copyright
  };
  public loginData: { [id: string]: string; } = {};
  public selectedConfigProvider: AuthConfigProvider;
  public sessionState: ISessionState;
  public configurationProviders: AuthConfigProvider[];
  public logoUrl: string;

  private readonly authProviderStorageKey = 'selectedAuthProvider';
  private readonly subscriptions: Subscription[] = [];

  constructor(
    private readonly authentication: AuthenticationService,
    private readonly router: Router,
    private readonly appConfigService: AppConfigService,
    private readonly logger: ClassloggerService,
    private readonly componentFactoryResolver: ComponentFactoryResolver,
    private readonly busyService: EuiLoadingService
  ) {

    if (!this.appConfigService.Config.DoNotShowAppNameWithProduct) {
      this.title = this.appConfigService.Config.Title;
    }

    this.subscriptions.push(this.authentication.onSessionResponse.subscribe((sessionState: ISessionState) => {
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
            this.sessionState.configurationProviders.find(authProvider =>
              authProvider.name === localStorage.getItem(this.authProviderStorageKey)
            ) || this.sessionState.configurationProviders[0];
          this.onSelectAuthConfig();
        }
      }
    }));
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
        await this.authentication.oauthRedirect(
          this.selectedConfigProvider.name
        );
        return;
      }
      else if (this.selectedConfigProvider.customAuthFlow) {
        throw new Error('Method not valid for a custom auth flow.');
      }
    }

    let overlayRef: OverlayRef;
    setTimeout(() => overlayRef = this.busyService.show());
    try {
      await this.authentication.login(this.loginData);
    } finally {
      this.logger.debug(this, 'LoginComponent - login - attempt completed');
      setTimeout(() => this.busyService.hide(overlayRef));
    }

    return Promise.resolve();
  }

  public async ngOnInit(): Promise<void> {
    const config = await this.appConfigService.getImxConfig();
    if (config.CompanyLogoUrl) {
      // make relative URL absolute if needed
      this.logoUrl = new URL(config.CompanyLogoUrl, this.appConfigService.BaseUrl).href;
    }
    const name = config.ProductName;
    if (name) {
      this.product.name = name;
    }

    this.initCustomAuthFlowView();
  }

  public ngOnDestroy(): void {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  public onSelectAuthConfig(): void {
    this.logger.debug(this, 'LoginComponent - onSelectAuthConfig', this.selectedConfigProvider.name);
    localStorage.setItem(this.authProviderStorageKey, this.selectedConfigProvider.name);
    this.loginData = { Module: this.selectedConfigProvider.name };

    this.initCustomAuthFlowView();
  }

  private buildConfigurationProviders(): void {
    let provider = this.sessionState?.configurationProviders;
    if (!provider) {
      provider = [];
    }
    for (const registeredProvider of this.authentication.authConfigProviders) {
      if (provider.length === 0 || provider.findIndex(prov => prov.name === registeredProvider.name) === -1) {
        provider.push(registeredProvider);
      }
    }
    this.configurationProviders = provider;
  }

  private initCustomAuthFlowView(): void {
    if (this.directive) {
      if (this.selectedConfigProvider?.customAuthFlow) {
        this.directive.viewContainerRef.clear();
        this.directive.viewContainerRef.createComponent(
          this.componentFactoryResolver.resolveComponentFactory(this.selectedConfigProvider.customAuthFlow.getEntryComponent()));
      }
      else {
        this.directive.viewContainerRef.clear();
      }
    }
  }
}
