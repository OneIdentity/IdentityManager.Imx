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

import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router, Routes } from '@angular/router';
import { EuiCoreModule, EuiMaterialModule } from '@elemental-ui/core';
import { TranslateModule } from '@ngx-translate/core';
import { ClassloggerService, MenuService, RouteGuardService, SideNavigationViewModule } from 'qbm';
import { ApplicationGuardService } from '../guards/application-guard.service';
import { MyResponsibilitiesRegistryService } from './my-responsibilities-registry.service';
import { MyResponsibilitiesViewComponent } from './my-responsibilities-view.component';

const routes: Routes = [
  {
    path: 'myresponsibilities',
    component: MyResponsibilitiesViewComponent,
    canActivate: [RouteGuardService, ApplicationGuardService],
    resolve: [RouteGuardService],
  },
  {
    path: 'myresponsibilities/:tab',
    component: MyResponsibilitiesViewComponent,
    canActivate: [RouteGuardService, ApplicationGuardService],
    resolve: [RouteGuardService],
  },
];

@NgModule({
  declarations: [MyResponsibilitiesViewComponent],
  imports: [CommonModule, EuiCoreModule, EuiMaterialModule, MatTooltipModule, TranslateModule, SideNavigationViewModule],
  providers: [MyResponsibilitiesRegistryService],
})
export class MyResponsibilitiesViewModule {
  constructor(readonly router: Router, private readonly menuService: MenuService, logger: ClassloggerService) {
    const config = router.config;
    routes.forEach((route) => {
      config.splice(config.length - 1, 0, route);
    });
    this.router.resetConfig(config);
    logger.info(this, '▶️ MyResponsibilitiesViewModule loaded');
    this.setupMenu();
  }

  private setupMenu(): void {
    this.menuService.addMenuFactories((preProps: string[], features: string[]) => ({
      id: 'ROOT_Responsibilities',
      title: '#LDS#Responsibilities',
      sorting: '30',
      items: [
        {
          id: 'QER_My_Responsibilities',
          navigationCommands: { commands: ['myresponsibilities'] },
          title: '#LDS#Menu Entry My responsibilities',
          sorting: '30-20',
        },
      ],
    }));
  }
}
