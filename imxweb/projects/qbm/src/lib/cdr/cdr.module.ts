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
import { CommonModule } from '@angular/common';
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
import { MatSliderModule } from '@angular/material/slider';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTableModule } from '@angular/material/table';
import { TranslateModule } from '@ngx-translate/core';

import { EuiCoreModule } from '@elemental-ui/core';

import { CdrRegistryService } from './cdr-registry.service';
import { CdrEditorComponent } from './cdr-editor/cdr-editor.component';
import { EditBooleanComponent } from './edit-boolean/edit-boolean.component';
import { EditDefaultComponent } from './edit-default/edit-default.component';
import { EditMultilineComponent } from './edit-multiline/edit-multiline.component';
import { EditNumberComponent } from './edit-number/edit-number.component';
import { EditLimitedValueComponent } from './edit-limited-value/edit-limited-value.component';
import { EditMultiValueComponent } from './edit-multi-value/edit-multi-value.component';
import { EditMultiLimitedValueComponent } from './edit-multi-limited-value/edit-multi-limited-value.component';
import { EditBinaryComponent } from './edit-binary/edit-binary.component';
import { EditDateComponent } from './edit-date/edit-date.component';
import { PropertyViewerComponent } from './property-viewer/property-viewer.component';
import { DisableControlModule } from '../disable-control/disable-control.module';
import { EditImageComponent } from './edit-image/edit-image.component';
import { DataSourceToolbarModule } from '../data-source-toolbar/data-source-toolbar.module';
import { DataTableModule } from '../data-table/data-table.module';
import { EditFkMultiComponent } from './edit-fk/edit-fk-multi.component';
import { EditFkComponent } from './edit-fk/edit-fk.component';
import { LdsReplaceModule } from '../lds-replace/lds-replace.module';
import { FkAdvancedPickerModule } from '../fk-advanced-picker/fk-advanced-picker.module';
import { EditRiskIndexComponent } from './edit-risk-index/edit-risk-index.component';
import { ViewPropertyDefaultComponent } from './view-property-default/view-property-default.component';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { FkHierarchicalDialogModule } from '../fk-hierarchical-dialog/fk-hierarchical-dialog.module';
import { ViewPropertyComponent } from './view-property/view-property.component';
import { DateModule } from '../date/date.module';
import { DateRangeComponent } from './date-range/date-range.component';
import { ImageModule } from '../image/image.module';
import { EntityColumnEditorComponent } from './entity-column-editor/entity-column-editor.component';
import { EditUrlComponent } from './edit-url/edit-url.component';
import { CdrSidesheetComponent } from './cdr-sidesheet/cdr-sidesheet.component';
import { MatCardModule } from '@angular/material/card';
import { MatTooltipModule } from '@angular/material/tooltip';
import { InfoModalDialogModule } from '../info-modal-dialog/info-modal-dialog.module';

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
