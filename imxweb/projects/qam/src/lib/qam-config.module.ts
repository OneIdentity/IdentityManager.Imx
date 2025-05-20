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
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatMenuModule } from '@angular/material/menu';
import { MatRadioModule } from '@angular/material/radio';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTreeModule } from '@angular/material/tree';
import { RouterModule, Routes } from '@angular/router';
import { EuiCoreModule, EuiMaterialModule } from '@elemental-ui/core';
import { TranslateModule } from '@ngx-translate/core';
import {
  BusyIndicatorModule,
  CdrModule,
  DataSourceToolbarModule,
  DataTableModule,
  DynamicTabsModule,
  ExtModule,
  HelpContextualModule,
  LdsReplaceModule,
  ObjectHistoryModule,
  RouteGuardService,
} from 'qbm';
import { ObjectHyperviewModule, StatisticsModule } from 'qer';
import { AccessRequestModule } from './access-request/access-request.module';
import { AccessComponent } from './access/access.component';
import { TrusteeViewComponent } from './access/trustee-view.component';
import { UserAccessComponent } from './access/user-access.component';
import { DugActivitiesComponent } from './dug-activities/dug-activities.component';
import { DugDashboardsComponent } from './dug-dashboards/dug-dashboards.component';
import { DugOverviewComponent } from './dug-overview/dug-overview.component';
import { DugOwnershipComponent } from './dug-ownership/dug-ownership.component';
import { AccessComparisonComponent } from './dug/access-comparison.component';
import { DugAccessAnalysisComponent } from './dug/dug-access-analysis.component';
import { DugAccessDetailComponent } from './dug/dug-access-detail.component';
import { DugAccessModule } from './dug/dug-access/dug-access.module';
import { DugActivityModule } from './dug/dug-activity/dug-activity.module';
import { DugReportsComponent } from './dug/dug-reports/dug-reports.component';
import { DugSidesheetComponent } from './dug/dug-sidesheet.component';
import { IdentityComponent } from './identity/identity.component';
import { InitService } from './init.service';

const routes: Routes = [
  {
    path: 'dge',
    canActivate: [RouteGuardService],
    resolve: [RouteGuardService],
    component: DugSidesheetComponent, // as an example
  },
];

@NgModule({
  declarations: [
    AccessComponent,
    TrusteeViewComponent,
    IdentityComponent,
    DugSidesheetComponent,
    DugAccessAnalysisComponent,
    DugAccessDetailComponent,
    UserAccessComponent,
    AccessComparisonComponent,
    DugOverviewComponent,
    DugOwnershipComponent,
    DugReportsComponent,
    DugDashboardsComponent,
    DugActivitiesComponent,
  ],
  imports: [
    AccessRequestModule,
    CommonModule,
    DataSourceToolbarModule,
    DataTableModule,
    CdrModule,
    HelpContextualModule,
    DynamicTabsModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes),
    TranslateModule,
    LdsReplaceModule,
    MatButtonModule,
    MatRadioModule,
    MatMenuModule,
    MatTabsModule,
    MatExpansionModule,
    MatTreeModule,
    ObjectHyperviewModule,
    ObjectHistoryModule,
    EuiCoreModule,
    EuiMaterialModule,
    DugAccessModule,
    DugActivityModule,
    BusyIndicatorModule,
    ExtModule,
    StatisticsModule,
    MatTooltipModule,
  ],
})
export class QamConfigModule {
  constructor(private readonly initializer: InitService) {
    this.initializer.onInit(routes);

    console.log('▶️ QAM initialized');
  }
}
