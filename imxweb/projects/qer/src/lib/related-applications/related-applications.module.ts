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

import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { EuiCoreModule, EuiMaterialModule } from '@elemental-ui/core';
import { TranslateModule } from '@ngx-translate/core';
import { RelatedApplicationsComponent } from './related-applications.component';
import { RelatedApplicationsSidesheetComponent } from './related-applications-sidesheet/related-applications-sidesheet.component';
import { ApplicationDetailsComponent } from './application-details/application-details.component';
import { CdrModule, ClassloggerService, DataTreeWrapperModule, ExtService, RouteGuardService } from 'qbm';
import { ApplicationDialogComponent } from './application-dialog/application-dialog.component';
import { RelatedApplicationsService } from './related-applications.service';
import { RelatedApplicationMenuItemComponent } from './related-application-menu-item/related-application-menu-item.component';

const routes: Routes = [
  {
    path: 'applications/relatedapplications',
    component: RelatedApplicationsComponent,
    canActivate: [RouteGuardService],
    resolve: [RouteGuardService]
  },{
    path: 'applicationdetails',
    component: ApplicationDetailsComponent,
    canActivate: [RouteGuardService],
    resolve: [RouteGuardService]
  }
];

@NgModule({
  declarations: [
    RelatedApplicationsComponent,
    RelatedApplicationsSidesheetComponent,
    ApplicationDetailsComponent,
    ApplicationDialogComponent,
    RelatedApplicationMenuItemComponent
  ],
  imports: [
    CdrModule,
    CommonModule,
    DataTreeWrapperModule,
    EuiCoreModule,
    EuiMaterialModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes),
    TranslateModule,
  ]
})
export class RelatedApplicationsModule {

  constructor(
    logger: ClassloggerService,
    private readonly extService: ExtService,
    ) {
    logger.info(this, '▶️ RelatedApplicationsModule loaded');
    this.extService.register('mastHead', { instance: RelatedApplicationMenuItemComponent});
  }

}
