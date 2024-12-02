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
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';
import { EuiCoreModule, EuiMaterialModule } from '@elemental-ui/core';
import { TranslateModule } from '@ngx-translate/core';
import {
  BusyIndicatorModule,
  CdrModule,
  DataSourceToolbarModule,
  DataTableModule,
  DataViewModule,
  HelpContextualModule,
  SelectedElementsModule,
} from 'qbm';
import { ServiceItemsEditFormModule } from 'qer';
import { SoftwareMembershipsComponent } from './software-sidesheet/software-memberships/software-memberships.component';
import { SoftwareSidesheetComponent } from './software-sidesheet/software-sidesheet.component';
import { SoftwareComponent } from './software.component';

@NgModule({
  declarations: [SoftwareComponent, SoftwareSidesheetComponent, SoftwareMembershipsComponent],
  imports: [
    CommonModule,
    CdrModule,
    DataSourceToolbarModule,
    DataTableModule,
    TranslateModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    EuiCoreModule,
    EuiMaterialModule,
    MatTabsModule,
    BusyIndicatorModule,
    SelectedElementsModule,
    ServiceItemsEditFormModule,
    HelpContextualModule,
    DataViewModule,
  ],
})
export class SoftwareModule {}
