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

import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataExplorerComponent } from './data-explorer.component';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { EuiCoreModule, EuiMaterialModule } from '@elemental-ui/core';
import { TranslateModule } from '@ngx-translate/core';

import { DataSourceToolbarModule, DataTableModule, CdrModule, LdsReplaceModule, DataTreeModule, RouteGuardService } from 'qbm';
import { DeleteDataComponent } from './delete-data/delete-data.component';
import { DataIssuesComponent } from './data-issues/data-issues.component';
import { DataIssuesService } from './data-issues/data-issues.service';
import { IdentitiesWorkflowComponent } from './data-issues/identities-workflow/identities-workflow.component';
import { AttestationHistoryModule, AttestationRunsModule } from 'att';
import { IdentitiesModule } from 'qer';
import {
  AccountsModule,
  DataFiltersModule,
  GroupsModule
} from 'tsb';
import { TeamsModule } from 'o3t';
import { AzureAdModule } from 'aad';

import { AdminGuardService } from '../services/admin-guard.service';

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
  }
];

@NgModule({
  declarations: [
    DataExplorerComponent,
    DeleteDataComponent,
    DataIssuesComponent,
    IdentitiesWorkflowComponent,
  ],
  imports: [
    AttestationHistoryModule,
    AccountsModule,
    DataFiltersModule,
    IdentitiesModule,
    CommonModule,
    FormsModule,
    GroupsModule,
    ReactiveFormsModule,
    EuiCoreModule,
    EuiMaterialModule,
    CdrModule,
    RouterModule.forChild(routes),
    MatExpansionModule,
    MatIconModule,
    MatSidenavModule,
    TranslateModule,
    DataSourceToolbarModule,
    DataTableModule,
    LdsReplaceModule,
    DataTreeModule,
    AttestationRunsModule,
    TeamsModule,
    AzureAdModule
  ],
  providers: [DataIssuesService],
  exports: [DataExplorerComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class DataExplorerModule {}
