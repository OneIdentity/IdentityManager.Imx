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

import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router, NavigationEnd, NavigationStart, NavigationError, RouterEvent } from '@angular/router';
import { Subscription } from 'rxjs';
import {
  AuthenticationService,
  ISessionState,
  imx_SessionService,
  SystemInfoService,
  AppConfigService,
  MastHeadService,
  IeWarningService,
  ExtService,
} from 'qbm';
import {
  EuiTopNavigationItem,
  EuiTopNavigationItemType,
  EuiSplashScreenService,
  EuiLoadingService,
  EuiAlertBannerService,
} from '@elemental-ui/core';
import { TranslateService } from '@ngx-translate/core';
import { OverlayRef } from '@angular/cdk/overlay';
import { ProjectConfigurationService, RequestableEntitlementTypeService, UserModelService } from 'qer';
import { AppInsightsService } from './services/insights.service';
import { UserGroupInfo } from 'imx-api-arc';
import { AttestationFeatureGuardService, canSeeAttestationPolicies } from 'att';
import { UserConfig } from 'imx-api-qer';
import { AttestationConfig } from 'imx-api-att';
import { RequestShopAlertComponent } from './configuration/request-shop-alert/request-shop-alert.component';
import { RequestsService } from 'qer';

@Component({
  selector: 'imx-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit, OnDestroy {
  /**
   * The onLangChange subscription to update the component if the language change.
   */
  public onLangChange: Subscription = undefined;

  public navigationItems: EuiTopNavigationItem[] = [];
  public isLoggedIn = false;
  public hideMenu = false;
  public hideUserMessage = false;
  public isBootstrapUser = false;
  private readonly onSessionResponse: Subscription;
  private alertBannerDismissed$: Subscription;
  private userGroups: UserGroupInfo[] = [];
  private featureSettings$: Subscription;
  private qerUserConfig: UserConfig;
  private attConfig: AttestationConfig;
  private isDelegationEnable: boolean;

  constructor(
    public readonly session: imx_SessionService,
    public readonly router: Router,
    private readonly authentication: AuthenticationService,
    private readonly translate: TranslateService,
    private readonly splash: EuiSplashScreenService,
    private readonly busyService: EuiLoadingService,
    private readonly systemInfo: SystemInfoService,
    private readonly alertBanner: EuiAlertBannerService,
    private readonly userModelService: UserModelService,
    private readonly insights: AppInsightsService,
    private readonly appConfig: AppConfigService,
    private readonly qbmMastHeadService: MastHeadService,
    private readonly attFeatureGuard: AttestationFeatureGuardService,
    private readonly itshopReqEntlService: RequestableEntitlementTypeService,
    private readonly projectConfig: ProjectConfigurationService,
    private readonly extService: ExtService,
    requestsService: RequestsService,
    ieWarningService: IeWarningService
  ) {

    // do not expose resources as requestable entitlement types in ARC
    this.itshopReqEntlService.enableResourceTypes = false;

    // register alert when there are no requestable products
    this.extService.register('Request-Config-Alert', { instance: RequestShopAlertComponent });

    // configure request shop terminology
    requestsService.LdsSpecifyMembers = '#LDS#Here you can specify who can request the products assigned to the request shop.';
    requestsService.LdsMembersByDynamicRole = '#LDS#Here you can see the members that are originally assigned to the request shop by a dynamic role but have been excluded. Additionally, you can add these excluded members back to the request shop by removing the exclusion.';
    requestsService.LdsMembersRemoved = '#LDS#The members have been successfully removed from the request shop. It may take some time for the changes to take effect.';
    requestsService.LdsMembersAdded = '#LDS#The members have been successfully added to the request shop. It may take some time for the changes to take effect.';
    requestsService.LdsMembersUpdated = '#LDS#The request shop members have been successfully updated.';
    requestsService.LdsShopDetails = '#LDS#Here you can edit the details of the request shop, specify an approval policy, and specify who is authorized to approve attestation cases for the request shop. The attestor and approval policy specified here are used for all shelves where this is not specified.';
    requestsService.LdsDeleteShop = '#LDS#Delete request shop';
    requestsService.LdsShopHasBeenDeleted = '#LDS#The request shop has been successfully deleted.';
    requestsService.LdsShopHasBeenCreated = '#LDS#The request shop has been successfully created.';
    requestsService.LdsShopHasBeenSaved = '#LDS#The request shop has been successfully saved.';
    requestsService.LdsShopEntitlements = '#LDS#Here you can specify which products can be requested. Attestors and approval policies specified for individual products are used instead of any that are defined on either the shelf or the request shop.';
    requestsService.LdsNoShops = '#LDS#There are currently no request shops.';
    requestsService.LdsNoMatchingShops = '#LDS#There are no matching request shops.';
    requestsService.LdsHeadingCreateShop = '#LDS#Heading Create Request Shop';
    requestsService.LdsHeadingEditShop = '#LDS#Heading Edit Request Shop';
    requestsService.LdsHeadingShops = '#LDS#Heading Request Shops';
    requestsService.LdsShopExplanation = '#LDS#A request shop is the top element in the hierarchical structure required for requesting products. Here you can setup and manage request shops. For each request shop you can specify which products can be requested (through shelves) and who can request them.';
    requestsService.LdsShelfExplanation = '#LDS#Here you can manage shelves assigned to the request shop. For each shelf you can edit the details and specify which products can be requested.';
    requestsService.LdsCreateShop = '#LDS#Create request shop';

    this.onSessionResponse = this.authentication.onSessionResponse.subscribe(async (sessionState: ISessionState) => {

      this.isBootstrapUser = !sessionState.UserUid;
      this.isLoggedIn = sessionState.IsLoggedIn;

      if (
        sessionState.hasErrorState ||
        sessionState.configurationProviders?.length > 1 ||
        (sessionState.configurationProviders && !sessionState.configurationProviders[0].isOAuth2)
      ) {
        // Needs to close here when running locally or in demo trial or if there is an error on sessionState
        this.splash.close();
      }

      if (this.isLoggedIn) {
        this.projectConfig.getConfig();

        // Close the splash screen that opened in app service initialisation
        // Needs to close here when running in containers (auth skipped)
        this.splash.close();

        this.checkSystemInfo();

        if (this.isBootstrapUser) {
          this.router.navigate(['data/explorer']);
        }

        this.insights.setup();

        this.userGroups = await this.userModelService.getGroups();
        this.qerUserConfig = await this.userModelService.getUserConfig();
        this.attConfig = await this.attFeatureGuard.getAttestationConfig();
        this.setupNavigationItems();
        ieWarningService.showIe11Banner();
      }
    });
    this.setupRouter();
  }

  public get hasDocumentationConfig(): boolean {
    return !!this.appConfig.Config.LocalDocPath;
  }

  /**
   * Returns true for routes that require different page level styling
   */
  get isContentFullScreen(): boolean {
    return (
      this.router.url.includes('data/explorer') ||
      this.router.url.includes('data/reports') ||
      this.router.url.includes('configuration/requests')
    );
  }

  public ngOnInit(): void {
    this.authentication.update();

    this.updateLanguage();
    this.onLangChange = this.translate.onLangChange.subscribe(() => {
      this.updateLanguage();
    });
  }

  public ngOnDestroy(): void {
    if (this.onSessionResponse) {
      this.onSessionResponse.unsubscribe();
    }

    if (this.alertBannerDismissed$) {
      this.alertBannerDismissed$.unsubscribe();
    }

    if (this.onLangChange) {
      this.onLangChange.unsubscribe();
    }

    if (this.featureSettings$) {
      this.featureSettings$.unsubscribe();
    }
  }

  public async gotoprofile(): Promise<void> {
    this.router.navigate(['profile']);
  }

  public async gotoReportSubscriptions(): Promise<void> {
    this.router.navigate(['reportsubscriptions']);
  }

  /**
   * Logs out and kills the session.
   */
  public async logout(): Promise<void> {
    let overlayRef: OverlayRef;
    setTimeout(() => (overlayRef = this.busyService.show()));
    try {
      await this.authentication.logout();
    } finally {
      setTimeout(() => this.busyService.hide(overlayRef));
    }
  }

  public navigateToDocumentation(): void {
    this.qbmMastHeadService.openDocumentationLink();
  }

  private async setupRouter(): Promise<void> {
    this.router.events.subscribe((event: RouterEvent) => {
      if (event instanceof NavigationStart) {
        this.hideUserMessage = true;
      }

      if (event instanceof NavigationEnd) {
        this.hideUserMessage = false;
        this.hideMenu = event.url === '/';
        if (event.url === '/dashboard') {
          this.handleNavigationLinksUpdate();
        }
      }

      if (event instanceof NavigationError) {
        this.hideUserMessage = false;
      }
    });
  }

  private async handleNavigationLinksUpdate(): Promise<void> {
    this.attConfig = await this.attFeatureGuard.getAttestationConfig();
    this.qerUserConfig = await this.userModelService.getUserConfig();
    this.setupNavigationItems();
  }

  private addNavItem(text: string, url: string, exact?: boolean, items?: EuiTopNavigationItem[]): void {
    this.translate.get(text).subscribe((translation: string) => {
      text = translation;
      const navItem: EuiTopNavigationItem = {
        type: EuiTopNavigationItemType.RouterLink,
        text,
        url,
        // routerLinkActiveOptions: { exact: exact ? true : false }, //TODO: Reactivate - Interface does not match
      };
      if (items) {
        navItem.type = EuiTopNavigationItemType.Menu;
        navItem.items = items;
      }
      this.navigationItems.push(navItem);
    });
  }

  private addNavMenuItem(text: string, url: string, items: { text: string; url: string }[]): void {
    const subNavItems: EuiTopNavigationItem[] = [];
    const subItemGeneration = new Promise<void>((resolve) => {
      items.forEach((item, index) => {
        this.translate.get(item.text).subscribe((translation: string) => {
          item.text = translation;
          subNavItems.push({
            type: EuiTopNavigationItemType.RouterLink,
            text: item.text,
            url: item.url,
            // routerLinkActiveOptions: { exact: false }, //TODO: Reactivate - Interface does not match
          });
        });
        if (index === items.length - 1) {
          resolve();
        }
      });
    });
    subItemGeneration.then(() => {
      this.addNavItem(text, url, false, subNavItems);
    });
  }

  private setupNavigationItems(): void {
    this.navigationItems = [];

    if (!this.isBootstrapUser) {
      this.addNavItem('#LDS#Home', 'dashboard');

      if (this.qerUserConfig?.IsITShopEnabled) {
        this.addNavMenuItem('#LDS#Requests', '', [
          {
            text: '#LDS#Menu Entry New request',
            url: 'productselection',
          },
          {
            text: '#LDS#Menu Entry Shopping cart',
            url: 'shoppingcart',
          },
          {
            text: '#LDS#Menu Entry Pending requests',
            url: 'itshop/approvals',
          },
          {
            text: '#LDS#Menu Entry Request history',
            url: 'requesthistory',
          },
        ]);
      }

      const attestationMenuItems: { text: string; url: string }[] = [{
        text: '#LDS#Menu Entry Pending attestations',
        url: 'attestation/decision',
      },
      {
        text: '#LDS#Menu Entry Attestation history',
        url: 'attestation/history',
      }];

      if (canSeeAttestationPolicies(this.userGroups.map(item => item.Name))) {
        attestationMenuItems.push(
          {
            text: '#LDS#Menu Entry Attestation runs',
            url: 'attestation/runs',
          },
          {
            text: '#LDS#Menu Entry Attestation policies',
            url: 'attestation/policies',
          }
        );
      }

      if (this.attConfig?.IsAttestationEnabled) {
        this.addNavMenuItem('#LDS#Attestation', '', attestationMenuItems);
      }
    }

    const userIsAdmin = this.userGroups.find((group) => {
      const groupName = group.Name ? group.Name.toUpperCase() : '';
      return groupName === 'SIM_4_OPAADMIN'
        || groupName === 'VI_4_NAMESPACEADMIN_ADS'
        || groupName === 'SIM_BASEDATA_USERINTERFACE'
        || groupName === 'AAD_4_NAMESPACEADMIN_AZUREAD';
    });

    const userIsShopAdmin = this.userGroups.find((group) => {
      const groupName = group.Name ? group.Name.toUpperCase() : '';
      return groupName === 'VI_4_ITSHOPADMIN_ADMIN';
    });

    const userIsAttestationAdmin = this.userGroups.find((group) => {
      const groupName = group.Name ? group.Name.toUpperCase() : '';
      return groupName === 'VI_4_ATTESTATIONADMIN_ADMIN';
    });

    if (!this.isBootstrapUser) {

      const respItems = [
        {
          text: '#LDS#Menu Entry System entitlement ownership',
          url: 'claimgroup',
        }
      ];

      if (this.isDelegationEnable) {
        respItems.push({ text: '#LDS#Menu Entry Delegation', url: 'delegation' });
      }

      this.addNavMenuItem('#LDS#Responsibilities', '', respItems);
    }

    const dataExplorerItems = [];
    const setupItems = [];
    if (userIsAdmin) {
      dataExplorerItems.push({ text: '#LDS#Menu Entry Data Explorer', url: '/data/explorer' });
    }

    if (!this.isBootstrapUser) {

      if (userIsAdmin) {
        dataExplorerItems.push({ text: '#LDS#Menu Entry Reports', url: '/data/reports' });
      }

      if (userIsAdmin || userIsShopAdmin) {
        setupItems.push({ text: '#LDS#Menu Entry Request shops', url: '/configuration/requests' });
      }

      if (userIsAdmin) {
        setupItems.push({ text: '#LDS#Menu Entry Application roles', url: '/configuration/administratorgroups' });
      }

      if (userIsAdmin || userIsShopAdmin) {
        setupItems.push({ text: '#LDS#Menu Entry Service categories', url: '/configuration/servicecategories' });
      }

      if (userIsAdmin) {
        setupItems.push({ text: '#LDS#Menu Entry Feature availability', url: '/configuration/features' });
      }

      if (userIsAttestationAdmin) {
        setupItems.push({ text: '#LDS#Menu Entry Attestation schedules', url: '/configuration/schedules' });
      }
    }

    if (dataExplorerItems.length > 0) {
      this.addNavMenuItem('#LDS#Data administration', '', dataExplorerItems);
    }
    // Ensure 'Setup' nav item is added after 'Data'
    if (setupItems.length > 0) {
      this.addNavMenuItem('#LDS#Setup', '', setupItems);
    }
  }

  private async checkSystemInfo(): Promise<void> {
    const seenUpgradeNotice = sessionStorage.getItem('ARC-Governance_UpgradeNoticeSeen');

    if (!seenUpgradeNotice) {
      const info = await this.systemInfo.get();

      this.isDelegationEnable = info
        && info.PreProps.includes('ITSHOP')
        && info.PreProps.includes('DELEGATION');

      if (info && info.UpdatePhase > 0) {
        this.translate
          .get('#LDS#Starling CertAccess is currently updating and will soon be unavailable until this process is complete.')
          .subscribe((val: string) => this.openUpgradeAlert(val));
      }
    }
  }

  private openUpgradeAlert(message: string): void {
    setTimeout(() => {
      this.alertBanner.open({
        type: 'warning',
        dismissable: true,
        message,
      });
    }, 500);

    this.alertBannerDismissed$ = this.alertBanner.userDismissed.subscribe(() =>
      sessionStorage.setItem('ARC-Governance_UpgradeNoticeSeen', 'true')
    );
  }

  /**
   * Update the language in the lang attribute of the html element.
   */
  private updateLanguage(): void {
    const lang = document.createAttribute('lang');
    lang.value = this.translate.currentLang;
    document.getElementsByTagName('html')?.[0]?.attributes.setNamedItem(lang);
  }
}
