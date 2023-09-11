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
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { EuiCoreModule, EuiMaterialModule } from '@elemental-ui/core';
import { TranslateModule } from '@ngx-translate/core';

import { QbmModule, CdrModule, LdsReplaceModule, DataSourceToolbarModule, DataTableModule, DataTilesModule, DataTreeModule } from 'qbm';
import { SourceDetectiveModule } from '../../sourcedetective/sourcedetective.module';
import { NotRequestableMembershipsComponent } from '../memberships-choose-identities/not-requestable-memberships/not-requestable-memberships.component';
import { MembershipsChooseIdentitiesComponent } from '../memberships-choose-identities/memberships-choose-identities.component';
import { ExcludedMembershipsComponent } from './excluded-memberships.component';
import { PrimaryMembershipsComponent } from './primary-memberships.component';
import { RemoveMembershipComponent } from './remove-membership.component';
import { RoleMembershipsComponent } from './role-memberships.component';
import { SecondaryMembershipsComponent } from './secondary-memberships.component';
import { SqlWizardModule, SelectedElementsModule } from 'qbm';
import { DynamicRoleComponent } from './dynamic-role.component';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@NgModule({
  declarations: [
    RoleMembershipsComponent,
    MembershipsChooseIdentitiesComponent,
    PrimaryMembershipsComponent,
    SecondaryMembershipsComponent,
    RemoveMembershipComponent,
    DynamicRoleComponent,
    ExcludedMembershipsComponent,
    NotRequestableMembershipsComponent
  ],
  imports: [
    CommonModule,
    QbmModule,
    CdrModule,
    TranslateModule,
    FormsModule,
    ReactiveFormsModule,
    EuiCoreModule,
    EuiMaterialModule,
    LdsReplaceModule,
    MatProgressSpinnerModule,
    DataSourceToolbarModule,
    DataTableModule,
    DataTilesModule,
    DataTreeModule,
    SourceDetectiveModule,
    SqlWizardModule,
    SelectedElementsModule
  ],
  exports: [
    RoleMembershipsComponent
  ]
})
export class RoleMembershipsModule { }
