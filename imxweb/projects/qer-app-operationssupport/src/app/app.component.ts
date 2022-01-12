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

import { OverlayRef } from '@angular/cdk/overlay';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, RouterEvent, NavigationStart, NavigationEnd, NavigationError, NavigationCancel } from '@angular/router';
import { EuiLoadingService } from '@elemental-ui/core';
import { Subscription } from 'rxjs';

import { MenuItem, AuthenticationService, ISessionState, MenuService, SettingsService, imx_SessionService } from 'qbm';
import { UserService } from './user/user.service';

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

  private readonly subscriptions: Subscription[] = [];

  constructor(
    private readonly authentication: AuthenticationService,
    private readonly busyService: EuiLoadingService,
    private readonly router: Router,
    private readonly menuService: MenuService,
    private readonly userModelService: UserService,
    sessionService: imx_SessionService,
    settings: SettingsService
  ) {

    this.setupMenu();

    this.subscriptions.push(
      this.authentication.onSessionResponse.subscribe(async (sessionState: ISessionState) => {
        this.isLoggedIn = sessionState.IsLoggedIn;
        if (this.isLoggedIn) {
          const conf = await sessionService.Client.opsupport_config_get();
          settings.DefaultPageSize = conf.DefaultPageSize;

          const groupInfo = await this.userModelService.getGroups();
          this.menuItems = this.menuService.getMenuItems([], groupInfo.map(group => group.Name), true);
        }
      })
    );


    this.subscriptions.push(this.authentication.onSessionResponse.subscribe(async (sessionState: ISessionState) => {
      this.isLoggedIn = sessionState.IsLoggedIn;
    }));

    this.setupRouter();
  }

  public async ngOnInit(): Promise<void> {
    await this.authentication.update();
  }

  public ngOnDestroy(): void {
    this.subscriptions.forEach(s => s.unsubscribe());
  }

  private setupRouter(): void {
    let overlayRef: OverlayRef;

    this.router.events.subscribe(((event: RouterEvent) => {
      switch (true) {
        case event instanceof NavigationStart:
          this.hideUserMessage = true;
          setTimeout(() => overlayRef = this.busyService.show());
          break;
        case event instanceof NavigationEnd:
        case event instanceof NavigationCancel:
        case event instanceof NavigationError:
          this.hideUserMessage = false;
          this.hideMenu = event.url === '/';
          setTimeout(() => this.busyService.hide(overlayRef));
      }
    }));
  }

  private setupMenu(): void {
    this.menuService.addMenuFactories(
      () => {
        return {
          id: 'OpsWeb_ROOT_Dashboard',
          title: '#LDS#Home',
          route: 'start'
        };
      },
      () => {
        const menu = {
          id: 'OpsWeb_ROOT_Processes',
          title: '#LDS#Processes',
          items: [
            {
              id: 'OpsWeb_Processes_Processes',
              title: '#LDS#Processes',
              route: 'Jobs'
            },
            {
              id: 'OpsWeb_Processes_ProcessSteps',
              title: '#LDS#Process steps',
              route: 'JobChainInformation'
            },
            {
              id: 'OpsWeb_Processes_Performance',
              title: '#LDS#Performance',
              route: 'JobPerformance'
            },
            {
              id: 'OpsWeb_Processes_SyncInformation',
              title: '#LDS#Synchronization',
              route: 'SyncInformation'
            }
          ]
        };
        return menu;
      },
      () => {
        return {
          id: 'OpsWeb_ROOT_Database',
          title: '#LDS#Database log',
          route: 'journal'
        };
      },
      (__: string[], groups: string[]) => {
        const menu = {
          id: 'OpsWeb_ROOT_Synchronization',
          title: '#LDS#Synchronization',
          items: [
            {
              id: 'OpsWeb_Synchronization_UnresolvedReferences',
              title: '#LDS#Unresolved references',
              route: 'unresolvedRefs'
            }
          ]
        };

        if (groups.some(elem => elem === 'QER_4_ManageOutstanding')) {
          menu.items.unshift({
            id: 'OpsWeb_Synchronization_OutstandingObjects',
            title: '#LDS#Menu Entry Outstanding objects',
            route: 'outstanding'
          });
        }
        return menu;
      },
      () => {
        return {
          id: 'OpsWeb_ROOT_WebApplications',
          title: '#LDS#Web applications',
          route: 'WebApplications'
        };
      },
      () => {
        return {
          id: 'OpsWeb_ROOT_SystemStatus',
          title: '#LDS#System status',
          route: 'SystemStatus'
        };
      });

    return null;
  }
}
