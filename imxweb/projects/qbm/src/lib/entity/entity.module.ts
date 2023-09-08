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
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { EuiCoreModule, EuiMaterialModule } from '@elemental-ui/core';
import { TranslateModule } from '@ngx-translate/core';

import { EntityService } from './entity.service';
import { EntitySelectComponent } from './entity-select/entity-select.component';
import { TypedEntitySelectComponent } from './typed-entity-select/typed-entity-select.component';
import { TypedEntitySelectorComponent } from './typed-entity-select/typed-entity-selector/typed-entity-selector.component';
import { FkAdvancedPickerModule } from '../fk-advanced-picker/fk-advanced-picker.module';
import { FkTableSelectComponent } from './fk-table-select/fk-table-select.component';
import { DataTableModule } from '../data-table/data-table.module';
import { TypedEntityCandidateSidesheetComponent } from './typed-entity-candidate-sidesheet/typed-entity-candidate-sidesheet.component';
import { DataSourceToolbarModule } from '../data-source-toolbar/data-source-toolbar.module';

@NgModule({
  declarations: [
    EntitySelectComponent,
    TypedEntitySelectComponent,
    TypedEntitySelectorComponent,
    FkTableSelectComponent,
    TypedEntityCandidateSidesheetComponent
  ],
  exports: [
    EntitySelectComponent,
    TypedEntitySelectComponent
  ],
  imports: [
    CommonModule,
    EuiCoreModule,
    FormsModule,
    FkAdvancedPickerModule,
    EuiMaterialModule,
    ReactiveFormsModule,
    TranslateModule,
    DataTableModule,
    DataSourceToolbarModule

  ],
  providers: [
    EntityService
  ]
})
export class EntityModule { }
