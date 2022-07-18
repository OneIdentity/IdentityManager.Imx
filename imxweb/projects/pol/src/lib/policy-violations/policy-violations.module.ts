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

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { ReactiveFormsModule } from '@angular/forms';
import { EuiCoreModule } from '@elemental-ui/core';
import { TranslateModule } from '@ngx-translate/core';
import { MatListModule } from '@angular/material/list';

import { BulkPropertyEditorModule, CdrModule, DataSourceToolbarModule, DataTableModule } from 'qbm';
import { JustificationModule } from 'qer';
import { PolicyViolationsComponent } from './policy-violations.component';
import { PolicyViolationsActionComponent } from './policy-violations-action/policy-violations-action.component';
import { PolicyViolationsActionMultiActionComponent } from './policy-violations-action/policy-violations-action-multi-action/policy-violations-action-multi-action.component';
import { PolicyViolationsActionSingleActionComponent } from './policy-violations-action/policy-violations-action-single-action/policy-violations-action-single-action.component';
import { PolicyViolationsSidesheetComponent } from './policy-violations-sidesheet/policy-violations-sidesheet.component';

@NgModule({
  declarations: [
    PolicyViolationsComponent,
    PolicyViolationsActionComponent,
    PolicyViolationsActionMultiActionComponent,
    PolicyViolationsActionSingleActionComponent,
    PolicyViolationsSidesheetComponent
  ],
  imports: [
    EuiCoreModule,
    MatButtonModule,
    MatCardModule,
    MatListModule,
    CommonModule,
    TranslateModule,
    ReactiveFormsModule,
    BulkPropertyEditorModule,
    CdrModule,
    JustificationModule,
    DataTableModule,
    DataSourceToolbarModule
  ],
  exports: [PolicyViolationsComponent]
})
export class PolicyViolationsModule { }
