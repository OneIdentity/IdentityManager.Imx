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
import { FormsModule } from '@angular/forms';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { EuiCoreModule, EuiMaterialModule } from '@elemental-ui/core';
import { TranslateModule } from '@ngx-translate/core';
import { DataSourceToolbarModule, DataTableModule, SelectedElementsModule, LdsReplaceModule } from 'qbm';
import { DependenciesComponent } from './dependencies.component';
import { OutstandingComponent } from './outstanding.component';
import { OutstandingService } from './outstanding.service';
import { SelectedItemsComponent } from './selected-items/selected-items.component';

@NgModule({
  imports: [
    CommonModule,
    DataSourceToolbarModule,
    DataTableModule,
    EuiCoreModule,
    FormsModule,
    EuiMaterialModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    TranslateModule,
    SelectedElementsModule,
    LdsReplaceModule,
  ],
  providers: [
    OutstandingService
  ],
  declarations: [
    OutstandingComponent,
    DependenciesComponent,
    SelectedItemsComponent
  ]
})
export class OutstandingModule {
}
