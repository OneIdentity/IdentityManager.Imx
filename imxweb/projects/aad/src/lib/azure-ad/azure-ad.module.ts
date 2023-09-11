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
import { AzureAdService } from './azure-ad.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { EuiCoreModule, EuiMaterialModule } from '@elemental-ui/core';
import { CdrModule, DataSourceToolbarModule, DataTableModule } from 'qbm';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { AadUserSubscriptionsComponent } from './aad-user/aad-user-subscriptions.component';
import { AadUserCreateDialogComponent } from './aad-user/aad-user-create-dialog.component';
import { AadUserDeniedPlansComponent } from './aad-user/aad-user-denied-plans.component';
import { AadGroupSubscriptionsComponent } from './aad-group/aad-group-subscriptions.component';
import { AadGroupDeniedPlansComponent } from './aad-group/aad-group-denied-plans.component';
import { AadPermissionsService } from '../admin/aad-permissions.service';
import { LicenceOverviewButtonComponent } from '../aad-extension/licence-overview-button/licence-overview-button.component';

@NgModule({
  declarations: [
    AadUserSubscriptionsComponent,
    AadUserCreateDialogComponent,
    AadUserDeniedPlansComponent,
    AadGroupSubscriptionsComponent,
    AadGroupDeniedPlansComponent,
    LicenceOverviewButtonComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    EuiCoreModule,
    EuiMaterialModule,
    CdrModule,
    RouterModule,
    TranslateModule,
    DataSourceToolbarModule,
    DataTableModule,
  ],
  providers: [
    AzureAdService,
    AadPermissionsService
  ],
  exports: [
    AadUserSubscriptionsComponent,
    AadUserDeniedPlansComponent,
    AadGroupSubscriptionsComponent,
    AadGroupDeniedPlansComponent,
    LicenceOverviewButtonComponent
  ],
})
export class AzureAdModule {}
