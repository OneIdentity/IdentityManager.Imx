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

import { InitService } from './init.service';
import { SubscriptionsModule } from './subscriptions/subscriptions.module';
import { EditReportComponent } from './reports/edit-report.component';
import { EditReportModule } from './reports/edit-report.module';
import { ReportButtonModule } from './report-button/report-button.module';

const routes: Routes = [
  {
    path: 'reports',
    component: EditReportComponent,
    canActivate: [RouteGuardService],
    resolve: [RouteGuardService]
  }
];

@NgModule({
  imports: [
    EditReportModule,
    SubscriptionsModule,
    ReportButtonModule,
    RouterModule.forChild(routes)
  ]
})
export class RpsConfigModule {
  constructor(private readonly initializer: InitService) {
    console.log('🔥 RPS loaded');
    this.initializer.onInit(routes);

    console.log('▶️ RPS initialized');
  }
}
