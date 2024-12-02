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

import { Title } from '@angular/platform-browser';
import { TranslateService } from '@ngx-translate/core';

import { Injectable, Injector, createNgModule } from '@angular/core';
import { ImxConfig, TypedClient } from '@imx-modules/imx-api-qbm';
import { Globals } from '@imx-modules/imx-qbm-dbts';
import {
  AppConfigService,
  AuthenticationService,
  CaptchaService,
  CdrRegistryService,
  ClassloggerService,
  ImxTranslationProviderService,
  SplashService,
  SystemInfoService,
  imx_SessionService,
} from 'qbm';
import { NotificationStreamService } from 'qer';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AppService {
  public recaptchaSiteKeyV3: string | null = null;
  private imxConfig: ImxConfig;
  constructor(
    public readonly registry: CdrRegistryService,
    private readonly logger: ClassloggerService,
    private readonly config: AppConfigService,
    private readonly systemInfoService: SystemInfoService,
    private readonly translateService: TranslateService,
    private readonly session: imx_SessionService,
    private readonly translationProvider: ImxTranslationProviderService,
    private readonly title: Title,
    private readonly authentication: AuthenticationService,
    private readonly notificationService: NotificationStreamService,
    private readonly splash: SplashService,
    private readonly injector: Injector,
    private readonly captchaService: CaptchaService,
  ) {}

  public async init(): Promise<void> {
    this.showSplash();
    await this.config.init(environment.clientUrl);

    if (this.config.Config.Translation?.Langs) {
      this.translateService.addLangs(this.config.Config.Translation.Langs);
    }

    await this.translationProvider.init();

    this.imxConfig = await this.systemInfoService.getImxConfig();

    this.translateService.onLangChange.subscribe(() => {
      this.setTitle();
    });

    this.setTitle();

    this.authentication.onSessionResponse.subscribe((sessionState) => {
      if (sessionState && sessionState.IsLoggedIn) {
        // when the user logs in, start listening to notifications
        this.notificationService.openStream();
      }
    });

    this.session.TypedClient = new TypedClient(this.config.v2client, this.translationProvider);

    await this.loadModules(environment.appName);

    if (this.imxConfig.RecaptchaPublicKey) {
      this.captchaService.enableReCaptcha(this.imxConfig.RecaptchaPublicKey);
      this.recaptchaSiteKeyV3 = this.imxConfig.RecaptchaPublicKey;
    }
    this.captchaService.captchaImageUrl = 'portal/captchaimage';
  }

  private async setTitle(): Promise<void> {
    const name = this.imxConfig.ProductName || Globals.QIM_ProductNameFull;
    this.config.Config.Title = await this.translateService.get('#LDS#Heading Web Portal').toPromise();
    const title = `${name} ${this.config.Config.Title}`;
    this.title.setTitle(title);

    await this.updateSplash(title);
  }

  public static init(app: AppService): () => Promise<any> {
    return () =>
      new Promise<any>(async (resolve: any) => {
        await app.init();
        resolve();
      });
  }

  private showSplash(): void {
    // open splash screen with fix values
    this.splash.init({ applicationName: 'One Identity Manager Portal' });
  }

  private async updateSplash(title: string): Promise<void> {
    // update the splash screen and use translated texts and the title from the imxconfig
    const loadingMsg = await this.translateService.get('#LDS#Loading...').toPromise();
    this.splash.update({ applicationName: title, message: loadingMsg });
  }

  public async loadModules(appName: string): Promise<void> {
    const apps = await this.session.Client.imx_applications_get();

    const appInfo = apps.filter((app) => app.Name === appName)[0];

    this.logger.debug(this, `▶️ Found config section for ${appInfo.DisplayName}`);

    if (appInfo.PlugIns == null || appInfo.PlugIns.length === 0) {
      this.logger.debug(this, `❌ No plugins found`);
      return;
    }

    this.logger.debug(this, `▶️ Found ${appInfo.PlugIns.length} plugin(s)`);

    for (const plugin of appInfo.PlugIns) {
      this.logger.debug(this, `⚙️ Plugin: ${plugin.Container}`);

      try {
        this.logger.debug(this, '▶️ Importing module. DEV mode.');
        await import(`html/qer-app-portal/${plugin.Container}/fesm2022/${plugin.Container}.mjs`)
          .then((m) => {
            if (plugin.Name) {
              createNgModule(m[plugin.Name], this.injector);
            }
          })
          .catch((error) =>
            this.logger.error(this, `💥 Loading of ${plugin.Name} (${plugin.Container}) failed with the following error: ${error.message}`),
          );
      } catch (e) {
        this.logger.error(this, `💥 Loading of ${plugin.Name} (${plugin.Container}) failed with the following error: ${e.message}`);
      }
    }
  }
}
