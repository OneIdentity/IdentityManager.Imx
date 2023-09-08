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
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatRadioModule } from '@angular/material/radio';
import { MatDialogModule } from '@angular/material/dialog';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatMenuModule } from '@angular/material/menu';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { EuiCoreModule, EuiMaterialModule } from '@elemental-ui/core';
import { TranslateModule } from '@ngx-translate/core';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { LdsReplaceModule, DataSourceToolbarModule, DataTableModule, CdrModule, ClassloggerModule, HelpContextualModule } from 'qbm';
import { UserModule, StatisticsModule } from 'qer';
import { EditNameComponent } from './editors/edit-name.component';
import { EditGenericComponent } from './editors/edit-generic.component';
import { EditOriginComponent } from './editors/edit-origin.component';
import { EditThresholdComponent } from './editors/edit-threshold.component';
import { EditUintComponent } from './editors/edit-uint.component';
import { EditMasterDataComponent } from './edit-master-data/edit-master-data.component';
import { PolicyService } from './policy.service';
import { AttestationCasesComponent } from './attestation-cases/attestation-cases.component';
import { FilterEditorComponent } from './editors/filter-editor.component';
import { ConfirmDeactivationComponent } from './confirm-deactivation/confirm-deactivation.component';
import { PolicyFilterElementComponent } from './policy-filter-element/policy-filter-element.component';
import { PolicyEditorComponent } from './policy-editor/policy-editor.component';
import { PolicyListComponent } from './policy-list/policy-list.component';
import { SelectedObjectsComponent } from './selected-objects/selected-objects.component';
import { PolicyDetailsComponent } from './policy-details/policy-details.component';
import { AttestationRunsModule } from '../runs/attestation-runs.module';


@NgModule({
    imports: [
        CdrModule,
        CommonModule,
        DataSourceToolbarModule,
        DataTableModule,
        EuiCoreModule,
        EuiMaterialModule,
        FormsModule,
        LdsReplaceModule,
        MatExpansionModule,
        MatTooltipModule,
        MatInputModule,
        MatButtonModule,
        MatDialogModule,
        MatRadioModule,
        MatProgressSpinnerModule,
        MatCheckboxModule,
        MatSlideToggleModule,
        MatMenuModule,
        ReactiveFormsModule,
        TranslateModule,
        UserModule,
        ClassloggerModule,
        AttestationRunsModule,
        LdsReplaceModule,
        StatisticsModule,
        HelpContextualModule,
    ],
    declarations: [
        EditGenericComponent,
        EditNameComponent,
        EditOriginComponent,
        EditMasterDataComponent,
        EditThresholdComponent,
        EditUintComponent,
        PolicyEditorComponent,
        PolicyListComponent,
        SelectedObjectsComponent,
        AttestationCasesComponent,
        FilterEditorComponent,
        ConfirmDeactivationComponent,
        PolicyFilterElementComponent,
        PolicyDetailsComponent
    ],
    providers: [
        PolicyService
    ],
    exports: [
        PolicyListComponent,
        EditMasterDataComponent,
        AttestationCasesComponent
    ]
})
export class PolicyModule { }
