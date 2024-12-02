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
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTooltipModule } from '@angular/material/tooltip';
import { EuiCoreModule, EuiMaterialModule } from '@elemental-ui/core';
import { TranslateModule } from '@ngx-translate/core';

import { DragDropModule } from '@angular/cdk/drag-drop';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { LoggerModule } from 'ngx-logger';
import { AppConfigService } from '../appConfig/appConfig.service';
import { ClassloggerModule } from '../classlogger/classlogger.module';
import { DataTreeModule } from '../data-tree/data-tree.module';
import { LdsReplaceModule } from '../lds-replace/lds-replace.module';
import { AdditionalInfosComponent } from './additional-infos/additional-infos.component';
import { DataSourcePaginatorComponent } from './data-source-paginator.component';
import { DataSourceToolbarCustomComponent } from './data-source-toolbar-custom.component';
import { DataSourceToolbarComponent } from './data-source-toolbar.component';
import { FilterTreeComponent } from './filter-tree/filter-tree.component';
import { SaveConfigDialogComponent } from './save-config-dialog/save-config-dialog.component';

@NgModule({ declarations: [
        DataSourceToolbarComponent,
        DataSourcePaginatorComponent,
        DataSourceToolbarCustomComponent,
        FilterTreeComponent,
        AdditionalInfosComponent,
        SaveConfigDialogComponent,
    ],
    exports: [DataSourceToolbarComponent, DataSourcePaginatorComponent, DataSourceToolbarCustomComponent, FilterTreeComponent], imports: [CommonModule,
        EuiCoreModule,
        EuiMaterialModule,
        MatFormFieldModule,
        MatMenuModule,
        MatIconModule,
        MatTooltipModule,
        MatPaginatorModule,
        MatButtonToggleModule,
        MatChipsModule,
        MatListModule,
        MatCardModule,
        MatDividerModule,
        DragDropModule,
        TranslateModule,
        DataTreeModule,
        LdsReplaceModule,
        ClassloggerModule,
        ReactiveFormsModule,
        FormsModule,
        LoggerModule], providers: [AppConfigService, provideHttpClient(withInterceptorsFromDi())] })
export class DataSourceToolbarModule {}
