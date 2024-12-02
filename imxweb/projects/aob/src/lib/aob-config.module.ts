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

import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

import { EuiCoreModule, EuiMaterialModule } from '@elemental-ui/core';
import { ClassloggerService, HELP_CONTEXTUAL, RouteGuardService } from 'qbm';
import { TilesModule } from 'qer';
import { AobService } from './aob.service';
import { ApplicationDetailComponent } from './applications/application-detail.component';
import { ApplicationNavigationComponent } from './applications/application-navigation/application-navigation.component';
import { ApplicationsComponent } from './applications/applications.component';
import { ApplicationsModule } from './applications/applications.module';
import { EntitlementsModule } from './entitlements/entitlements.module';
import { LockInfoAlertComponent } from './extensions/service-items-edit/lock-info-alert/lock-info-alert.component';
import { GlobalKpiComponent } from './global-kpi/global-kpi.component';
import { AobApplicationsGuardService } from './guards/aob-applications-guard.service';
import { AobKpiGuardService } from './guards/aob-kpi-guard.service';
import { StartPageModule } from './start-page/start-page.module';

const routes: Routes = [
  {
    path: 'applications/kpi',
    component: GlobalKpiComponent,
    canActivate: [RouteGuardService, AobKpiGuardService],
    resolve: [RouteGuardService],
  },
  {
    path: 'applications',
    component: ApplicationsComponent,
    canActivate: [RouteGuardService, AobApplicationsGuardService],
    resolve: [RouteGuardService],
    children: [
      {
        path: 'navigation',
        component: ApplicationNavigationComponent,
        canActivate: [RouteGuardService],
        resolve: [RouteGuardService],
        data: {
          contextId: HELP_CONTEXTUAL.Applications,
        },
      },
      {
        path: 'detail',
        component: ApplicationDetailComponent,
        outlet: 'content',
        canActivate: [RouteGuardService],
        resolve: [RouteGuardService],
      },
      { path: ':create:id', redirectTo: 'applications', pathMatch: 'full' },
    ],
  },
];

@NgModule({
  imports: [
    ApplicationsModule,
    CommonModule,
    EntitlementsModule,
    EuiCoreModule,
    EuiMaterialModule,
    StartPageModule,
    TilesModule,
    TranslateModule,
    RouterModule.forChild(routes),
  ],
  declarations: [LockInfoAlertComponent],
})
export class AobConfigModule {
  constructor(
    private readonly initializer: AobService,
    private readonly logger: ClassloggerService,
  ) {
    this.logger.info(this, '🔥 AOB loaded');
    this.initializer.onInit(routes);
    this.logger.info(this, '▶️ AOB initialized');
  }
}
