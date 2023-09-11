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
import { TranslateModule } from '@ngx-translate/core';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import { FormsModule } from '@angular/forms';
import { EuiCoreModule } from '@elemental-ui/core';

import { DataSourceToolbarModule } from '../data-source-toolbar/data-source-toolbar.module';
import { DataTableModule } from '../data-table/data-table.module';
import { FkAdvancedPickerComponent } from './fk-advanced-picker.component';
import { FkSelectorComponent } from './fk-selector.component';
import { ConfirmationModule } from '../confirmation/confirmation.module';
import { FkCandidatesComponent } from './fk-candidates/fk-candidates.component';
import { SelectedElementsModule } from '../selected-elements/selected-elements.module';

@NgModule({
  declarations: [FkAdvancedPickerComponent, FkSelectorComponent, FkCandidatesComponent],
  imports: [
    CommonModule,
    MatSelectModule,
    MatRadioModule,
    MatDialogModule,
    MatButtonModule,
    MatCardModule,
    FormsModule,
    DataSourceToolbarModule,
    TranslateModule,
    DataTableModule,
    EuiCoreModule,
    ConfirmationModule,
    SelectedElementsModule,
  ],
  exports: [FkAdvancedPickerComponent, FkSelectorComponent, FkCandidatesComponent],
})
export class FkAdvancedPickerModule {}
