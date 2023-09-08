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
import { RouterModule, Routes } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { EuiCoreModule, EuiMaterialModule } from '@elemental-ui/core';

import {
  CdrModule,
  DataSourceToolbarModule,
  DataTableModule,
  DataTreeWrapperModule,
  FkAdvancedPickerModule,
  HelpContextualModule,
  LdsReplaceModule,
  SidenavTreeModule
} from 'qbm';

import { CallsComponent } from './calls.component';
import { CallsSidesheetComponent } from './calls-sidesheet/calls-sidesheet.component';
import { CallsHistoryComponent } from './calls-history/calls-history.component';
import { CallsHistorySidesheetComponent } from './calls-history-sidesheet/calls-history-sidesheet.component';
import { CallsAttachmentComponent } from './calls-attachment/calls-attachment.component';
import { CallsAttachmentDialogComponent } from './calls-attachment/calls-attachment-dialog/calls-attachment-dialog.component';
@NgModule({
  declarations: [
    CallsComponent,
    CallsSidesheetComponent,
    CallsHistoryComponent,
    CallsHistorySidesheetComponent,
    CallsAttachmentComponent,
    CallsAttachmentDialogComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    EuiCoreModule,
    EuiMaterialModule,
    CdrModule,
    TranslateModule,
    DataSourceToolbarModule,
    DataTableModule,
    LdsReplaceModule,
    FkAdvancedPickerModule,
    SidenavTreeModule,
    DataTreeWrapperModule,
    HelpContextualModule,
  ]
})
export class CallsModule { }
