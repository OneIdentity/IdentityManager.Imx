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
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialogModule } from '@angular/material/dialog';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatRadioModule } from '@angular/material/radio';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTooltipModule } from '@angular/material/tooltip';
import { EuiCoreModule, EuiMaterialModule } from '@elemental-ui/core';
import { TranslateModule } from '@ngx-translate/core';
import {
  CdrModule,
  ClassloggerModule,
  DataSourceToolbarModule,
  DataTableModule,
  DataViewModule,
  HelpContextualModule,
  LdsReplaceModule,
} from 'qbm';
import { PolicyGroupListComponent } from './policy-group-list/policy-group-list.component';

import { UserModule } from 'qer';
import { EditPolicyGroupSidesheetComponent } from './edit-policy-group-sidesheet/edit-policy-group-sidesheet.component';
import { PolicyGroupService } from './policy-group.service';

@NgModule({
  imports: [
    CdrModule,
    CommonModule,
    DataSourceToolbarModule,
    DataTableModule,
    EuiCoreModule,
    EuiMaterialModule,
    FormsModule,
    LdsReplaceModule,
    MatExpansionModule,
    MatTooltipModule,
    MatInputModule,
    MatButtonModule,
    MatDialogModule,
    MatRadioModule,
    MatCheckboxModule,
    MatSlideToggleModule,
    MatMenuModule,
    ReactiveFormsModule,
    TranslateModule,
    UserModule,
    ClassloggerModule,
    HelpContextualModule,
    DataViewModule,
  ],
  declarations: [PolicyGroupListComponent, EditPolicyGroupSidesheetComponent],
  providers: [PolicyGroupService],
  exports: [PolicyGroupListComponent, EditPolicyGroupSidesheetComponent],
})
export class PolicyGroupModule {}
