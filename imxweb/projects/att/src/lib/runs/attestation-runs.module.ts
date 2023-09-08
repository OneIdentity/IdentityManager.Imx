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
import { MatDialogModule } from '@angular/material/dialog';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { RouterModule } from '@angular/router';
import { EuiMaterialModule, EuiCoreModule } from '@elemental-ui/core';
import { TranslateModule } from '@ngx-translate/core';

import { DataSourceToolbarModule, DataTableModule, CdrModule, LdsReplaceModule, EntityColumnEditorComponent, SelectedElementsModule, HelpContextualModule, TempBillboardModule } from 'qbm';

import { RunsComponent } from './runs.component';
import { RunSidesheetComponent } from './run-sidesheet.component';
import { PendingApproversComponent } from './pending-approvers.component';
import { SendReminderMailComponent } from './send-reminder-mail.component';
import { ProgressComponent } from './progress/progress.component';
import { RunExtendComponent } from './run-extend/run-extend.component';
import { AttestationComponent } from './attestation/attestation.component';
import { AttestationHistoryModule } from '../attestation-history/attestation-history.module';
import { RunsGridComponent } from './runs-grid/runs-grid.component';
import { CaseChartComponent } from './case-chart/case-chart.component';
import { AttestationWrapperComponent } from './attestation/attestation-wrapper/attestation-wrapper.component';

@NgModule({
  declarations: [
    RunsComponent,
    RunSidesheetComponent,
    PendingApproversComponent,
    SendReminderMailComponent,
    ProgressComponent,
    RunExtendComponent,
    AttestationComponent,
    RunsGridComponent,
    CaseChartComponent,
    AttestationWrapperComponent,
  ],
  imports: [
    CommonModule,
    CdrModule,
    TranslateModule,
    DataSourceToolbarModule,
    DataTableModule,
    EuiCoreModule,
    EuiMaterialModule,
    FormsModule,
    RouterModule,
    MatButtonModule,
    MatDialogModule,
    MatProgressBarModule,
    MatSidenavModule,
    ReactiveFormsModule,
    LdsReplaceModule,
    AttestationHistoryModule,
    SelectedElementsModule,
    HelpContextualModule,
    TempBillboardModule,
  ],
  exports: [RunsComponent, RunsGridComponent, AttestationWrapperComponent],
})
export class AttestationRunsModule {}
