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
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatStepperModule } from '@angular/material/stepper';
import { TranslateModule } from '@ngx-translate/core';
import { EuiCoreModule } from '@elemental-ui/core';

import { DataSourceToolbarModule, DataTableModule, CdrModule, SelectedElementsModule, HelpContextualModule  } from 'qbm';

import { PickCategoryComponent } from './pick-category.component';
import { PickCategorySidesheetComponent } from './pick-category-sidesheet/pick-category-sidesheet.component';
import { PickCategorySelectIdentitiesComponent } from './pick-category-select-identities/pick-category-select-identities.component';
import { PickCategoryCreateComponent } from './pick-category-create/pick-category-create.component';


@NgModule({
  declarations: [
    PickCategoryComponent,
    PickCategorySidesheetComponent,
    PickCategorySelectIdentitiesComponent,
    PickCategoryCreateComponent,
  ],
  imports: [
    CommonModule,
    CdrModule,
    DataSourceToolbarModule,
    DataTableModule,
    EuiCoreModule,
    MatButtonModule,
    MatCardModule,
    MatDialogModule,
    MatSnackBarModule,
    MatStepperModule,
    ReactiveFormsModule,
    TranslateModule,
    SelectedElementsModule,
    HelpContextualModule,
  ]
})
export class PickCategoryModule { }
