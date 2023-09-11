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
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';

import { LdsReplaceModule, QbmModule } from 'qbm';
import { PasscodeViewerComponent } from './passcodeViewer.component';
import { ObjectOverviewPersonComponent } from './objectOverviewPerson.component';
import { TranslateModule } from '@ngx-translate/core';
import { PasswordModule } from '../password/password.module';



@NgModule({
  declarations: [
    PasscodeViewerComponent,
    ObjectOverviewPersonComponent,
  ],
  imports: [
    CommonModule,
    TranslateModule,
    QbmModule,
    LdsReplaceModule,
    PasswordModule,
    MatButtonModule,
    MatDialogModule
  ],
  exports: [
    PasscodeViewerComponent,
    ObjectOverviewPersonComponent,
  ]
})
export class OpsModule { }
