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
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTreeModule } from '@angular/material/tree';
import { EuiCoreModule } from '@elemental-ui/core';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { TranslateModule } from '@ngx-translate/core';
import { MatDialogModule } from '@angular/material/dialog';
import { MatListModule } from '@angular/material/list';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatCardModule } from '@angular/material/card';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { FormsModule } from '@angular/forms';
import { MatSelectionListMultipleDirective } from './mat-selection-list-multiple-directive';

import { ClassloggerModule } from '../classlogger/classlogger.module';
import { DataTreeComponent } from './data-tree.component';
import { TreeSelectionListComponent } from './tree-selection-list/tree-selection-list.component';
import { CheckableTreeComponent } from './checkable-tree/checkable-tree.component';
import { DataTreeSearchResultsComponent } from './data-tree-search-results/data-tree-search-results.component';
import { BusyIndicatorModule } from '../busy-indicator/busy-indicator.module';


@NgModule({
  declarations: [
    DataTreeComponent,
    MatSelectionListMultipleDirective,
    TreeSelectionListComponent,
    CheckableTreeComponent,
    DataTreeSearchResultsComponent
  ],
  imports: [
    ClassloggerModule,
    CommonModule,
    FormsModule,
    EuiCoreModule,
    MatButtonModule,
    MatCheckboxModule,
    MatProgressBarModule,
    MatTreeModule,
    MatDialogModule,
    MatListModule,
    ScrollingModule,
    TranslateModule,
    MatPaginatorModule,
    MatCardModule,
    BusyIndicatorModule
  ],
  exports: [
    DataTreeComponent
  ]
})
export class DataTreeModule { }
