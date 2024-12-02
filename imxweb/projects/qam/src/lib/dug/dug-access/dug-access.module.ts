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
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatRadioModule } from '@angular/material/radio';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatTreeModule } from '@angular/material/tree';
import { EuiCoreModule } from '@elemental-ui/core';
import { TranslateModule } from '@ngx-translate/core';
import { BusyIndicatorModule, DataSourceToolbarModule, DataTableModule, DataTreeModule } from 'qbm';
import { AssignedPermissionsComponent } from './assigned-permissions/assigned-permissions.component';
import { BoxIconComponent } from './box-icon/box-icon.component';
import { DugAccessComponent } from './dug-access.component';
import { EffectivePermissionComponent } from './effective-permission/effective-permission.component';
import { PermissionMemberComponent } from './effective-permission/permission-member/permission-member.component';

@NgModule({
  declarations: [
    DugAccessComponent,
    AssignedPermissionsComponent,
    EffectivePermissionComponent,
    PermissionMemberComponent,
    BoxIconComponent,
  ],
  imports: [
    CommonModule,
    DataTableModule,
    DataSourceToolbarModule,
    MatRadioModule,
    MatButtonModule,
    MatCardModule,
    MatTreeModule,
    MatIconModule,
    TranslateModule,
    FormsModule,
    EuiCoreModule,
    DataTreeModule,
    MatSidenavModule,
    BusyIndicatorModule,
  ],
  exports: [DugAccessComponent, BoxIconComponent],
})
export class DugAccessModule {}
