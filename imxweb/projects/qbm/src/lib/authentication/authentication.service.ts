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

import { ErrorHandler, Injectable, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';

import { EuiSidesheetService } from '@elemental-ui/core';
import { TranslateService } from '@ngx-translate/core';
import { AppConfigService } from '../appConfig/appConfig.service';
import { AuthConfigProvider } from '../authentication/auth-config-provider.interface';
import { ClassloggerService } from '../classlogger/classlogger.service';
import { imx_SessionService } from '../session/imx-session.service';
import { ISessionState } from '../session/session-state';
import { SnackBarService } from '../snackbar/snack-bar.service';
import { UserMessageService } from '../user-message/user-message.service';
import { OAuthService } from './oauth.service';
import { RedirectService } from './redirect.service';

/**
 * Provides the methods necessary for primary and secondary authentication
 */
@Injectable({
  providedIn: 'root',
})
export class AuthenticationService {
  public get authConfigProviders(): ReadonlyArray<AuthConfigProvider> {
    return this.providers;
  }
  public readonly onSessionResponse = new BehaviorSubject<ISessionState>({});

  private providers: AuthConfigProvider[] = [];

  constructor(
    private readonly translateService: TranslateService,
    private readonly session: imx_SessionService,
    private readonly errorHandler: ErrorHandler,
    private readonly logger: ClassloggerService,
    private readonly oauthService: OAuthService,
    private readonly messageService: UserMessageService,
    private readonly snackbar: SnackBarService,
    private readonly redirectService: RedirectService,
    private readonly appConfig: AppConfigService,
    private readonly router: Router,
    private readonly zone: NgZone,
    private readonly euiSidesheetService: EuiSidesheetService,
  ) {}

  public async update(navigateToStart: boolean = false): Promise<void> {
    this.logger.debug(this, 'update');
    await this.handleSessionState(() => this.session.getSessionState());
    if (navigateToStart) {
      if (this.appConfig.Config.routeConfig) {
        this.zone.run(() => this.router.navigate([this.appConfig.Config.routeConfig?.login], { queryParams: {} }));
      } else {
        this.zone.run(() => this.router.navigate(['']));
      }
    }
  }

  public async login(loginData: { [key: string]: string }): Promise<ISessionState | undefined> {
    this.logger.debug(this, 'login');
    let sessionState: ISessionState | undefined;
    await this.processLogin(async () => (sessionState = await this.session.login(loginData)));
    return sessionState;
  }

  public async processLogin(loginMethod: () => Promise<ISessionState>): Promise<void> {
    return this.handleSessionState(async () => {
      this.logger.trace(this, 'login - resetting the message subject...');
      this.messageService.subject.next(undefined);
      return loginMethod();
    });
  }

  public async logout(currentSessionState?: ISessionState, withNotification: boolean = true): Promise<void> {
    this.logger.debug(this, 'logout');

    return this.handleSessionState(async () => {
      const externalLogoutUrl = (currentSessionState || (await this.session.getSessionState())).externalLogoutUrl;

      const sessionState = await this.session.logout();

      if (sessionState && sessionState.IsLoggedOut) {
        this.logger.trace(this, 'logout - resetting the message subject...');
        this.messageService.subject.next(undefined);

        if (externalLogoutUrl) {
          this.logger.debug(this, 'logout - redirecting to external logout URL');
          this.redirectService.redirect(externalLogoutUrl);
        } else {
          if (withNotification) {
            this.snackbar.open({ key: '#LDS#You have successfully logged out.' }, '#LDS#Close');
          }
          if (this.appConfig.Config.routeConfig) {
            this.zone.run(() => this.router.navigate([this.appConfig.Config.routeConfig?.login], { queryParams: {} }));
          }
        }
        // Check for if we are logged out and need to change the language again
        const browserCulture = this.translateService.getBrowserCultureLang();
        if (browserCulture && browserCulture !== this.translateService.currentLang) {
          this.logger.debug(this, `Logout - set ${browserCulture} as language`);
          this.translateService.use(browserCulture).toPromise();
        }
      }
      this.euiSidesheetService.closeAll();

      return sessionState;
    });
  }

  public async oauthLogin(loginData: { [key: string]: any }, currentSessionState: ISessionState): Promise<ISessionState> {
    let sessionState: ISessionState | undefined;

    const isAwaitingSecondaryAuth = currentSessionState && currentSessionState.IsAwaitingSecondaryAuth;
    const oauthLoginData = this.oauthService.convertToOAuthLoginData(loginData);

    if (oauthLoginData) {
      sessionState = await this.login(oauthLoginData);

      if (sessionState == null) {
        sessionState = {
          IsLoggedOut: true,
          isOAuth: true,
          IsAwaitingSecondaryAuth: isAwaitingSecondaryAuth,
        };
      }

      if (sessionState.externalLogoutUrl == null) {
        sessionState.externalLogoutUrl = currentSessionState?.configurationProviders?.find(
          (configurationProvider) => configurationProvider.name === oauthLoginData.Module,
        )?.externalLogoutUrl;
      }
    } else {
      sessionState = (await this.session.getSessionState()) || { IsLoggedOut: true, IsAwaitingSecondaryAuth: isAwaitingSecondaryAuth };
    }

    this.onSessionResponse.next(sessionState);

    return sessionState;
  }

  public async oauthRedirect(authentifier: string): Promise<void> {
    try {
      const providerUrl = await this.oauthService.GetProviderUrl(authentifier);
      this.redirectService.redirect(providerUrl);
    } catch (error) {
      this.errorHandler.handleError(error);
    }
  }

  public registerAuthConfigProvider(authConfig: AuthConfigProvider): void {
    if (this.providers?.length === 0 || this.providers.findIndex((prov) => prov.name === authConfig.name) === -1) {
      this.providers.push(authConfig);
    }
  }

  public async preAuth(preAuthData: { [key: string]: string }): Promise<boolean> {
    const preAuthResponse = await this.session.preAuth(preAuthData);
    return preAuthResponse.RequiresCaptcha;
  }

  public async preAuthVerify(captchaCode: string): Promise<boolean> {
    return await this.session.preAuthVerify(captchaCode);
  }

  private async handleSessionState(getSessionState: () => Promise<ISessionState>): Promise<void> {
    this.logger.debug(this, 'handleSessionState');
    try {
      const sessionState = await getSessionState();
      this.onSessionResponse.next(sessionState);
    } catch (error) {
      this.errorHandler.handleError(error);
      const errorSessionstate: ISessionState = { IsLoggedOut: true, hasErrorState: true };
      // Call next with an error sessionState to notify subscribers of an error
      this.onSessionResponse.next(errorSessionstate);
    }
    return Promise.resolve();
  }
}
