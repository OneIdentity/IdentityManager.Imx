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

import { Component, Input, ViewEncapsulation, OnDestroy } from '@angular/core';
import { AppConfigService, AuthenticationService, ISessionState } from 'qbm';
import { Router } from '@angular/router';
import { EuiTopNavigationItem } from '@elemental-ui/core';
import { Subscription } from 'rxjs';

@Component({
  selector: 'imx-governance-masthead',
  templateUrl: './governance-masthead.component.html',
  styleUrls: ['./governance-masthead.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class GovernanceMastheadComponent implements OnDestroy {
  /**
   * @description The list of navigation list items to display
   */
  @Input() public navigationItems: EuiTopNavigationItem[] = [];

  @Input() public isBootstrapUser = false;

  public sessionState: ISessionState;
  private sessionState$: Subscription;

  get isMobile(): boolean {
    return document.body.offsetWidth <= 768;
  }

  public get isAuthenticated(): boolean {
    return this.sessionState?.IsLoggedIn;
  }

  constructor(
    public readonly appConfig: AppConfigService,
    private readonly router: Router,
    private readonly authentication: AuthenticationService
  ) {
    this.sessionState$ = this.authentication.onSessionResponse.subscribe((sessionState: ISessionState) => {
      this.sessionState = sessionState;
    });
  }

  public ngOnDestroy(): void {
    if (this.sessionState$) {
      this.sessionState$.unsubscribe();
    }
  }

  /**
   * For navigating home, you know.
   */
  public goHome(): void {
    const home = this.isBootstrapUser ? 'data/explorer' : this.appConfig.Config.routeConfig.start;
    this.router.navigate([home], { queryParams: {} });
  }
}
