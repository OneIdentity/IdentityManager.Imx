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
import { MatCardModule } from '@angular/material/card';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { RouterModule } from '@angular/router';
import { EuiCoreModule, EuiMaterialModule } from '@elemental-ui/core';
import { TranslateModule } from '@ngx-translate/core';

import {
  BusyIndicatorModule,
  CdrModule,
  DataSourceToolbarModule,
  DataTableModule,
  DataTreeModule,
  DataViewModule,
  DynamicTabsModule,
  ExtModule,
  HelpContextualModule,
  LdsReplaceModule,
} from 'qbm';
import { ObjectHyperviewModule } from 'qer';
import { AccountSidesheetComponent } from '../accounts/account-sidesheet/account-sidesheet.component';
import { DataExplorerAccountsComponent } from '../accounts/accounts.component';
import { DataFiltersModule } from '../data-filters/data-filters.module';
import { GroupsModule } from '../groups/groups.module';
import { NoDataModule } from '../no-data/no-data.module';
import { AccountsExtComponent } from './account-ext/accounts-ext.component';
import { TargetSystemReportComponent } from './target-system-report/target-system-report.component';

@NgModule({
  declarations: [DataExplorerAccountsComponent, AccountSidesheetComponent, AccountsExtComponent, TargetSystemReportComponent],
  imports: [
    DataFiltersModule,
    NoDataModule,
    CommonModule,
    FormsModule,
    GroupsModule,
    BusyIndicatorModule,
    ReactiveFormsModule,
    EuiCoreModule,
    EuiMaterialModule,
    CdrModule,
    RouterModule,
    MatExpansionModule,
    MatIconModule,
    MatSidenavModule,
    MatCardModule,
    MatButtonModule,
    ObjectHyperviewModule,
    TranslateModule,
    DataSourceToolbarModule,
    DataTableModule,
    LdsReplaceModule,
    DataTreeModule,
    ExtModule,
    DynamicTabsModule,
    HelpContextualModule,
    DataViewModule,
  ],
  exports: [DataExplorerAccountsComponent, AccountsExtComponent],
})
export class AccountsModule {}
