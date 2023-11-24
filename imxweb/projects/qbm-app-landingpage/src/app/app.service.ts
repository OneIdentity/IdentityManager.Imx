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

import { Injectable, ComponentFactoryResolver } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { TranslateService } from '@ngx-translate/core';
import { TypedClient } from 'imx-api-qbm';

import { Globals } from 'imx-qbm-dbts';
import { AppConfigService, CdrRegistryService, ImxTranslationProviderService, ClassloggerService, imx_SessionService, AuthenticationService } from 'qbm';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AppService {
  constructor(
    private logger: ClassloggerService,
    private readonly config: AppConfigService,
    private readonly translateService: TranslateService,
    private readonly session: imx_SessionService,
    private readonly translationProvider: ImxTranslationProviderService,
    private readonly title: Title,
    public readonly registry: CdrRegistryService,
    public readonly resolver: ComponentFactoryResolver,
    private readonly authentication: AuthenticationService
  ) { }

  public async init(): Promise<void> {
    await this.config.init(environment.clientUrl);

    const imxConfig = await this.config.getImxConfig();
    const name = imxConfig.ProductName  || Globals.QIM_ProductNameFull;
    this.config.Config.Title = await this.translateService.get('#LDS#API Server').toPromise();
    const title = `${name} ${this.config.Config.Title}`;
    this.logger.debug(this, 'Set page title to', title);
    this.title.setTitle(title);

    this.translateService.addLangs(this.config.Config.Translation.Langs);
    const browserCulture = this.translateService.getBrowserCultureLang();
    this.logger.debug(this, 'Set default language to', browserCulture);
    this.translateService.setDefaultLang(browserCulture);
    await this.translateService.use(browserCulture).toPromise();

    this.authentication.onSessionResponse.subscribe(sessionState => this.translationProvider.init(sessionState?.culture));

    this.session.TypedClient = new TypedClient(this.config.v2client, this.translationProvider);
  }

  public static init(app: AppService): () => Promise<any> {
    return () =>
      new Promise<any>(async (resolve: any) => {
        await app.init();
        resolve();
      });
  }
}
