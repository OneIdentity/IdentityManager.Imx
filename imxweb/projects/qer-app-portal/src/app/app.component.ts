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

import { Component, OnDestroy, OnInit } from '@angular/core';
import { OverlayRef } from '@angular/cdk/overlay';
import { Router, NavigationEnd, NavigationStart, NavigationError, RouterEvent, NavigationCancel } from '@angular/router';
import { Subscription } from 'rxjs';

import { AuthenticationService, ISessionState, MenuItem, SystemInfoService, MenuService, IeWarningService } from 'qbm';
import { PendingItemsType, ProjectConfigurationService, UserModelService } from 'qer';
import { QerProjectConfig } from 'imx-api-qer';
import { ProjectConfig } from 'imx-api-qbm';

@Component({
  selector: 'imx-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
  public menuItems: MenuItem[];
  public isLoggedIn = false;
  public hideMenu = false;
  public hideUserMessage = false;
  public pendingItems: PendingItemsType;

  private readonly subscriptions: Subscription[] = [];

  constructor(
    private readonly authentication: AuthenticationService,
    menuService: MenuService,
    userModelService: UserModelService,
    private readonly router: Router,
    systemInfoService: SystemInfoService,
    ieWarningService: IeWarningService,
    projectConfig: ProjectConfigurationService
  ) {
    this.subscriptions.push(
      this.authentication.onSessionResponse.subscribe(async (sessionState: ISessionState) => {
        this.isLoggedIn = sessionState.IsLoggedIn;
        if (this.isLoggedIn) {
          const config: QerProjectConfig & ProjectConfig = await projectConfig.getConfig();
          this.pendingItems = await userModelService.getPendingItems();
          const groupInfo = await userModelService.getGroups();
          const systemInfo = await systemInfoService.get();
          this.menuItems = menuService.getMenuItems(systemInfo.PreProps, groupInfo.map(group => group.Name), false, config);

          ieWarningService.showIe11Banner();
        }
      })
    );

    this.subscriptions.push(userModelService.onPendingItemsChange.subscribe((pendingItems: PendingItemsType) => {
      this.pendingItems = pendingItems;
    }));

    this.setupRouter();
  }

  /**
   * Returns true for routes that require different page level styling
   */
  public get isContentFullScreen(): boolean {
    return (
      this.router.url.includes('dataexplorer')
    );
  }

  public async ngOnInit(): Promise<void> {
    this.authentication.update();
  }

  public ngOnDestroy(): void {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  public async goToProfile(): Promise<void> {
    this.router.navigate(['profile']);
  }

  public async goToAddressbook(): Promise<void> {
    this.router.navigate(['addressbook']);
  }

  private setupRouter(): void {
    let overlayRef: OverlayRef;

    this.router.events.subscribe(((event: RouterEvent) => {
      if (event instanceof NavigationStart) {
        this.hideUserMessage = true;
      }

      if (event instanceof NavigationCancel) {
        this.hideUserMessage = false;
      }

      if (event instanceof NavigationEnd) {
        this.hideUserMessage = false;
        this.hideMenu = event.url === '/';
      }

      if (event instanceof NavigationError) {
        this.hideUserMessage = false;
      }
    }));
  }
}
