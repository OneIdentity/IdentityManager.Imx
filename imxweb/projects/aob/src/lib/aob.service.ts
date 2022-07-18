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

import { Injectable } from '@angular/core';
import { Router, Route } from '@angular/router';

import { ExtService, MenuItem, MenuService } from 'qbm';
import { KpiTileComponent } from './global-kpi/kpi-tile/kpi-tile.component';
import { isAobApplicationAdmin, isAobApplicationOwner } from './permissions/aob-permissions-helper';

@Injectable({
  providedIn: 'root'
})
export class AobService {
  constructor(
    private readonly router: Router,
    private readonly extService: ExtService,
    private readonly menuService: MenuService
  ) {
    this.setupMenu();
  }

  public onInit(routes: Route[]): void {
    this.addRoutes(routes);
    this.extService.register('Dashboard-MediumTiles', {
      instance: KpiTileComponent
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
    this.menuService.addMenuFactories((preProps: string[], groups: string[]) => {
      const items: MenuItem[] = [];
      if (isAobApplicationAdmin(groups) || isAobApplicationOwner(groups)) {
        items.push(
          {
            id: 'AOB_Data_Applications',
            title: '#LDS#Applications',
            navigationCommands: { commands: ['/applications', { outlets: { primary: ['navigation'], content: ['detail'] } }] },
            sorting: '40-20',
          }
        );
      }
      if (items.length === 0) {
        return null;
      }

      return {
        id: 'ROOT_Data',
        title: '#LDS#Data administration',
        sorting: '40',
        items
      };
    });
  }
}
