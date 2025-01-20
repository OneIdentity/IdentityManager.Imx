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
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { EuiCoreModule, EuiMaterialModule } from '@elemental-ui/core';
import { TranslateModule } from '@ngx-translate/core';
import { BusyIndicatorModule } from '../../busy-indicator/busy-indicator.module';
import { ClassloggerModule } from '../../classlogger/classlogger.module';
import { ExtModule } from '../../ext/ext.module';
import { LdsReplaceModule } from '../../lds-replace/lds-replace.module';
import { CustomTreeControlComponent } from '../../sidenav-tree/custom-tree-control.component';
import { SqlWizardModule } from '../../sqlwizard/sqlwizard.module';
import { DataSourceToolbarModule } from '../data-source-toolbar.module';
import { FilterTreeSidesheetComponent } from './filter-tree-sidesheet/filter-tree-sidesheet.component';
import { FilterWizardComponent } from './filter-wizard.component';
import { PredefinedFilterTreeComponent } from './predefined-filter-tree/predefined-filter-tree.component';
import { PredefinedFilterComponent } from './predefined-filter/predefined-filter.component';

@NgModule({
  declarations: [FilterWizardComponent, PredefinedFilterComponent, PredefinedFilterTreeComponent, FilterTreeSidesheetComponent],
  imports: [
    CommonModule,
    EuiCoreModule,
    EuiMaterialModule,
    ExtModule,
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
    DataSourceToolbarModule,
    BusyIndicatorModule,
    CustomTreeControlComponent,
  ],
  exports: [FilterWizardComponent],
})
export class FilterWizardModule {}
