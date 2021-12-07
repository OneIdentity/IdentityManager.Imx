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

import { Component } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

import { Globals } from 'imx-qbm-dbts';
import { AppConfigService, AuthenticationService, ISessionState } from 'qbm';
import { Subscription } from 'rxjs';

@Component({
  selector: 'imx-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  public isLoggedIn = false;
  public hideUserMessage = false;
  private readonly subscriptions: Subscription[] = [];

  constructor(
    translate: TranslateService,
    titleService: Title,
    appConfigService: AppConfigService,
    private readonly router: Router,
    private readonly authentication: AuthenticationService
  ) {
    translate.addLangs(['en-US', 'de-DE', 'de', 'en']);
    const browserCulture = translate.getBrowserCultureLang();
    translate.setDefaultLang(browserCulture);
    translate.use(browserCulture);
    titleService.setTitle(Globals.QIM_ProductNameFull + ' ' + appConfigService.Config.Title);

    this.subscriptions.push(authentication.onSessionResponse.subscribe(async (sessionState: ISessionState) => {
      // Close the splash screen that opened in app service initialisation
      this.isLoggedIn = sessionState.IsLoggedIn;

      if (this.isLoggedIn) {
        titleService.setTitle(Globals.QIM_ProductNameFull + ' ' +
          await translate.get('#LDS#Administration Portal').toPromise());
      }
      else {
        titleService.setTitle(Globals.QIM_ProductNameFull + ' ' + appConfigService.Config.Title);
      }
    }));

  }

  public ngOnDestroy(): void {
    this.subscriptions.forEach(s => s.unsubscribe());
  }

  public async ngOnInit(): Promise<void> {
    this.authentication.update();
  }

  /**
 * Logs out and kills the session.
 */
  public async logout(): Promise<void> {
    await this.authentication.logout();
    this.router.navigate([''], { queryParams: {} });
  }

}
