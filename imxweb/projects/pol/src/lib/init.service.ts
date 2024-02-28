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

import { Injectable } from '@angular/core';
import { Router, Route } from '@angular/router';
import { NotificationRegistryService } from 'qer';

import { ExtService, MenuItem, MenuService } from 'qbm';
import { isQERPolicyAdmin, isQERPolicyOwner } from './admin/permissions-helper';
import { DashboardPluginComponent } from './dashboard-plugin/dashboard-plugin.component';

@Injectable({ providedIn: 'root' })
export class InitService {
  constructor(
    private readonly extService: ExtService,
    private readonly menuService: MenuService,
    private readonly notificationService: NotificationRegistryService,
    private readonly router: Router
  ) {
    this.setupMenu();
  }

  public onInit(routes: Route[]): void {
    this.addRoutes(routes);

    this.extService.register('Dashboard-SmallTiles', { instance: DashboardPluginComponent });

    // Register handler for policy notifications
    this.notificationService.registerRedirectNotificationHandler({
      id: 'OpenQERPolicyHasObject',
      message: '#LDS#There are new policy violations for which you can grant or deny exceptions.',
      route: 'compliance/policyviolations/approve'
    });
  }

  private addRoutes(routes: Route[]): void {
    const config = this.router.config;
    routes.forEach(route => {
      config.unshift(route);
    });
    this.router.resetConfig(config);
  }

  private setupMenu(): void {
    this.menuService.addMenuFactories((preProps: string[], features: string[]) => {
      if (!preProps.includes('COMPLIANCE') || (!isQERPolicyAdmin(features) && !isQERPolicyOwner(features))) {
        return null;
      }

      const menu: MenuItem = {
        id: 'ROOT_Compliance',
        title: '#LDS#Compliance',
        sorting: '25',
        items: [
          {
            id: 'POL_Policies',
            route: 'compliance/policies',
            title: '#LDS#Menu Entry Company policies',
            sorting: '20-10',
          },
          {
            id: 'POL_policy-violations',
            route: 'compliance/policyviolations',
            title: '#LDS#Menu Entry Policy violations',
            sorting: '20-10',
          }
        ]
      };

      return menu;
    });
  }
}
