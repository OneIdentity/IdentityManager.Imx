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
 * Copyright 2022 One Identity LLC.
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
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialogModule } from '@angular/material/dialog';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { TranslateModule } from '@ngx-translate/core';
import { EuiCoreModule } from '@elemental-ui/core';

import { LdsReplaceModule, DataTableModule, DataSourceToolbarModule, DataTilesModule, FkAdvancedPickerModule } from 'qbm';
import { ServiceitemListComponent } from './serviceitem-list/serviceitem-list.component';
import { ServiceItemInfoComponent } from './service-item-info/service-item-info.component';
import { ServiceItemSelectComponent } from './service-item-select/service-item-select.component';
import { ServiceItemsSelectorComponent } from './service-items-selector/service-items-selector.component';
import { ItshopModule } from '../itshop/itshop.module';

@NgModule({
  declarations: [
    ServiceitemListComponent,
    ServiceItemInfoComponent,
    ServiceItemSelectComponent,
    ServiceItemsSelectorComponent
  ],
  exports: [
    ServiceitemListComponent,
    ServiceItemSelectComponent
  ],
  imports: [
    CommonModule,
    DataSourceToolbarModule,
    DataTableModule,
    DataTilesModule,
    EuiCoreModule,
    FkAdvancedPickerModule,
    FormsModule,
    ItshopModule,
    LdsReplaceModule,
    MatButtonModule,
    MatCheckboxModule,
    MatDialogModule,
    MatListModule,
    MatChipsModule,
    MatIconModule,
    MatProgressBarModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatFormFieldModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule
  ]
})
export class ServiceItemsModule { }
