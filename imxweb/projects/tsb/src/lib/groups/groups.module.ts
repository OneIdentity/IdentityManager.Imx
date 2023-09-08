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
import { RouterModule } from '@angular/router';
import { EuiCoreModule, EuiMaterialModule } from '@elemental-ui/core';
import { TranslateModule } from '@ngx-translate/core';

import {
  DataSourceToolbarModule,
  DataTableModule,
  CdrModule,
  LdsReplaceModule,
  DataTreeModule,
  ExtModule,
  DynamicTabsModule,
  ObjectHistoryModule,
  BusyIndicatorModule,
  SelectedElementsModule,
  HelpContextualModule
 } from 'qbm';

import { GroupSidesheetComponent } from './group-sidesheet/group-sidesheet.component';
import { GroupMembersComponent } from './group-sidesheet/group-members/group-members.component';
import { DataExplorerGroupsComponent } from './groups.component';
import { ChildSystemEntitlementsComponent } from './group-sidesheet/child-system-entitlements/child-system-entitlements.component';
import { NoDataModule } from '../no-data/no-data.module';
import { DataFiltersModule } from '../data-filters/data-filters.module';
import { ProductOwnerSidesheetComponent } from './product-owner-sidesheet/product-owner-sidesheet.component';
import { IdentityRoleMembershipsModule, ObjectHyperviewModule, OwnerControlModule, ServiceItemsEditFormModule } from 'qer';
import { GroupMembershipsExtComponent } from './group-memberships-ext/group-memberships-ext.component';

@NgModule({
  declarations: [
    DataExplorerGroupsComponent,
    GroupSidesheetComponent,
    GroupMembersComponent,
    ChildSystemEntitlementsComponent,
    ProductOwnerSidesheetComponent,
    GroupMembershipsExtComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    EuiCoreModule,
    EuiMaterialModule,
    ExtModule,
    CdrModule,
    RouterModule,
    ObjectHyperviewModule,
    OwnerControlModule,
    BusyIndicatorModule,
    ServiceItemsEditFormModule,
    TranslateModule,
    DataSourceToolbarModule,
    DataTableModule,
    LdsReplaceModule,
    DataFiltersModule,
    NoDataModule,
    DataTreeModule,
    DynamicTabsModule,
    ObjectHistoryModule,
    IdentityRoleMembershipsModule,
    SelectedElementsModule,
    HelpContextualModule
  ],
  exports: [DataExplorerGroupsComponent, ChildSystemEntitlementsComponent],
})
export class GroupsModule {}
