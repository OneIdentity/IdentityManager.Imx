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

import { DragDropModule } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatRippleModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { EuiCoreModule, EuiMaterialModule } from '@elemental-ui/core';
import { TranslateModule } from '@ngx-translate/core';
import { DataTableModule } from '../data-table/data-table.module';
import { BusyIndicatorModule } from './../busy-indicator/busy-indicator.module';
import { DataViewAutoTableComponent } from './data-view-auto-table/data-view-auto-table.component';
import { DataViewChipbarComponent } from './data-view-chipbar/data-view-chipbar.component';
import { DataViewFilterComponent } from './data-view-filter/data-view-filter.component';
import { DataViewGroupComponent } from './data-view-group/data-view-group.component';
import { DataViewNestedTableComponent } from './data-view-nested-table/data-view-nested-table.component';
import { DataViewPaginatorComponent } from './data-view-paginator/data-view-paginator.component';
import { DataViewSearchComponent } from './data-view-search/data-view-search.component';
import { DataViewSelectionComponent } from './data-view-selection/data-view-selection.component';
import { DataViewSettingsComponent } from './data-view-settings/data-view-settings.component';
import { DataViewStatusComponent } from './data-view-status/data-view-status.component';
import { DataViewToolbarComponent } from './data-view-toolbar/data-view-toolbar.component';
@NgModule({
  declarations: [
    DataViewAutoTableComponent,
    DataViewPaginatorComponent,
    DataViewSearchComponent,
    DataViewToolbarComponent,
    DataViewChipbarComponent,
    DataViewGroupComponent,
    DataViewNestedTableComponent,
    DataViewSettingsComponent,
    DataViewFilterComponent,
    DataViewSelectionComponent,
    DataViewStatusComponent,
  ],
  imports: [
    CommonModule,
    CommonModule,
    TranslateModule,
    FormsModule,
    ReactiveFormsModule,
    EuiCoreModule,
    EuiMaterialModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatButtonModule,
    MatPaginatorModule,
    MatTableModule,
    MatChipsModule,
    MatProgressBarModule,
    DragDropModule,
    MatSortModule,
    MatTabsModule,
    MatSelectModule,
    MatRippleModule,
    BusyIndicatorModule,
    DataTableModule,
  ],
  exports: [
    DataViewAutoTableComponent,
    DataViewPaginatorComponent,
    DataViewSearchComponent,
    DataViewToolbarComponent,
    DataViewChipbarComponent,
    DataViewGroupComponent,
    DataViewSettingsComponent,
    DataViewFilterComponent,
    DataViewSelectionComponent,
    DataViewStatusComponent,
  ],
})
export class DataViewModule {}
