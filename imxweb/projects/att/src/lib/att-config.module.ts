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
import { PolicyListComponent } from './policies/policy-list/policy-list.component';
import { ClassloggerService, RouteGuardService } from 'qbm';
import { InitService } from './init.service';
import { AttestationDecisionModule } from './decision/attestation-decision.module';
import { AttestationDecisionComponent } from './decision/attestation-decision.component';
import { DashboardPluginComponent } from './dashboard-plugin/dashboard-plugin.component';
import { AttestationRunsModule } from './runs/attestation-runs.module';
import { RunsComponent } from './runs/runs.component';
import { TilesModule } from 'qer';
import { AttestationHistoryWrapperComponent } from './attestation-history/attestation-history-wrapper.component';
import { AttestationFeatureGuardService } from './attestation-feature-guard.service';
import { PickCategoryComponent } from './pick-category/pick-category.component';
import { AttestionAdminGuardService } from './guards/attestation-admin-guard.service';
import { AttestationPoliciesGuardService } from './guards/attestation-policies-guard.service';
import { ClaimDeviceComponent } from './claim-device/claim-device.component';

const routes: Routes = [
  {
    path: 'attestation/policies',
    component: PolicyListComponent,
    canActivate: [RouteGuardService, AttestationFeatureGuardService, AttestationPoliciesGuardService],
    resolve: [RouteGuardService]
  },
  {
    path: 'attestation/runs',
    component: RunsComponent,
    canActivate: [RouteGuardService, AttestationFeatureGuardService, AttestationPoliciesGuardService],
    resolve: [RouteGuardService]
  },
  {
    path: 'attestation/history',
    component: AttestationHistoryWrapperComponent,
    canActivate: [RouteGuardService, AttestationFeatureGuardService],
    resolve: [RouteGuardService]
  },
  {
    path: 'attestation/decision',
    component: AttestationDecisionComponent,
    canActivate: [RouteGuardService, AttestationFeatureGuardService],
    resolve: [RouteGuardService]
  },
  {
    path: 'attestation/preselection',
    component: PickCategoryComponent,
    canActivate: [RouteGuardService, AttestationFeatureGuardService, AttestionAdminGuardService],
    resolve: [RouteGuardService]
  },
  {
    path: 'claimdevice',
    component: ClaimDeviceComponent,
    canActivate: [RouteGuardService],
    resolve: [RouteGuardService]
  }
];

@NgModule({
  declarations: [
    DashboardPluginComponent
  ],
  imports: [
    CommonModule,
    TilesModule,
    AttestationDecisionModule,
    RouterModule.forChild(routes),
    AttestationRunsModule,
    MatIconModule,
    MatListModule,
    TranslateModule,
    EuiCoreModule
  ]
})
export class AttConfigModule {
  constructor(
    private readonly initializer: InitService, private readonly logger: ClassloggerService) {
    this.logger.info(this, '🔥 ATT loaded');
    this.initializer.onInit(routes);
    this.logger.info(this, '▶️ ATT initialized');
  }
}
