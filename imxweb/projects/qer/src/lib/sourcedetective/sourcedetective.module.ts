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
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatTreeModule } from '@angular/material/tree';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatCardModule } from '@angular/material/card';
import { EuiCoreModule, EuiMaterialModule } from '@elemental-ui/core';

import { QbmModule, LdsReplaceModule, ParameterizedTextModule, BusyIndicatorModule } from 'qbm';
import { SourceDetectiveComponent } from './sourcedetective.component';
import { SourceDetectiveSidesheetComponent } from './sourcedetective-sidesheet.component';
import { RequestHistoryModule } from '../request-history/request-history.module';

@NgModule({
  declarations: [
    SourceDetectiveComponent,
    SourceDetectiveSidesheetComponent
  ],
  imports: [
    CommonModule,
    QbmModule,
    BrowserAnimationsModule,
    EuiMaterialModule,
    EuiCoreModule,
    FormsModule,
    LdsReplaceModule,
    MatIconModule,
    BusyIndicatorModule,
    MatTooltipModule,
    MatTreeModule,
    TranslateModule,
    ParameterizedTextModule,
    RequestHistoryModule,
    MatCardModule
  ],
  exports: [
    SourceDetectiveComponent
  ]

})
export class SourceDetectiveModule { }
