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
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SqlWizardComponent } from './sqlwizard.component';
import { SimpleExpressionComponent } from './simple-expression.component';
import { CommonModule } from '@angular/common';
import { ColumnSelectionComponent } from './column-selection.component';
import { TableSelectionComponent } from './table-selection.component';
import { SingleExpressionComponent } from './single-expression.component';
import { WhereClauseExpressionComponent } from './where-clause-expression.component';
import { TranslateModule } from '@ngx-translate/core';
import { EuiCoreModule, EuiMaterialModule } from '@elemental-ui/core';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatOptionModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { SqlWizardService } from './sqlwizard.service';
import { MatListModule } from '@angular/material/list';
import { DatePickerComponent } from './date-picker.component';
import { MatRadioModule } from '@angular/material/radio';
import { SingleValueComponent } from './single-value.component';
import { CdrModule } from '../cdr/cdr.module';

@NgModule({
    imports: [
        CommonModule,
        CdrModule,
        EuiCoreModule,
        EuiMaterialModule,
        FormsModule,
        TranslateModule,
        ReactiveFormsModule,
        MatButtonModule,
        MatDatepickerModule,
        MatSelectModule,
        MatCheckboxModule,
        MatInputModule,
        MatListModule,
        MatFormFieldModule,
        MatOptionModule,
        MatRadioModule,
        MatSlideToggleModule,
        MatButtonToggleModule,
    ],
    declarations: [
        SqlWizardComponent,
        ColumnSelectionComponent,
        DatePickerComponent,
        SimpleExpressionComponent,
        SingleExpressionComponent,
        SingleValueComponent,
        TableSelectionComponent,
        WhereClauseExpressionComponent,
    ],
    providers: [
        SqlWizardService
    ],
    exports: [
        SqlWizardComponent,
    ]
})
export class SqlWizardModule {

}
