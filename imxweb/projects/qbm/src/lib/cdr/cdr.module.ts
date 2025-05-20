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

import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSliderModule } from '@angular/material/slider';
import { MatTableModule } from '@angular/material/table';
import { TranslateModule } from '@ngx-translate/core';

import { EuiCoreModule } from '@elemental-ui/core';

import { ScrollingModule } from '@angular/cdk/scrolling';
import { MatCardModule } from '@angular/material/card';
import { MatTooltipModule } from '@angular/material/tooltip';
import { DataSourceToolbarModule } from '../data-source-toolbar/data-source-toolbar.module';
import { DataTableModule } from '../data-table/data-table.module';
import { DateModule } from '../date/date.module';
import { DisableControlModule } from '../disable-control/disable-control.module';
import { FkAdvancedPickerModule } from '../fk-advanced-picker/fk-advanced-picker.module';
import { FkHierarchicalDialogModule } from '../fk-hierarchical-dialog/fk-hierarchical-dialog.module';
import { ImageModule } from '../image/image.module';
import { InfoModalDialogModule } from '../info-modal-dialog/info-modal-dialog.module';
import { LdsReplaceModule } from '../lds-replace/lds-replace.module';
import { NumberFormatPipe } from '../number/number-format.pipe';
import { CdrEditorComponent } from './cdr-editor/cdr-editor.component';
import { CdrSidesheetComponent } from './cdr-sidesheet/cdr-sidesheet.component';
import { DateRangeComponent } from './date-range/date-range.component';
import { EditBinaryComponent } from './edit-binary/edit-binary.component';
import { EditBitmaskComponent } from './edit-bitmask/edit-bitmask.component';
import { EditBooleanComponent } from './edit-boolean/edit-boolean.component';
import { EditDateComponent } from './edit-date/edit-date.component';
import { EditDefaultComponent } from './edit-default/edit-default.component';
import { EditFkMultiComponent } from './edit-fk/edit-fk-multi.component';
import { EditFkComponent } from './edit-fk/edit-fk.component';
import { EditImageComponent } from './edit-image/edit-image.component';
import { EditLimitedValueComponent } from './edit-limited-value/edit-limited-value.component';
import { EditMultiLimitedValueComponent } from './edit-multi-limited-value/edit-multi-limited-value.component';
import { EditMultiValueComponent } from './edit-multi-value/edit-multi-value.component';
import { EditMultilineComponent } from './edit-multiline/edit-multiline.component';
import { EditNumberComponent } from './edit-number/edit-number.component';
import { EditRiskIndexComponent } from './edit-risk-index/edit-risk-index.component';
import { EditUrlComponent } from './edit-url/edit-url.component';
import { EntityColumnEditorComponent } from './entity-column-editor/entity-column-editor.component';
import { PropertyViewerComponent } from './property-viewer/property-viewer.component';
import { ViewPropertyDefaultComponent } from './view-property-default/view-property-default.component';
import { ViewPropertyComponent } from './view-property/view-property.component';

@NgModule({
  declarations: [
    EditDefaultComponent,
    CdrEditorComponent,
    EditBooleanComponent,
    EditMultilineComponent,
    EditNumberComponent,
    EditLimitedValueComponent,
    EditMultiValueComponent,
    EditMultiLimitedValueComponent,
    EditBinaryComponent,
    EditBitmaskComponent,
    EditDateComponent,
    PropertyViewerComponent,
    EditImageComponent,
    EditFkMultiComponent,
    EditFkComponent,
    EditRiskIndexComponent,
    ViewPropertyDefaultComponent,
    ViewPropertyComponent,
    DateRangeComponent,
    EntityColumnEditorComponent,
    EditUrlComponent,
    CdrSidesheetComponent,
  ],
  imports: [
    CommonModule,
    EuiCoreModule,
    FormsModule,
    InfoModalDialogModule,
    LdsReplaceModule,
    MatAutocompleteModule,
    MatButtonModule,
    MatInputModule,
    MatSelectModule,
    MatCardModule,
    MatCheckboxModule,
    MatDatepickerModule,
    MatDialogModule,
    MatFormFieldModule,
    MatSliderModule,
    MatSlideToggleModule,
    MatTableModule,
    MatTooltipModule,
    MatPaginatorModule,
    MatRadioModule,
    MatProgressSpinnerModule,
    ScrollingModule,
    ReactiveFormsModule,
    TranslateModule,
    DisableControlModule,
    DataSourceToolbarModule,
    DataTableModule,
    FkAdvancedPickerModule,
    FkHierarchicalDialogModule,
    DateModule,
    ImageModule,
    NumberFormatPipe,
  ],
  exports: [
    CdrEditorComponent,
    EditDefaultComponent,
    EditBooleanComponent,
    EditMultilineComponent,
    EditNumberComponent,
    EditLimitedValueComponent,
    EditMultiValueComponent,
    EditMultiLimitedValueComponent,
    PropertyViewerComponent,
    EntityColumnEditorComponent,
    CdrSidesheetComponent,
  ],
})
export class CdrModule {}
