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

import { Routes, RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';

import { RouteGuardService } from 'qbm';

import { ApplicationsComponent } from './applications.component';
import { ApplicationNavigationComponent } from './application-navigation/application-navigation.component';
import { ApplicationDetailComponent } from './application-detail.component';

const routes: Routes = [
  {
    path: 'applications',
    component: ApplicationsComponent,
    children: [
      {
        path: 'navigation',
        component: ApplicationNavigationComponent,
        canActivate: [RouteGuardService],
        resolve: [RouteGuardService]
      },
      {
        path: 'detail',
        component: ApplicationDetailComponent,
        outlet: 'content',
        canActivate: [RouteGuardService],
        resolve: [RouteGuardService]
      },
      {
        path: '',
        redirectTo: 'navigation',
        pathMatch: 'full'
      }
    ]
  },
  { path: ':create:id', redirectTo: 'applications', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ApplicationsRoutingModule { }
