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
import { Component, OnInit, OnDestroy, ErrorHandler } from '@angular/core';
import { Router, RouterEvent, NavigationStart, NavigationEnd, NavigationError, NavigationCancel } from '@angular/router';
import { EuiLoadingService, EuiTheme, EuiThemeService, EuiTopNavigationItem } from '@elemental-ui/core';
import { Subscription } from 'rxjs';

import { MenuItem, AuthenticationService, ISessionState, MenuService, SettingsService, imx_SessionService, SplashService, ImxTranslationProviderService } from 'qbm';
import {
  FeatureConfigService,
  OpSupportUserService,
  QerApiService,
  SettingsComponent
} from 'qer';
import { FeatureConfig, ProfileSettings } from 'imx-api-qer';
import { isOutstandingManager } from './permissions/permissions-helper';
import { MatDialog } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'imx-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit, OnDestroy {
  public menuItems: EuiTopNavigationItem[];
  public isLoggedIn = false;
  public hideMenu = false;
  public hideUserMessage = false;
  public showPageContent = true;

  private readonly subscriptions: Subscription[] = [];

  constructor(
    private readonly authentication: AuthenticationService,
    private readonly busyService: EuiLoadingService,
    private readonly router: Router,
    private readonly menuService: MenuService,
    private readonly featureService: FeatureConfigService,
    private readonly splash: SplashService,
    sessionService: imx_SessionService,
    settings: SettingsService,
    userModelService: OpSupportUserService,
    private dialog: MatDialog,
    private qerClient: QerApiService,
    private readonly themeService: EuiThemeService,
    private readonly errorHandler: ErrorHandler,
    private readonly translationProvider: ImxTranslationProviderService,
    private readonly translateService: TranslateService
  ) {
    this.subscriptions.push(
      this.authentication.onSessionResponse.subscribe(async (sessionState: ISessionState) => {
        if (sessionState.hasErrorState) {
          // Needs to close here when there is an error on sessionState
          splash.close();
        } else {
          if (sessionState.IsLoggedOut) {
            this.showPageContent = false;
          }
        }

        this.isLoggedIn = sessionState.IsLoggedIn;
        if (this.isLoggedIn) {
          const isUseProfileLangChecked = (await this.qerClient.v2Client.opsupport_profile_get()).UseProfileLanguage ?? false;
          // Set session culture if isUseProfileLangChecked is true, set browser culture otherwise
          if (isUseProfileLangChecked) {
            await this.translationProvider.init(sessionState.culture, sessionState.cultureFormat);
          }else{
            const browserCulture = this.translateService.getBrowserCultureLang();
            await this.translationProvider.init(browserCulture);
          }

          // Close the splash screen that opened in app service initialisation
          // Needs to close here when running in containers (auth skipped)
          splash.close();

          await this.setupMenu();
          const conf = await sessionService.Client.opsupport_config_get();
          settings.DefaultPageSize = conf.DefaultPageSize;

          const groupInfo = await userModelService.getGroups();
          this.menuItems = await this.menuService.getMenuItems([], groupInfo.map(group => group.Name), true);

          this.applyProfileSettings();
        }
      })
    );

    this.subscriptions.push(
      this.authentication.onSessionResponse.subscribe(async (sessionState: ISessionState) => {
        this.isLoggedIn = sessionState.IsLoggedIn;
      })
    );

    this.setupRouter();
  }

  public async ngOnInit(): Promise<void> {
    await this.authentication.update();
  }

  public ngOnDestroy(): void {
    this.subscriptions.forEach((s) => s.unsubscribe());
  }

  public async openSettingsDialog(): Promise<void> {
    this.dialog.open(SettingsComponent,{minWidth: '600px'});
  }

  private setupRouter(): void {
    let overlayRef: OverlayRef;

    this.router.events.subscribe((event: RouterEvent) => {
      switch (true) {
        case event instanceof NavigationStart:
          this.hideUserMessage = true;

          if (this.isLoggedIn && event.url === '/') {
            // show the splash screen, when the user logs out!
            this.splash.init({ applicationName: 'Operations Support Web Portal' });
          }
          break;
        case event instanceof NavigationEnd:
        case event instanceof NavigationCancel:
        case event instanceof NavigationError:
          this.hideUserMessage = false;
          this.hideMenu = event.url === '/';
          this.showPageContent = true;
      }
    });
  }

  private async setupMenu(): Promise<void> {
    let featureConfig: FeatureConfig;
    const overlay = this.busyService.show();
    try {
      featureConfig = await this.featureService.getFeatureConfig();
    } finally {
      this.busyService.hide(overlay);
    }

    this.menuService.addMenuFactories(
      () => {
        return {
          id: 'OpsWeb_ROOT_Dashboard',
          sorting: '10',
          title: '#LDS#Home',
          route: 'start',
        };
      },
      (__: string[], groups: string[]) => {
        if (!groups.includes('QER_4_OperationsSupport')) {
          return null;
        }

        const menu = {
          id: 'OpsWeb_ROOT_Processes',
          sorting: '20',
          title: '#LDS#Processes',
          items: [
            {
              id: 'OpsWeb_Processes_Processes',
              title: '#LDS#Menu Entry Processes',
              route: 'Jobs',
            },
            {
              id: 'OpsWeb_Processes_ProcessHistory',
              title: '#LDS#Menu Entry Process history',
              route: 'JobHistory',
            },
            {
              id: 'OpsWeb_Processes_ProcessSteps',
              title: '#LDS#Menu Entry Process steps per process',
              route: 'JobChainInformation',
            },
            {
              id: 'OpsWeb_Processes_Performance',
              title: '#LDS#Menu Entry Performance',
              route: 'JobPerformance',
            },
            {
              id: 'OpsWeb_Objects_By_Process_ID',
              title: '#LDS#Menu Entry Processes and operations by process ID',
              route: 'ObjectByProccessId',
            },
          ],
        };
        return menu;
      },
      (__: string[], groups: string[]) => {
        if (!groups.includes('QER_4_OperationsSupport')) {
          return null;
        }

        const menu = {
          id: 'DbQueue',
          sorting: '30',
          title: '#LDS#Database',
          items: [
            {
              id: 'OpsWeb_DbQueue_DbQueue',
              title: '#LDS#Menu Entry DBQueue',
              route: 'DbQueue',
            }
          ],
        };
        return menu;
      },
      (__: string[], groups: string[]) => {
        if (!groups.includes('QER_4_OperationsSupport')) {
          return null;
        }
        const menu = {
          id: 'OpsWeb_ROOT_Synchronization',
          title: '#LDS#Synchronization',
          sorting: '40',
          items: [
            {
              id: 'OpsWeb_Synchronization_UnresolvedReferences',
              title: '#LDS#Menu Entry Unresolved references',
              route: 'unresolvedRefs',
              sorting: '40-10',
            },
          ],
        };

        if (isOutstandingManager(groups)) {
          menu.items.push({
            id: 'OpsWeb_Synchronization_OutstandingObjects',
            title: '#LDS#Menu Entry Outstanding objects',
            route: 'outstanding',
            sorting: '40-20',
          });
        }

        menu.items.push({
          id: 'OpsWeb_Synchronization_SyncInformation',
          title: '#LDS#Menu Entry Synchronization',
          route: 'SyncInformation',
          sorting: '40-30',
        });
        return menu;
      },
      (__: string[], groups: string[]) => {
        if (!groups.includes('QER_4_OperationsSupport')) {
          return null;
        }
        const menu = {
          id: 'OpsWeb_ROOT_System',
          sorting: '50',
          title: '#LDS#System',
          items: [
            {
              id: 'OpsWeb_System_Database',
              title: '#LDS#Menu Entry Database log',
              route: 'journal',
            },
            {
              id: 'OpsWeb_System_WebApplications',
              title: '#LDS#Menu Entry Web applications',
              route: 'WebApplications',
            },
            {
              id: 'OpsWeb_System_DataChanges',
              title: '#LDS#Menu Entry Operation history',
              route: 'DataChanges'
            }
          ]
        };

        if (featureConfig?.EnableSystemStatus) {
          menu.items.unshift({
            id: 'OpsWeb_System_SystemStatus',
            title: '#LDS#Menu Entry System status',
            route: 'SystemStatus',
          });
        }
        return menu;
      }
    );

    return null;
  }

  private async applyProfileSettings()
  {
    try {
      let profileSettings: ProfileSettings = await this.qerClient.client.opsupport_profile_get();
      if (profileSettings?.PreferredAppThemes) {
        this.themeService.setTheme(<EuiTheme>profileSettings.PreferredAppThemes);
      }
    }
    catch (error) {
      this.errorHandler.handleError(error);
    }
  }
}
