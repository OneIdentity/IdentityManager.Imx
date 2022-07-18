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

import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { Routes, RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

import { EuiCoreModule } from '@elemental-ui/core';

import { ClassloggerService, RouteGuardService } from 'qbm';
import { InitService } from './init.service';
import { TilesModule } from 'qer';
import { DashboardPluginComponent } from './dashboard-plugin/dashboard-plugin.component';
import { PolicyViolationsComponent } from './policy-violations/policy-violations.component';
import { PolicyViolationsModule } from './policy-violations/policy-violations.module';
import { PolicyViolationApproverGuardService } from './guards/policy-violation-approver-guard.service';

const routes: Routes = [
  {
    path: 'compliance/policyviolations/approve',
    component: PolicyViolationsComponent,
    canActivate: [RouteGuardService, PolicyViolationApproverGuardService],
    resolve: [RouteGuardService]
  },
  {
    path: 'compliance/policyviolations',
    component: PolicyViolationsComponent,
    canActivate: [RouteGuardService, PolicyViolationApproverGuardService],
    resolve: [RouteGuardService]
  }
];

@NgModule({
  declarations: [
    DashboardPluginComponent,
  ],
  imports: [
    CommonModule,
    TilesModule,
    RouterModule.forChild(routes),
    MatIconModule,
    MatListModule,
    TranslateModule,
    EuiCoreModule,
    PolicyViolationsModule
  ]
})
export class PolConfigModule {
  constructor(
    private readonly initializer: InitService, private readonly logger: ClassloggerService) {
    this.logger.info(this, '🔥 POL loaded');
    this.initializer.onInit(routes);
    this.logger.info(this, '▶️ POL initialized');
  }
}
