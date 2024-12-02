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
  DynamicTabsModule,
  ExtModule,
  HelpContextualModule,
  InfoModalDialogModule,
  LdsReplaceModule,
  RouteGuardService,
  SelectedElementsModule,
  TileModule,
} from 'qbm';
import { BusinessownerAddonTileModule } from '../businessowner-addon-tile/businessowner-addon-tile.module';
import { ObjectHyperviewModule } from '../object-hyperview/object-hyperview.module';
import { PasswordQuestionsModule } from '../password-questions/password-questions.module';
import { UserModelService } from '../user/user-model.service';
import { IdentitySelectComponent } from './identity-select/identity-select.component';
import { MailSubscriptionService } from './mailsubscription.service';
import { MailSubscriptionsComponent } from './mailsubscriptions.component';
import { ProfileComponent } from './profile.component';
import { SecurityKeysSidesheetComponent } from './security-keys/security-keys-sidesheet/security-keys-sidesheet.component';
import { SecurityKeysComponent } from './security-keys/security-keys.component';

const routes: Routes = [
  {
    path: 'profile',
    component: ProfileComponent,
    canActivate: [RouteGuardService],
    resolve: [RouteGuardService],
  },
  {
    path: 'profile/:id',
    component: ProfileComponent,
    canActivate: [RouteGuardService],
    resolve: [RouteGuardService],
  },
];

@NgModule({
  imports: [
    BusinessownerAddonTileModule,
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
    ObjectHyperviewModule,
    PasswordQuestionsModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes),
    SelectedElementsModule,
    TileModule,
    TranslateModule,
  ],
  providers: [MailSubscriptionService, UserModelService],
  declarations: [
    ProfileComponent,
    MailSubscriptionsComponent,
    IdentitySelectComponent,
    SecurityKeysComponent,
    SecurityKeysSidesheetComponent,
  ],
  exports: [ProfileComponent],
})
export class ProfileModule {}
