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

import { Component } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { NavigationEnd, Router, RouterEvent } from '@angular/router';
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

  private overviewTitle: string;
  private adminPortalTitle: string;

  constructor(
    private readonly translate: TranslateService,
    private readonly titleService: Title,
    private readonly appConfigService: AppConfigService,
    private readonly router: Router,
    private readonly translateService: TranslateService,
    private readonly authentication: AuthenticationService
  ) {
    this.translate.addLangs(['en-US', 'de-DE', 'de', 'en']);
    const browserCulture = this.translate.getBrowserCultureLang();
    this.translate.setDefaultLang(browserCulture);
    this.translate.use(browserCulture);
    this.titleService.setTitle(Globals.QIM_ProductNameFull + ' ' + this.appConfigService.Config.Title);

    this.translateService.onLangChange.subscribe(() => {
      this.initTitles();
      this.setTitle(this.router.url);
    });

    this.subscriptions.push(this.authentication.onSessionResponse.subscribe(async (sessionState: ISessionState) => {
      // Close the splash screen that opened in app service initialisation
      this.isLoggedIn = sessionState.IsLoggedIn;
      if (this.isLoggedIn) {
        this.titleService.setTitle(this.adminPortalTitle);
      }
    }));

    this.setupRouter();

  }

  public ngOnDestroy(): void {
    this.subscriptions.forEach(s => s.unsubscribe());
  }

  public async ngOnInit(): Promise<void> {
    this.initTitles();
    this.authentication.update();
  }

  /**
 * Logs out and kills the session.
 */
  public async logout(): Promise<void> {
    await this.authentication.logout();
    this.router.navigate([''], { queryParams: {} });
  }

  private setupRouter(): void {
    this.router.events.subscribe((event: RouterEvent) => {
      if (event instanceof NavigationEnd) {
        this.setTitle(this.router.url); 
      }
    });
  }

  private async initTitles(): Promise<void> {
    this.overviewTitle = await this.translate.get('#LDS#Heading Web Applications Overview').toPromise();    
    this.adminPortalTitle = await this.translate.get('#LDS#Heading Administration Portal').toPromise();
  }

  private setTitle(url: string): void {
    if (url === "/") {  
      // show another title on the startpage        
      this.titleService.setTitle(Globals.QIM_ProductNameFull + ' ' + this.overviewTitle);
      this.appConfigService.setTitle(this.overviewTitle);
    } else {          
      this.titleService.setTitle(Globals.QIM_ProductNameFull + ' ' + this.adminPortalTitle);
      this.appConfigService.setTitle(this.adminPortalTitle);
    }    
  }
}
