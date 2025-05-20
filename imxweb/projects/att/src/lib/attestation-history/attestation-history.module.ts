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
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatMenuModule } from '@angular/material/menu';
import { MatTabsModule } from '@angular/material/tabs';
import { EuiCoreModule, EuiMaterialModule } from '@elemental-ui/core';
import { TranslateModule } from '@ngx-translate/core';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import {
  CdrModule,
  DataSourceToolbarModule,
  DataTableModule,
  DataViewModule,
  ExtModule,
  HelpContextualModule,
  SelectedElementsModule,
} from 'qbm';
import { ObjectHyperviewModule } from 'qer';
import { AttestationDisplayModule } from '../attestation-display/attestation-display.module';
import { AttestationSnapshotModule } from '../attestation-snapshot/attestation-snapshot.module';
import { AttestationDecisionModule } from '../decision/attestation-decision.module';
import { AttestationHistoryDetailsComponent } from './attestation-history-details/attestation-history-details.component';
import { AttestationHistoryFilterComponent } from './attestation-history-filter/attestation-history-filter.component';
import { AttestationHistoryWrapperComponent } from './attestation-history-wrapper.component';
import { AttestationHistoryComponent } from './attestation-history.component';
import { AttestationHistoryService } from './attestation-history.service';
import { MyAttestationCasesComponent } from './my-attestation-cases/my-attestation-cases.component';

@NgModule({
  declarations: [
    AttestationHistoryComponent,
    AttestationHistoryDetailsComponent,
    AttestationHistoryWrapperComponent,
    AttestationHistoryFilterComponent,
    MyAttestationCasesComponent,
  ],
  exports: [AttestationHistoryComponent],
  imports: [
    AttestationSnapshotModule,
    CommonModule,
    CdrModule,
    DataSourceToolbarModule,
    DataTableModule,
    ExtModule,
    MatButtonModule,
    MatCardModule,
    MatMenuModule,
    MatTabsModule,
    MatIconModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    EuiCoreModule,
    EuiMaterialModule,
    AttestationDecisionModule,
    AttestationDisplayModule,
    AttestationSnapshotModule,
    SelectedElementsModule,
    HelpContextualModule,
    ObjectHyperviewModule,
    DataViewModule,
  ],
  providers: [AttestationHistoryService],
})
export class AttestationHistoryModule {}
