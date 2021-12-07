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

import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { RouteGuardService } from 'qbm';
import { DataExplorerComponent } from './data-explorer/data-explorer.component';
import { UnsgroupsComponent } from './responsibilities/unsgroups/unsgroups.component';
import { ReportsComponent } from './reports/reports.component';
import { AdminGuardService } from './services/admin-guard.service';
import { DataExplorerIdentitiesComponent, RequestsFeatureGuardService } from 'qer';
import { SubscriptionsComponent } from 'rps';
import { RequestsComponent } from 'qer';
import { AdminGroupsComponent } from './configuration/admin-groups/admin-groups.component';
import { FeatureAvailabiltyComponent } from './configuration/feature-availabilty/feature-availabilty.component';
import { AttestationSchedulesComponent } from './configuration/attestation-schedules/attestation-schedules.component';

const routes: Routes = [
  {
    path: 'data/explorer',
    component: DataExplorerComponent,
    canActivate: [RouteGuardService, AdminGuardService],
    resolve: [RouteGuardService],
  },
  {
    path: 'data/explorer/:tab',
    component: DataExplorerComponent,
    canActivate: [RouteGuardService, AdminGuardService],
    resolve: [RouteGuardService],
  },
  {
    path: 'data/explorer/:tab/:issues',
    component: DataExplorerComponent,
    canActivate: [RouteGuardService, AdminGuardService],
    resolve: [RouteGuardService],
  },
  {
    path: 'data/explorer/:tab/:issues/:mode',
    component: DataExplorerComponent,
    canActivate: [RouteGuardService, AdminGuardService],
    resolve: [RouteGuardService],
  },
  {
    path: 'resp/unsgroup',
    component: UnsgroupsComponent,
    canActivate: [RouteGuardService],
    resolve: [RouteGuardService]
  },
  {
    path: 'reportsubscriptions',
    component: SubscriptionsComponent,
    canActivate: [RouteGuardService],
    resolve: [RouteGuardService]
  },
  {
    path: 'data/reports',
    component: ReportsComponent,
    canActivate: [RouteGuardService, AdminGuardService],
    resolve: [RouteGuardService],
  },
  {
    path: 'identities',
    component: DataExplorerIdentitiesComponent,
    canActivate: [RouteGuardService],
    resolve: [RouteGuardService],
  },
  {
    path: 'configuration/administratorgroups',
    component: AdminGroupsComponent,
    canActivate: [RouteGuardService, AdminGuardService],
    resolve: [RouteGuardService]
  },
  {
    path: 'configuration/requests',
    component: RequestsComponent,
    canActivate: [RouteGuardService, AdminGuardService],
    resolve: [RouteGuardService]
  },
  {
    path: 'configuration/features',
    component: FeatureAvailabiltyComponent,
    canActivate: [RouteGuardService, AdminGuardService],
    resolve: [RouteGuardService]
  },
  {
    path: 'configuration/schedules',
    component: AttestationSchedulesComponent,
    canActivate: [RouteGuardService, AdminGuardService],
    resolve: [RouteGuardService]
  },
  { path: '**', redirectTo: 'dashboard' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true, relativeLinkResolution: 'legacy' })],
  exports: [RouterModule],
})
export class AppRoutingModule { }
