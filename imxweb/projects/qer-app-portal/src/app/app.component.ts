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
import { Event, EventType, NavigationEnd, NavigationStart, Router } from '@angular/router';
import { Subscription } from 'rxjs';

import {
  AuthenticationService,
  ClassloggerService,
  ConfirmationService,
  IeWarningService,
  imx_SessionService,
  ImxTranslationProviderService,
  ISessionState,
  MenuService,
  Message,
  SplashService,
  SystemInfoService,
  UserMessageService,
} from 'qbm';

import { ProjectConfigurationService, QerApiService, SettingsComponent, UserModelService } from 'qer';

import { MatDialog } from '@angular/material/dialog';
import { EuiTheme, EuiThemeService, EuiTopNavigationItem } from '@elemental-ui/core';
import { ProjectConfig } from '@imx-modules/imx-api-qbm';
import { ProfileSettings, QerProjectConfig } from '@imx-modules/imx-api-qer';
import { getBaseHref, HEADLESS_BASEHREF } from './app.module';

@Component({
  selector: 'imx-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit, OnDestroy {
  public menuItems: EuiTopNavigationItem[];
  public isLoggedIn = false;
  public hideMenu = false;
  public showPageContent = true;
  public message: Message | undefined;
  private routerStatus: EventType;
  private readonly subscriptions: Subscription[] = [];
  private profileSettings: ProfileSettings;

  constructor(
    private readonly logger: ClassloggerService,
    private readonly authentication: AuthenticationService,
    private readonly router: Router,
    private readonly splash: SplashService,
    menuService: MenuService,
    userModelService: UserModelService,
    systemInfoService: SystemInfoService,
    ieWarningService: IeWarningService,
    projectConfig: ProjectConfigurationService,
    private dialog: MatDialog,
    private qerClient: QerApiService,
    private readonly themeService: EuiThemeService,
    private readonly errorHandler: ErrorHandler,
    private readonly session: imx_SessionService,
    private readonly translationProvider: ImxTranslationProviderService,
    private readonly confirmationService: ConfirmationService,
    private readonly userMessageService: UserMessageService,
  ) {
    this.subscriptions.push(
      this.authentication.onSessionResponse.subscribe(async (sessionState: ISessionState) => {
        if (Object.keys(sessionState).length === 0) {
          sessionState = await this.session.getSessionState();
        }
        if (sessionState.hasErrorState) {
          // Needs to close here when there is an error on sessionState
          splash.close();
        } else {
          if (sessionState.IsLoggedOut && this.routerStatus !== EventType.NavigationEnd) {
            this.showPageContent = false;
          }
        }

        this.isLoggedIn = sessionState.IsLoggedIn ?? false;
        if (this.isLoggedIn) {
          this.profileSettings = await this.qerClient.v2Client.portal_profile_get();
          const isUseProfileLangChecked = this.profileSettings.UseProfileLanguage ?? false;
          // Set session culture if isUseProfileLangChecked is true
          if (isUseProfileLangChecked) {
            // Use culture if available, if not fetch
            const culture = sessionState.culture
              ? sessionState.culture
              : (await this.qerClient.client.portal_profile_person_get())?.ProfileLanguage;
            // If culture is found, use it, otherwise fallback to the app default
            if (culture) {
              this.logger.debug(this, `ProfileLangChecked is true, culture available: Setting ${culture} as profile language`);
              await this.translationProvider.reinit(culture, sessionState.cultureFormat ?? culture, this.router);
            }
          }

          const config: QerProjectConfig & ProjectConfig = await projectConfig.getConfig();
          const features = (await userModelService.getFeatures()).Features ?? [];
          const systemInfo = await systemInfoService.get();
          const groups = (await userModelService.getGroups()).map((group) => group.Name || '');

          ieWarningService.showIe11Banner();

          await this.applyProfileSettings();
          this.menuItems = await menuService.getMenuItems(systemInfo.PreProps ?? [], features, true, config, groups);
          // Close the splash screen that opened in app service initialisation
          // Needs to close here when running in containers (auth skipped)
          splash.close();
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

  /**
   * Returns true for routes that require different page level styling
   */
  public get isContentFullScreen(): boolean {
    const route = this.router.url;
    switch (true) {
      case route.includes('dataexplorer'):
      case route.includes('myresponsibilities'):
      case route.includes('newrequest'):
        // Check for all children of data explorer and new request
        return true;
      case route.endsWith('statistics'):
        // Only check for ending statistics route
        return true;
      default:
        return false;
    }
  }

  public async ngOnInit(): Promise<void> {
    await this.authentication.update();
  }

  public ngOnDestroy(): void {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }

  public async goToProfile(): Promise<void> {
    this.router.navigate(['profile']);
  }

  public async goToAddressbook(): Promise<void> {
    this.router.navigate(['addressbook']);
  }

  public async openSettingsDialog(): Promise<void> {
    this.dialog.open(SettingsComponent, { minWidth: '600px' });
  }

  public async goToMyProcesses(): Promise<void> {
    this.router.navigate(['userprocess']);
  }

  public get isPageHeadless(): boolean {
    return getBaseHref() === HEADLESS_BASEHREF;
  }

  private setupRouter(): void {
    this.router.events.subscribe((event: Event) => {
      if (event instanceof NavigationStart) {
        this.routerStatus = event.type;
        if (this.isLoggedIn && event.url === '/') {
          // show the splash screen, when the user logs out!
          this.splash.init({ applicationName: 'One Identity Manager Portal' });
        }
      }
      if (event instanceof NavigationEnd) {
        this.routerStatus = event.type;
        this.hideMenu = event.url === '/';
        this.showPageContent = true;
      }
    });
  }

  private async applyProfileSettings() {
    try {
      if (this.profileSettings?.PreferredAppThemes) {
        this.themeService.setTheme(<EuiTheme>this.profileSettings.PreferredAppThemes);
      }
    } catch (error) {
      this.errorHandler.handleError(error);
    }
  }
}
