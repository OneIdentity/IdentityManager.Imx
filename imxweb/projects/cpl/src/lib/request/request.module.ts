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
import { MatCardModule } from '@angular/material/card';
import { EuiCoreModule, EuiMaterialModule } from '@elemental-ui/core';
import { TranslateModule } from '@ngx-translate/core';
import { MatExpansionModule } from '@angular/material/expansion';

import { CdrModule, ClassloggerService, DataSourceToolbarModule, DataTableModule } from 'qbm';
import { JustificationModule } from 'qer';

import { MitigatingControlsRequestComponent } from './compliance-violation-details/edit-mitigating-controls/mitigating-controls-request/mitigating-controls-request.component';
import { EditMitigatingControlsComponent } from './compliance-violation-details/edit-mitigating-controls/edit-mitigating-controls.component';
import { WorkflowViolationDetailsComponent } from './workflow-violation-details/workflow-violation-details.component';
import { ComplianceViolationDetailsComponent } from './compliance-violation-details/compliance-violation-details.component';
import { RequestMitigatingControlFilterPipe } from './compliance-violation-details/edit-mitigating-controls/mitigating-controls-request/request-mitigating-control-filter.pipe';
import { MitigatingControlContainerModule } from '../mitigating-control-container/mitigating-control-container.module';

@NgModule({
  declarations: [
    MitigatingControlsRequestComponent,
    EditMitigatingControlsComponent,
    WorkflowViolationDetailsComponent,
    ComplianceViolationDetailsComponent,
    RequestMitigatingControlFilterPipe
  ],
  imports: [
    CdrModule,
    CommonModule,
    DataSourceToolbarModule,
    DataTableModule,
    EuiCoreModule,
    EuiMaterialModule,
    FormsModule,
    JustificationModule,
    MatCardModule,
    MatExpansionModule,
    ReactiveFormsModule,
    TranslateModule,
    MitigatingControlContainerModule
  ],
  exports: [MitigatingControlsRequestComponent]
})
export class RequestModule {
  constructor(logger: ClassloggerService) {
    logger.info(this, '▶️ RequestModule loaded');
  }
}
