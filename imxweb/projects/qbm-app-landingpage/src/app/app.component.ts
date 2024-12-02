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

import { Component } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Event, NavigationEnd, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

import { Globals } from '@imx-modules/imx-qbm-dbts';
import {
  AppConfigService,
  AuthenticationService,
  ClassloggerService,
  ConfirmationService,
  ISessionState,
  Message,
  UserMessageService,
} from 'qbm';
import { Subscription } from 'rxjs';

@Component({
  selector: 'imx-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  public isLoggedIn = false;
  public hideUserMessage = false;
  private readonly subscriptions: Subscription[] = [];

  private overviewTitle: string;
  private adminPortalTitle: string;
  public message: Message | undefined;

  constructor(
    private readonly logger: ClassloggerService,
    private readonly translate: TranslateService,
    private readonly titleService: Title,
    private readonly appConfigService: AppConfigService,
    private readonly router: Router,
    private readonly translateService: TranslateService,
    private readonly authentication: AuthenticationService,
    private readonly confirmationService: ConfirmationService,
    private readonly userMessageService: UserMessageService,
  ) {
    this.titleService.setTitle(Globals.QIM_ProductNameFull + ' ' + this.appConfigService.Config.Title);

    this.translateService.onLangChange.subscribe(() => {
      this.initTitles();
      this.setTitle(this.router.url);
    });

    this.subscriptions.push(
      this.authentication.onSessionResponse.subscribe(async (sessionState: ISessionState) => {
        // Close the splash screen that opened in app service initialisation
        this.isLoggedIn = sessionState?.IsLoggedIn ?? false;
        if (this.isLoggedIn) {
          this.titleService.setTitle(this.adminPortalTitle);
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

  public ngOnDestroy(): void {
    this.subscriptions.forEach((s) => s.unsubscribe());
  }

  public async ngOnInit(): Promise<void> {
    this.initTitles();
    await this.authentication.update();
  }

  /**
   * Logs out and kills the session.
   */
  public async logout(): Promise<void> {
    await this.authentication.logout();
    this.router.navigate([''], { queryParams: {} });
  }

  private setupRouter(): void {
    this.router.events.subscribe((event: Event) => {
      if (event instanceof NavigationEnd) {
        this.setTitle(this.router.url);
      }
    });
  }

  private initTitles(): void {
    this.overviewTitle = this.translate.instant('#LDS#Heading Web Applications Overview');
    this.adminPortalTitle = this.translate.instant('#LDS#Heading Administration Portal');
  }

  private setTitle(url: string): void {
    if (url === '/') {
      // show another title on the startpage
      this.titleService.setTitle(Globals.QIM_ProductNameFull + ' ' + this.overviewTitle);
      this.appConfigService.setTitle(this.overviewTitle);
    } else {
      this.titleService.setTitle(Globals.QIM_ProductNameFull + ' ' + this.adminPortalTitle);
      this.appConfigService.setTitle(this.adminPortalTitle);
    }
  }
}
