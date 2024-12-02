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

import { Component, ErrorHandler, OnDestroy, OnInit } from '@angular/core';
import { Event, EventType, NavigationEnd, NavigationStart, Router, RouterEvent } from '@angular/router';
import { Subscription } from 'rxjs';

import { MatDialog } from '@angular/material/dialog';
import { EuiTheme, EuiThemeService } from '@elemental-ui/core';
import { ProfileSettings } from '@imx-modules/imx-api-qer';
import {
  AppConfigService,
  AuthenticationService,
  ClassloggerService,
  ConfirmationService,
  ImxTranslationProviderService,
  ISessionState,
  Message,
  SplashService,
  UserMessageService,
} from 'qbm';
import { QerApiService, SettingsComponent } from 'qer';
import { getBaseHref, HEADLESS_BASEHREF } from './app.module';

@Component({
  selector: 'imx-root',
  styleUrls: ['./app.component.scss'],
  templateUrl: './app.component.html',
})
export class AppComponent implements OnInit, OnDestroy {
  public isLoggedIn = false;
  public showPageContent = true;
  public message: Message | undefined;
  private routerStatus: EventType;
  private readonly subscriptions: Subscription[] = [];

  constructor(
    private readonly logger: ClassloggerService,
    private readonly authentication: AuthenticationService,
    private readonly router: Router,
    private readonly splash: SplashService,
    private readonly config: AppConfigService,
    private dialog: MatDialog,
    private qerClient: QerApiService,
    private readonly themeService: EuiThemeService,
    private readonly errorHandler: ErrorHandler,
    private readonly translationProvider: ImxTranslationProviderService,
    private readonly confirmationService: ConfirmationService,
    private readonly userMessageService: UserMessageService,
  ) {
    this.subscriptions.push(
      this.authentication.onSessionResponse.subscribe(async (sessionState: ISessionState) => {
        if (sessionState.hasErrorState) {
          // Needs to close here when there is an error on sessionState
          this.splash.close();
        } else {
          if (sessionState.IsLoggedOut && !this.isOnUserActivation() && this.routerStatus !== EventType.NavigationEnd) {
            this.showPageContent = false;
          }
        }

        this.isLoggedIn = sessionState.IsLoggedIn ?? false;
        if (this.isLoggedIn) {
          const isUseProfileLangChecked = (await this.qerClient.client.passwordreset_profile_get()).UseProfileLanguage ?? false;
          // Set session culture if isUseProfileLangChecked is true
          if (isUseProfileLangChecked) {
            // Use culture if available, if not fetch
            const culture = sessionState.culture
              ? sessionState.culture
              : (await this.qerClient.client.passwordreset_profile_person_get())?.ProfileLanguage;
            // If culture is found, use it, otherwise fallback to the app default
            if (culture) {
              this.logger.debug(this, `ProfileLangChecked is true, culture available: Setting ${culture} as profile language`);
              await this.translationProvider.reinit(culture, sessionState.cultureFormat ?? culture, this.router);
            }
          }

          // Close the splash screen that opened in app service initialisation
          // Needs to close here when running in containers (auth skipped)
          this.splash.close();
          this.applyProfileSettings();
        }
      }),
    );

    this.subscriptions.push(
      this.userMessageService.subject.subscribe((message) => {
        this.message = message;
        if (!!this.message && this.message.type === 'error' && !this.message.target) {
          this.confirmationService.showErrorMessage({
            Message: this.message?.text,
          });
        }
      }),
    );

    this.setupRouter();
  }

  public async ngOnInit(): Promise<void> {
    await this.authentication.update();
  }

  public ngOnDestroy(): void {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }

  public async openSettingsDialog(): Promise<void> {
    this.dialog.open(SettingsComponent, { minWidth: '600px' });
  }

  public get isPageHeadless(): boolean {
    return getBaseHref() === HEADLESS_BASEHREF;
  }

  private isOnUserActivation(): boolean {
    return this.router.url.startsWith('/useractivation');
  }

  private setupRouter(): void {
    this.router.events.subscribe((event: Event & RouterEvent) => {
      if (event instanceof NavigationStart) {
        this.routerStatus = event.type;
        if (this.isLoggedIn) {
          if (event.url === '/') {
            // show the splash screen, when the user logs out!
            this.splash.init({ applicationName: 'Password Reset Portal' });
          } else if (event.url === `/${this.config.Config.routeConfig?.start}`) {
            // closes the splash-screen, if its displayed between Login and Dashboard
            this.splash.close();
          }
        }
      }

      if (event instanceof NavigationEnd) {
        this.routerStatus = event.type;
        this.showPageContent = true;
      }
    });
  }

  private async applyProfileSettings() {
    try {
      let profileSettings: ProfileSettings = await this.qerClient.client.passwordreset_profile_get();
      if (profileSettings?.PreferredAppThemes) {
        this.themeService.setTheme(<EuiTheme>profileSettings.PreferredAppThemes);
      }
    } catch (error) {
      this.errorHandler.handleError(error);
    }
  }
}
