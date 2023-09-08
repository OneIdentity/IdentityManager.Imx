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
import { MatTreeModule } from '@angular/material/tree';
import { EuiCoreModule, EuiMaterialModule } from '@elemental-ui/core';
import { MatSidenavModule } from '@angular/material/sidenav';
import { SidenavTreeComponent } from './sidenav-tree.component';
import { TranslateModule } from '@ngx-translate/core';
import { DataSourceToolbarModule } from '../data-source-toolbar/data-source-toolbar.module';

@NgModule({
  declarations: [
    SidenavTreeComponent
  ],
  imports: [
    CommonModule,
    MatTreeModule,
    EuiCoreModule,
    EuiMaterialModule,
    MatSidenavModule,
    TranslateModule,
    DataSourceToolbarModule
  ],
  exports: [
    SidenavTreeComponent
  ]
})
export class SidenavTreeModule { }
