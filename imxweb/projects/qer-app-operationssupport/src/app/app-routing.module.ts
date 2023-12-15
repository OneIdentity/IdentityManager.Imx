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

import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AuthenticationGuardService, LoginComponent, RouteGuardService } from 'qbm';
import { ObjectOverviewComponent } from './object-overview/object-overview.component';
import { JobsComponent } from './processes/jobs/jobs.component';
import { JournalComponent } from './journal/journal.component';
import { UnresolvedRefsComponent } from './unresolved-refs/unresolved-refs.component';
import { SystemStatusComponent } from './information/system-status/system-status.component';
import { WebApplicationsComponent } from './web-applications/web-applications.component';
import { ServiceAvailabilityComponent } from './service-report/service-availability.component';
import { ServicesInactiveComponent } from './service-report/services-inactive.component';
import { FrozenJobsComponent } from './processes/frozen-jobs/frozen-jobs.component';
import { JobChainsComponent } from './processes/job-chains/job-chains.component';
import { JobHistoryComponent } from './processes/job-history/job-history.component';
import { JobPerformanceComponent } from './processes/job-performance/job-performance.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { SyncInformationComponent } from './sync/sync-information/sync-information.component';
import { SyncJournalComponent } from './sync/sync-journal/sync-journal.component';
import { OutstandingComponent } from 'dpr';
import { SystemStatusRouteGuardService } from './guards/system-status-route-guard.service';
import { OutstandingManagerGuardService } from './guards/outstanding-manager-guard.service';
import { ObjectsByIdComponent } from './processes/objects-by-id/objects-by-id.component';
import { DataChangesComponent } from './data-changes/data-changes.component';
import { DbQueueComponent } from './db-queue/db-queue.component';

const routes: Routes = [
  {
    path: '',
    component: LoginComponent,
    canActivate: [AuthenticationGuardService],
    resolve: [RouteGuardService]
  },
  {
    path: 'start',
    component: DashboardComponent,
    canActivate: [RouteGuardService],
    resolve: [RouteGuardService],
  },
  {
    path: 'FrozenJobs',
    component: FrozenJobsComponent,
    canActivate: [RouteGuardService],
    resolve: [RouteGuardService],
  },
  {
    path: 'JobChainInformation',
    component: JobChainsComponent,
    canActivate: [RouteGuardService],
    resolve: [RouteGuardService],
  },
  {
    path: 'object/:table/:uid',
    component: ObjectOverviewComponent,
    canActivate: [RouteGuardService],
    resolve: [RouteGuardService],
  },
  {
    path: 'object/:table/:uid/:tab',
    component: ObjectOverviewComponent,
    canActivate: [RouteGuardService],
    resolve: [RouteGuardService],
  },
  {
    path: 'jobserver/:queueName',
    component: FrozenJobsComponent,
    canActivate: [RouteGuardService],
    resolve: [RouteGuardService],
  },

  {
    path: 'outstanding',
    component: OutstandingComponent,
    canActivate: [RouteGuardService, OutstandingManagerGuardService],
    resolve: [RouteGuardService],
  },
  {
    path: 'Jobs',
    component: JobsComponent,
    canActivate: [RouteGuardService],
    resolve: [RouteGuardService],
  },
  {
    path: 'journal',
    component: JournalComponent,
    canActivate: [RouteGuardService],
    resolve: [RouteGuardService],
  },
  {
    path: 'unresolvedRefs',
    component: UnresolvedRefsComponent,
    canActivate: [RouteGuardService],
    resolve: [RouteGuardService],
  },
  {
    path: 'JobPerformance',
    component: JobPerformanceComponent,
    canActivate: [RouteGuardService],
    resolve: [RouteGuardService],
  },
  {
    path: 'JobHistory',
    component: JobHistoryComponent,
    canActivate: [RouteGuardService],
    resolve: [RouteGuardService],
  },
  {
    path: 'SystemStatus',
    component: SystemStatusComponent,
    canActivate: [RouteGuardService, SystemStatusRouteGuardService],
    resolve: [RouteGuardService],
  },
  {
    path: 'WebApplications',
    component: WebApplicationsComponent,
    canActivate: [RouteGuardService],
    resolve: [RouteGuardService],
  },
  {
    path: 'ServiceAvailability',
    component: ServiceAvailabilityComponent,
    canActivate: [RouteGuardService],
    resolve: [RouteGuardService],
  },
  {
    path: 'ServicesInactive',
    component: ServicesInactiveComponent,
    canActivate: [RouteGuardService],
    resolve: [RouteGuardService],
  },
  {
    path: 'SyncInformation',
    component: SyncInformationComponent,
    canActivate: [RouteGuardService],
    resolve: [RouteGuardService],
  },
  {
    path: 'SyncJournal',
    component: SyncJournalComponent,
    canActivate: [RouteGuardService],
    resolve: [RouteGuardService],
  },
  {
    path: 'SyncJournal/:uidSyncShell',
    component: SyncJournalComponent,
    canActivate: [RouteGuardService],
    resolve: [RouteGuardService],
  },
  {
    path: 'ObjectByProccessId',
    component: ObjectsByIdComponent,
    canActivate: [RouteGuardService],
    resolve: [RouteGuardService],
  },
  {
    path: 'DataChanges',
    component: DataChangesComponent,
    canActivate: [RouteGuardService],
    resolve: [RouteGuardService]
  },
  {
    path: 'DbQueue',
    component: DbQueueComponent,
    canActivate: [RouteGuardService],
    resolve: [RouteGuardService],
  },
  { path: '**', redirectTo: 'start' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true, relativeLinkResolution: 'legacy' })],
  exports: [RouterModule],
})
export class AppRoutingModule {}
