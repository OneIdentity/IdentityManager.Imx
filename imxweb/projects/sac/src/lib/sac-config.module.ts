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
import { MatTabsModule } from '@angular/material/tabs';
import { TranslateModule } from '@ngx-translate/core';
import { InitService } from './init.service';
import { SapComplianceViolationComponent } from './sap-compliance-violation/sap-compliance-violation.component';
import { ClassloggerService, DataSourceToolbarModule, DataTableModule, DataTreeWrapperModule } from 'qbm';
import { EuiCoreModule, EuiMaterialModule } from '@elemental-ui/core';
import { SapComplianceViolationViewsByAbilityComponent } from './sap-compliance-violation/sap-compliance-violation-views-by-ability/sap-compliance-violation-views-by-ability.component';
import { SapComplianceViolationViewsByRoleComponent } from './sap-compliance-violation/sap-compliance-violation-views-by-role/sap-compliance-violation-views-by-role.component';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSortModule } from '@angular/material/sort';

@NgModule({
  declarations: [
    SapComplianceViolationComponent,
    SapComplianceViolationViewsByAbilityComponent,
    SapComplianceViolationViewsByRoleComponent,
  ],
  imports: [
    CommonModule,
    TranslateModule,
    EuiCoreModule,
    EuiMaterialModule,
    MatTabsModule,
    MatCardModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatSortModule,
    DataSourceToolbarModule,
    DataTableModule,
    DataTreeWrapperModule,
  ],
})
export class SacConfigModule {
  constructor(private readonly initservice: InitService, private readonly logger: ClassloggerService) {
    this.logger.info(this, '🔥 SAC loaded');
    this.initservice.onInit();
    this.logger.info(this, '▶️ SAC initialized');
  }
}
