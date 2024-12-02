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
import { RouterModule, Routes } from '@angular/router';
import { EuiCoreModule, EuiMaterialModule } from '@elemental-ui/core';
import { TranslateModule } from '@ngx-translate/core';

import {
  CdrModule,
  DataSourceToolbarModule,
  DataTableModule,
  DataViewModule,
  DynamicTabsModule,
  ExtModule,
  HelpContextualModule,
  InfoModalDialogModule,
  LdsReplaceModule,
  RouteGuardService,
  SelectedElementsModule,
} from 'qbm';

import { MatTableModule } from '@angular/material/table';
import { UserModelService } from '../user/user-model.service';
import { PasswordQuestionsSidesheetComponent } from './password-questions-sidesheet/password-questions-sidesheet.component';
import { PasswordQuestionsComponent } from './password-questions.component';

const routes: Routes = [
  {
    path: 'password-questions',
    component: PasswordQuestionsComponent,
    canActivate: [RouteGuardService],
    resolve: [RouteGuardService],
  },
];

@NgModule({
  imports: [
    CdrModule,
    CommonModule,
    DataSourceToolbarModule,
    DataTableModule,
    DynamicTabsModule,
    EuiCoreModule,
    EuiMaterialModule,
    ExtModule,
    FormsModule,
    HelpContextualModule,
    InfoModalDialogModule,
    LdsReplaceModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes),
    SelectedElementsModule,
    TranslateModule,
    MatTableModule,
    DataViewModule,
  ],
  providers: [UserModelService],
  declarations: [PasswordQuestionsComponent, PasswordQuestionsSidesheetComponent],
  exports: [PasswordQuestionsComponent],
})
export class PasswordQuestionsModule {}
