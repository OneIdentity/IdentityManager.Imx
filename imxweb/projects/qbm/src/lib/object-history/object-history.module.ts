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
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { EuiCoreModule } from '@elemental-ui/core';
import { TranslateModule } from '@ngx-translate/core';
import { DataSourceToolbarModule } from '../data-source-toolbar/data-source-toolbar.module';
import { DataTableModule } from '../data-table/data-table.module';
import { ObjectHistoryGridviewComponent } from './object-history-gridview/object-history-gridview.component';
import { ObjectHistoryComponent } from './object-history.component';
import { ObjectHistoryStateComparisonComponent } from './object-history-state-comparison/object-history-state-comparison.component';
import { ObjectHistoryStateOverviewComponent } from './object-history-state-overview/object-history-state-overview.component';

import {MomentDateAdapter} from '@angular/material-moment-adapter';
 import {DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE} from '@angular/material/core';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { TimelineComponent } from '../timeline/timeline.component';

 export const EUI_DATE_FORMATS = {
   parse: {
     dateInput: ['LL', 'L'],
   },
   display: {
     dateInput: 'LL',
     monthYearLabel: 'MMM YYYY',
     dateA11yLabel: 'LL',
     monthYearA11yLabel: 'MMMM YYYY',
   },
 };

@NgModule({
  declarations: [
    ObjectHistoryGridviewComponent,
    ObjectHistoryComponent,
    ObjectHistoryStateComparisonComponent,
    ObjectHistoryStateOverviewComponent,
    TimelineComponent
  ],
  imports: [
    CommonModule,
    DataTableModule,
    DataSourceToolbarModule,
    EuiCoreModule,
    FormsModule,
    MatTabsModule,
    MatButtonModule,
    MatCardModule,
    MatTooltipModule,
    MatFormFieldModule,
    MatSelectModule,
    TranslateModule,
    MatTableModule,
    MatPaginatorModule,
    MatButtonToggleModule,
  ],
  providers: [
    {provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE]},
    {provide: MAT_DATE_FORMATS, useValue: EUI_DATE_FORMATS}
  ],
  exports: [
    ObjectHistoryComponent,
    ObjectHistoryGridviewComponent
  ]
})
export class ObjectHistoryModule {

}
