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
import { MatFormFieldModule } from '@angular/material/form-field';
import { EuiCoreModule, EuiMaterialModule } from '@elemental-ui/core';
import { TranslateModule } from '@ngx-translate/core';
import { ClassloggerModule } from '../../classlogger/classlogger.module';
import { LdsReplaceModule } from '../../lds-replace/lds-replace.module';
import { FilterWizardComponent } from './filter-wizard.component';
import { SqlWizardModule } from '../../sqlwizard/sqlwizard.module';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTabsModule } from '@angular/material/tabs';
import { PredefinedFilterComponent } from './predefined-filter/predefined-filter.component';
import { PredefinedFilterTreeComponent } from './predefined-filter-tree/predefined-filter-tree.component';
import { SidenavTreeModule } from '../../sidenav-tree/sidenav-tree.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DataSourceToolbarModule } from '../data-source-toolbar.module';

@NgModule({
  declarations: [FilterWizardComponent, PredefinedFilterComponent, PredefinedFilterTreeComponent],
  imports: [
    CommonModule,
    EuiCoreModule,
    EuiMaterialModule,
    MatFormFieldModule,
    MatCardModule,
    MatListModule,
    MatMenuModule,
    MatTooltipModule,
    MatTabsModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    LdsReplaceModule,
    ClassloggerModule,
    SqlWizardModule,
    SidenavTreeModule,
    DataSourceToolbarModule
  ],
  exports: [FilterWizardComponent],
})
export class FilterWizardModule {}
