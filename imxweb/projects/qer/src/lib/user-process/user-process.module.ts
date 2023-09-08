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

import { NgModule } from "@angular/core";
import { UserProcessComponent } from "./user-process.component";
import { CommonModule } from "@angular/common";
import { DateModule, RouteGuardService } from "qbm";
import { EuiCoreModule, EuiMaterialModule } from "@elemental-ui/core";
import { TranslateModule } from "@ngx-translate/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { RouterModule, Routes } from "@angular/router";
import { MatCardModule } from "@angular/material/card";
import { MatTableModule } from "@angular/material/table";

const routes: Routes = [
  {
    path: 'userprocess',
    component: UserProcessComponent,
    canActivate: [RouteGuardService],
    resolve: [RouteGuardService]
  }
];

@NgModule({
  declarations: [
    UserProcessComponent
  ],
  imports: [
    CommonModule,
    EuiCoreModule,
    TranslateModule,
    FormsModule,
    RouterModule.forChild(routes),
    MatCardModule,
    MatTableModule,
    ReactiveFormsModule,
    EuiMaterialModule,
    DateModule,
  ],
  exports: [
    UserProcessComponent
  ],
})
export class UserProcessModule {}
