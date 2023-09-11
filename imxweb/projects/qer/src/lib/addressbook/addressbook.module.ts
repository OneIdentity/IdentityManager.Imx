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
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { RouterModule, Routes } from '@angular/router';
import { EuiCoreModule } from '@elemental-ui/core';
import { MatExpansionModule } from '@angular/material/expansion';
import { TranslateModule } from '@ngx-translate/core';

import { DataSourceToolbarModule, DataTableModule, CdrModule, RouteGuardService, HELP_CONTEXTUAL, HelpContextualModule } from 'qbm';

import { AddressbookComponent } from './addressbook.component';
import { AddressbookDetailComponent } from './addressbook-detail/addressbook-detail.component';
import { OrgChartModule } from '../org-chart/org-chart.module';

const routes: Routes = [
  {
    path: 'addressbook',
    component: AddressbookComponent,
    canActivate: [RouteGuardService],
    resolve: [RouteGuardService],
    data:{
      contextId: HELP_CONTEXTUAL.Addressbook
    }
  },
];

@NgModule({
  declarations: [AddressbookComponent, AddressbookDetailComponent],
  imports: [
    CommonModule,
    CdrModule,
    EuiCoreModule,
    TranslateModule,
    DataSourceToolbarModule,
    DataTableModule,
    FormsModule,
    RouterModule.forChild(routes),
    MatButtonModule,
    MatCardModule,
    MatExpansionModule,
    OrgChartModule,
    ReactiveFormsModule,
    HelpContextualModule,
  ],
  exports: [AddressbookComponent],
})
export class AddressbookModule {}
