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

import { Injectable } from '@angular/core';
import { TypedClient } from '@imx-modules/imx-api-qbm';
import { TranslateService } from '@ngx-translate/core';
import {
  AppConfigService,
  AuthenticationService,
  CaptchaService,
  CdrRegistryService,
  ClassloggerService,
  ImxTranslationProviderService,
  SystemInfoService,
  imx_SessionService,
} from 'qbm';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AppService {
  public recaptchaSiteKeyV3: string | null = null;
  constructor(
    private logger: ClassloggerService,
    private readonly config: AppConfigService,
    private readonly translateService: TranslateService,
    private readonly session: imx_SessionService,
    private readonly translationProvider: ImxTranslationProviderService,
    public readonly registry: CdrRegistryService,
    private readonly authentication: AuthenticationService,
    private readonly systemInfoService: SystemInfoService,
    private readonly captchaService: CaptchaService,
  ) {}

  public async init(): Promise<void> {
    await this.config.init(environment.clientUrl);

    if (this.config.Config.Translation?.Langs) {
      this.translateService.addLangs(this.config.Config.Translation.Langs);
    }
    const browserCulture = this.translateService.getBrowserCultureLang() as string;
    this.logger.debug(this, 'Set default language to', browserCulture);
    this.translateService.setDefaultLang(browserCulture);
    await this.translateService.use(browserCulture).toPromise();

    this.authentication.onSessionResponse.subscribe((sessionState) => this.translationProvider.init(sessionState?.culture));

    this.session.TypedClient = new TypedClient(this.config.v2client, this.translationProvider);

    const imxConfig = await this.systemInfoService.getImxConfig();

    if (imxConfig.RecaptchaPublicKey) {
      this.captchaService.enableReCaptcha(imxConfig.RecaptchaPublicKey);
      this.recaptchaSiteKeyV3 = imxConfig.RecaptchaPublicKey;
    }
    this.captchaService.captchaImageUrl = 'admin/captchaimage';
  }

  public static init(app: AppService): () => Promise<any> {
    return () =>
      new Promise<any>(async (resolve: any) => {
        await app.init();
        resolve();
      });
  }
}
