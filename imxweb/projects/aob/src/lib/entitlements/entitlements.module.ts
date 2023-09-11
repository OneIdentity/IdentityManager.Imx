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
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatMenuModule } from '@angular/material/menu';
import { EuiCoreModule, EuiMaterialModule } from '@elemental-ui/core';
import { TranslateModule } from '@ngx-translate/core';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { MatDividerModule } from '@angular/material/divider';

import {
  ClassloggerModule,
  DataTilesModule,
  DataSourceToolbarModule,
  DataTableModule,
  DisableControlModule,
  QbmModule,
  LdsReplaceModule,
  CdrModule,
  SqlWizardModule,
  InfoModalDialogModule
} from 'qbm';
import { EntitlementsAddComponent } from './entitlement-add/entitlements-add.component';
import { EntitlementsComponent } from './entitlements.component';
import { EntitlementsService } from './entitlements.service';
import { AobUserModule } from '../user/user.module';
import { LifecycleActionsModule } from '../lifecycle-actions/lifecycle-actions.module';
import { EntitlementEditModule } from './entitlement-edit/entitlement-edit.module';
import { EntitlementDetailComponent } from './entitlement-detail/entitlement-detail.component';
import { SystemRoleConfigComponent } from './entitlement-add/system-role-config/system-role-config.component';
import { EntitlementEditAutoAddComponent } from './entitlement-edit-auto-add/entitlement-edit-auto-add.component';
import { MappedEntitlementsPreviewComponent } from './entitlement-edit-auto-add/mapped-entitlements-preview/mapped-entitlements-preview.component';

@NgModule({
  declarations: [
    EntitlementsAddComponent,
    EntitlementsComponent,
    EntitlementDetailComponent,
    SystemRoleConfigComponent,
    EntitlementEditAutoAddComponent,
    MappedEntitlementsPreviewComponent
  ],
  imports: [
    ClassloggerModule,
    CommonModule,
    DataSourceToolbarModule,
    DataTableModule,
    DataTilesModule,
    DisableControlModule,
    EuiCoreModule,
    EuiMaterialModule,
    EntitlementEditModule,
    FormsModule,
    LdsReplaceModule,
    MatBadgeModule,
    MatButtonToggleModule,
    MatCardModule,
    MatCheckboxModule,
    MatIconModule,
    MatRadioModule,
    MatTableModule,
    MatTooltipModule,
    MatButtonModule,
    MatDividerModule,
    MatFormFieldModule,
    MatSlideToggleModule,
    MatInputModule,
    MatMenuModule,
    QbmModule,
    ReactiveFormsModule,
    TranslateModule,
    AobUserModule,
    LifecycleActionsModule,
    CdrModule,
    ScrollingModule,
    SqlWizardModule,
    InfoModalDialogModule
  ],
  providers: [
    EntitlementsService
  ],
  exports: [
    EntitlementsComponent
  ],
})
export class EntitlementsModule { }
