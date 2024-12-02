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
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatListModule } from '@angular/material/list';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { EuiCoreModule, EuiMaterialModule } from '@elemental-ui/core';
import { TranslateModule } from '@ngx-translate/core';
import { MitigatingControlsComponent } from './mitigating-controls/mitigating-controls.component';

import { MatTableModule } from '@angular/material/table';
import {
  BulkPropertyEditorModule,
  CdrModule,
  DataSourceToolbarModule,
  DataTableModule,
  DataViewModule,
  HelpContextualModule,
  SelectedElementsModule,
} from 'qbm';
import { JustificationModule, ObjectHyperviewModule, StatisticsModule } from 'qer';
import { PolicyViolationsActionMultiActionComponent } from './policy-violations-action/policy-violations-action-multi-action/policy-violations-action-multi-action.component';
import { PolicyViolationsActionSingleActionComponent } from './policy-violations-action/policy-violations-action-single-action/policy-violations-action-single-action.component';
import { PolicyViolationsActionComponent } from './policy-violations-action/policy-violations-action.component';
import { PolicyViolationsSidesheetComponent } from './policy-violations-sidesheet/policy-violations-sidesheet.component';
import { PolicyViolationsComponent } from './policy-violations.component';

@NgModule({
  declarations: [
    PolicyViolationsComponent,
    PolicyViolationsActionComponent,
    PolicyViolationsActionMultiActionComponent,
    PolicyViolationsActionSingleActionComponent,
    PolicyViolationsSidesheetComponent,
    MitigatingControlsComponent,
  ],
  imports: [
    EuiCoreModule,
    EuiMaterialModule,
    MatButtonModule,
    MatCardModule,
    MatListModule,
    MatTabsModule,
    MatFormFieldModule,
    MatTooltipModule,
    CommonModule,
    TranslateModule,
    ReactiveFormsModule,
    BulkPropertyEditorModule,
    CdrModule,
    FormsModule,
    JustificationModule,
    DataTableModule,
    DataSourceToolbarModule,
    SelectedElementsModule,
    StatisticsModule,
    HelpContextualModule,
    ObjectHyperviewModule,
    DataViewModule,
    MatTableModule,
  ],
  exports: [PolicyViolationsComponent],
})
export class PolicyViolationsModule {}
