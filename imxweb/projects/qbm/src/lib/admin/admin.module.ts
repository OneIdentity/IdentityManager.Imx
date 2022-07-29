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

import { DragDropModule } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialogModule } from '@angular/material/dialog';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTreeModule } from '@angular/material/tree';
import { EuiCoreModule, EuiMaterialModule } from '@elemental-ui/core';
import { TranslateModule } from '@ngx-translate/core';
import { DataSourceToolbarModule } from '../data-source-toolbar/data-source-toolbar.module';
import { LdsReplaceModule } from '../lds-replace/lds-replace.module';
import { ConfigService } from './config.service';
import { ConfigComponent } from './config.component';
import { DashboardComponent } from './dashboard.component';
import { ListSettingComponent } from './list-setting.component';
import { StatusComponent } from './status.component';
import { FormsModule } from '@angular/forms';
import { SelectValueComponent } from './select-value.component';
import { ApplyConfigSidesheetComponent } from './apply-config-sidesheet.component';
import { ConfigKeyPathComponent } from './config-key-path.component';
import { PackagesComponent } from './packages.component';
import { AddConfigSidesheetComponent } from './add-config-sidesheet.component';
import { ConvertConfigSidesheetComponent } from './convert-config-sidesheet.component';

@NgModule({
    imports: [
        CommonModule,
        DataSourceToolbarModule,
        DragDropModule,
        EuiCoreModule,
        EuiMaterialModule,
        FormsModule,
        LdsReplaceModule,
        MatButtonModule,
        MatBadgeModule,
        MatCheckboxModule,
        MatDialogModule,
        MatExpansionModule,
        MatIconModule,
        MatTooltipModule,
        MatSelectModule,
        MatSidenavModule,
        MatProgressSpinnerModule,
        MatTreeModule,
        TranslateModule
    ],
    providers: [
        ConfigService
    ],
    declarations: [
        AddConfigSidesheetComponent,
        ApplyConfigSidesheetComponent,
        ConvertConfigSidesheetComponent,
        ConfigComponent,
        ConfigKeyPathComponent,
        ListSettingComponent,
        DashboardComponent,
        PackagesComponent,
        SelectValueComponent,
        StatusComponent
    ]
})
export class AdminModule {
}