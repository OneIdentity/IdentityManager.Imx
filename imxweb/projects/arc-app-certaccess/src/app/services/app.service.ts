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

import { Injectable, ComponentFactoryResolver } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { TranslateService } from '@ngx-translate/core';
import {
  AppConfigService,
  CdrRegistryService,
  ImxTranslationProviderService,
  ClassloggerService,
  AuthenticationService,
  ExtService,
} from 'qbm';
import { environment } from '../../environments/environment';
import { EuiSplashScreenService } from '@elemental-ui/core';
import { DashboardPluginComponent } from '../dashboard-plugin/dashboard-plugin.component';
import { OpsWebLinkPluginComponent } from '../dashboard-plugin/opsweblink-plugin.component';

@Injectable({
  providedIn: 'root',
})
export class AppService {

  constructor(
    private logger: ClassloggerService,
    private readonly config: AppConfigService,
    private readonly translateService: TranslateService,
    private readonly translationProvider: ImxTranslationProviderService,
    private readonly title: Title,
    private readonly splash: EuiSplashScreenService,
    public readonly registry: CdrRegistryService,
    public readonly resolver: ComponentFactoryResolver,
    private readonly extService: ExtService,
    private readonly authentication: AuthenticationService
  ) { }

  public async init(): Promise<void> {
    this.showSplash();
    try {
      await this.config.init(environment.clientUrl);
      const title = `${'One Identity Starling -'} ${this.config.Config.Title}`;
      this.logger.debug(this, `Set page title to ${title}`);
      this.title.setTitle(title);

      this.translateService.addLangs(this.config.Config.Translation.Langs);
      const browserCulture = this.translateService.currentLang || this.translateService.getBrowserCultureLang();
      this.logger.debug(this, `Set ${browserCulture} as default language`);
      this.translateService.setDefaultLang(browserCulture);
      await this.translateService.use(browserCulture).toPromise();

      this.authentication.onSessionResponse.subscribe(sessionState => this.translationProvider.init(sessionState?.culture));

      // register dashboard to show number of frozen jobs
      this.extService.register('Dashboard-SmallTiles', { instance: DashboardPluginComponent });

      // register tile with link top opsweb
      this.extService.register('Dashboard-LargeTiles', { instance: OpsWebLinkPluginComponent });

    } catch (error) {
      this.logger.error(this, error);
    }

  }

  private showSplash(): void {
    this.splash.open({
      applicationName: 'CertAccess',
      icon: 'governance',
      showSpinner: true,
    });
    const productNameKey = '#LDS#CertAccess';
    const loadingMsgKey = '#LDS#Loading...';
    this.translateService.get([productNameKey, loadingMsgKey]).subscribe((translations: any[]) => {
      this.splash.updateState({ applicationName: translations[productNameKey], message: translations[loadingMsgKey] });
    });
  }

  public static init(app: AppService): () => Promise<any> {
    return () =>
      new Promise<any>(async (resolve: any) => {
        await app.init();
        resolve();
      });
  }
}
