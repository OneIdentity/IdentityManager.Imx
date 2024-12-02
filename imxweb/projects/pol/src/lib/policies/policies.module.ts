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
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { EuiCoreModule } from '@elemental-ui/core';
import { TranslateModule } from '@ngx-translate/core';
import { CdrModule, DataSourceToolbarModule, DataTableModule, DataViewModule, HelpContextualModule } from 'qbm';
import { ObjectHyperviewModule, StatisticsModule } from 'qer';
import { PolicyViolationsModule } from '../policy-violations/policy-violations.module';
import { MitigatingControlsPolicyComponent } from './mitigating-controls-policy/mitigating-controls-policy.component';
import { PoliciesSidesheetComponent } from './policies-sidesheet/policies-sidesheet.component';
import { PoliciesComponent } from './policies.component';

@NgModule({
  declarations: [PoliciesComponent, PoliciesSidesheetComponent, MitigatingControlsPolicyComponent],
  imports: [
    CommonModule,
    EuiCoreModule,
    TranslateModule,
    CdrModule,
    DataTableModule,
    DataSourceToolbarModule,
    MatButtonModule,
    MatCardModule,
    MatTabsModule,
    StatisticsModule,
    ObjectHyperviewModule,
    HelpContextualModule,
    PolicyViolationsModule,
    DataViewModule,
    MatTableModule,
  ],
})
export class PoliciesModule {}
