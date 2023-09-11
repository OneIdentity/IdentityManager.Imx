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
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatToolbarModule } from '@angular/material/toolbar';
import { TranslateModule } from '@ngx-translate/core';

import { EuiCoreModule, EuiMaterialModule } from '@elemental-ui/core';

import { DataSourceToolbarModule } from '../data-source-toolbar/data-source-toolbar.module';
import { DataTableComponent } from './data-table.component';
import { DataTableColumnComponent } from './data-table-column.component';
import { DataTableGenericColumnComponent } from './data-table-generic-column.component';
import { DateModule } from '../date/date.module';
import { DataTableCellComponent } from './data-table-cell/data-table-cell.component';
import { DataTableDisplayCellComponent } from './data-table-display-cell/data-table-display-cell.component';
import { GroupPaginatorComponent } from './group-paginator/group-paginator.component';
import { ExcludedColumnsPipe } from './excluded-columns.pipe';
import { BusyIndicatorModule } from '../busy-indicator/busy-indicator.module';
import { TableAccessiblilityDirective } from './table-accessibility.directive';

@NgModule({
  declarations: [
    DataTableCellComponent,
    DataTableDisplayCellComponent,
    DataTableComponent,
    DataTableColumnComponent,
    DataTableGenericColumnComponent,
    GroupPaginatorComponent,
    ExcludedColumnsPipe,
    TableAccessiblilityDirective
  ],
  imports: [
    CommonModule,
    DataSourceToolbarModule,
    DateModule,
    EuiCoreModule,
    EuiMaterialModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatPaginatorModule,
    MatSortModule,
    MatTableModule,
    MatButtonModule,
    MatMenuModule,
    MatDividerModule,
    MatCardModule,
    MatToolbarModule,
    MatDialogModule,
    BusyIndicatorModule,
    TranslateModule
  ],
  exports: [DataTableComponent, DataTableColumnComponent, DataTableGenericColumnComponent, ExcludedColumnsPipe],
})
export class DataTableModule {}
