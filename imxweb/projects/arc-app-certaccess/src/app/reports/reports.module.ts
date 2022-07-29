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
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { EuiMaterialModule, EuiCoreModule } from '@elemental-ui/core';
import { TranslateModule } from '@ngx-translate/core';

import { RouteGuardService } from 'qbm';
import { IdentitiesReportsService } from 'qer';
import { AccountsReportsService, GroupsReportsService } from 'tsb';
import { ReportsComponent } from './reports.component';
import { ReportsService } from './reports.service';
import { AdminGuardService } from '../services/admin-guard.service';

const routes: Routes = [
  {
    path: 'data/reports',
    component: ReportsComponent,
    canActivate: [RouteGuardService, AdminGuardService],
    resolve: [RouteGuardService],
  }
];

@NgModule({
  declarations: [ReportsComponent],
  imports: [
    CommonModule,
    EuiCoreModule,
    EuiMaterialModule,
    FormsModule,
    RouterModule.forChild(routes),
    TranslateModule
  ],
  providers: [
    ReportsService, 
    IdentitiesReportsService, 
    AccountsReportsService, 
    GroupsReportsService],
})
export class ReportsModule { }
