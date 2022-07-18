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

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, Routes } from '@angular/router';
import { EuiCoreModule, EuiMaterialModule } from '@elemental-ui/core';
import { TranslateModule } from '@ngx-translate/core';

import { DataExplorerViewComponent } from './data-explorer-view.component';
import { DataExplorerRegistryService } from './data-explorer-registry.service';
import { RouteGuardService } from 'qbm';
import { ApplicationGuardService } from '../guards/application-guard.service';

const routes: Routes = [
  {
    path: 'admin/dataexplorer',
    component: DataExplorerViewComponent,
    canActivate: [RouteGuardService, ApplicationGuardService],
    resolve: [RouteGuardService],
  },
  {
    path: 'admin/dataexplorer/:tab',
    component: DataExplorerViewComponent,
    canActivate: [RouteGuardService, ApplicationGuardService],
    resolve: [RouteGuardService],
  },
];

@NgModule({
  declarations: [
    DataExplorerViewComponent
  ],
  imports: [
    CommonModule,
    EuiCoreModule,
    EuiMaterialModule,
    TranslateModule
  ],
  providers: [
    DataExplorerRegistryService
  ]
})
export class DataExplorerViewModule {

  constructor(
    readonly router: Router) {
    const config = router.config;
    routes.forEach((route) => {
      // because these both routes have a placeholder, add them next to the last route (the wildcard-route)
      config.splice(config.length - 1, 0, route);
    });
    this.router.resetConfig(config);
  }
}
