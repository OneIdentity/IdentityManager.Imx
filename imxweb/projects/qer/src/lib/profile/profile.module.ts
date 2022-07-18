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
 * Copyright 2022 One Identity LLC.
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
import { RouterModule, Routes } from '@angular/router';
import { EuiCoreModule, EuiMaterialModule } from '@elemental-ui/core';
import { TranslateModule } from '@ngx-translate/core';

import { CdrModule, DataSourceToolbarModule, DataTableModule, DynamicTabsModule, ExtModule, LdsReplaceModule, RouteGuardService, TileModule } from 'qbm';
import { BusinessownerAddonTileModule } from '../businessowner-addon-tile/businessowner-addon-tile.module';
import { MailSubscriptionsComponent } from './mailsubscriptions.component';
import { MailSubscriptionService } from './mailsubscription.service';
import { IdentitySelectComponent } from './identity-select/identity-select.component';
import { PasswordQuestionsComponent } from './password-questions/password-questions.component';
import { CreatePasswordQuestionComponent } from './password-questions/create-password-question.component';
import { ProfileComponent } from './profile.component';

const routes: Routes = [
  {
    path: 'profile',
    component: ProfileComponent,
    canActivate: [RouteGuardService],
    resolve: [RouteGuardService]
  },
  {
    path: 'profile/:id',
    component: ProfileComponent,
    canActivate: [RouteGuardService],
    resolve: [RouteGuardService]
  }
];

@NgModule({
  imports: [
    BusinessownerAddonTileModule,
    CommonModule,
    CdrModule,
    TranslateModule,
    DataSourceToolbarModule,
    DataTableModule,
    ExtModule,
    FormsModule,
    RouterModule.forChild(routes),
    ReactiveFormsModule,
    TileModule,
    LdsReplaceModule,
    EuiCoreModule,
    EuiMaterialModule,
    DynamicTabsModule
  ],
  providers: [
    MailSubscriptionService
  ],
  declarations: [
    ProfileComponent,
    MailSubscriptionsComponent,
    IdentitySelectComponent,
    PasswordQuestionsComponent,
    CreatePasswordQuestionComponent
  ],
  exports: [
    ProfileComponent
  ]
})
export class ProfileModule { }
