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

import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { Routes, RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

import { CdrModule, HELP_CONTEXTUAL, RouteGuardService, TileModule } from 'qbm';
import { BusinessownerOverviewTileModule, BusinessownerAddonTileModule } from 'qer';
import { ClaimGroupComponent } from './claim-group/claim-group.component';
import { InitService } from './init.service';
import { AccountsModule } from './accounts/accounts.module';
import { DataExplorerGroupsComponent } from './groups/groups.component';
import { GroupsModule } from './groups/groups.module';
import { TsbNamespaceAdminGuardService } from './guards/tsb-namespace-admin-guard.service';
import { ReportButtonExtModule } from './report-button-ext/report-button-ext.module';

const routes: Routes = [
  {
    path: 'claimgroup',
    component: ClaimGroupComponent,
    canActivate: [RouteGuardService],
    data:{
      contextId: HELP_CONTEXTUAL.ClaimGroup
    }
  },
  {
    path: 'resp/UNSGroup',
    component: DataExplorerGroupsComponent,
    canActivate: [RouteGuardService],
    resolve: [RouteGuardService]
  }
];

@NgModule({
  declarations: [
  ],
  imports: [
    AccountsModule,
    BusinessownerAddonTileModule,
    BusinessownerOverviewTileModule,
    CdrModule,
    CommonModule,
    GroupsModule,
    RouterModule.forChild(routes),
    MatIconModule,
    MatListModule,
    TileModule,
    TranslateModule,
    ReportButtonExtModule
  ],
  providers: [
    TsbNamespaceAdminGuardService
  ]
})
export class TsbConfigModule {
  constructor(private readonly initializer: InitService) {
    console.log('🔥 TSB loaded with claimgroup');
    this.initializer.onInit(routes);

    console.log('▶️ TSB initialized');
  }
}
