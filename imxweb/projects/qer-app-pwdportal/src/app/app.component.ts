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
import { NavigationCancel, NavigationEnd, NavigationError, NavigationStart, Router, RouterEvent } from '@angular/router';
import { Subscription } from 'rxjs';

import { AppConfigService, AuthenticationService, ISessionState, SplashService } from 'qbm';

@Component({
  selector: 'imx-root',
  styleUrls: ['./app.component.scss'],
  templateUrl: './app.component.html',
})
export class AppComponent implements OnInit, OnDestroy {
  public isLoggedIn = false;
  public hideUserMessage = false;
  public showPageContent = true;

  private readonly subscriptions: Subscription[] = [];

  constructor(
    private readonly authentication: AuthenticationService,
    private readonly router: Router,
    private readonly splash: SplashService,
    private readonly config: AppConfigService
  ) {
    this.subscriptions.push(
      this.authentication.onSessionResponse.subscribe(async (sessionState: ISessionState) => {
        if (sessionState.hasErrorState) {
          // Needs to close here when there is an error on sessionState
          this.splash.close();
        } else {
          if (sessionState.IsLoggedOut && !this.isOnUserActivation()) {
            this.showPageContent = false;
          }
        }

        this.isLoggedIn = sessionState.IsLoggedIn;
        if (this.isLoggedIn) {
          // Close the splash screen that opened in app service initialisation
          // Needs to close here when running in containers (auth skipped)
          this.splash.close();
        }
      })
    );

    this.setupRouter();
  }

  public async ngOnInit(): Promise<void> {
    this.authentication.update();
  }

  public ngOnDestroy(): void {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }

  private isOnUserActivation(): boolean {
    return this.router.url.startsWith('/useractivation');
  }

  private setupRouter(): void {
    this.router.events.subscribe((event: RouterEvent) => {
      if (event instanceof NavigationStart) {
        this.hideUserMessage = true;
        if (this.isLoggedIn) {
          if (event.url === '/') {
            // show the splash screen, when the user logs out!
            this.splash.init({ applicationName: 'Password Reset Portal' });
          } else if (event.url === `/${this.config.Config.routeConfig.start}`) {
            // closes the splash-screen, if its displayed between Login and Dashboard
            this.splash.close();
          }
        }
      }

      if (event instanceof NavigationCancel) {
        this.hideUserMessage = false;
      }

      if (event instanceof NavigationEnd) {
        this.hideUserMessage = false;
        this.showPageContent = true;
      }

      if (event instanceof NavigationError) {
        this.hideUserMessage = false;
      }
    });
  }
}
