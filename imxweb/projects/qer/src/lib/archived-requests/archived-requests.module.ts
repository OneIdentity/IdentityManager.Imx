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

import {
  CdrModule,
  ClassloggerModule,
  ClassloggerService,
  DataSourceToolbarModule,
  DataTableModule,
  DateModule,
  HELP_CONTEXTUAL,
  HelpContextualModule,
  InfoButtonComponent,
  InfoModalDialogModule,
  MenuItem,
  MenuService,
  ParameterizedTextModule,
  QbmModule,
  RouteGuardService
} from 'qbm';

import { ItshopModule } from '../itshop/itshop.module';
import { RequestsFeatureGuardService } from '../requests-feature-guard.service';
import { JustificationModule } from '../justification/justification.module';
import { ArchivedRequestsComponent } from './archived-requests.component';
import {ArchivedRequestsService} from './archived-requests.service';
import { RequestHistoryModule } from '../request-history/request-history.module';
import { isShopAdmin } from '../admin/qer-permissions-helper';

const routes: Routes = [
  {
    path: 'archivedrequest',
    component: ArchivedRequestsComponent,
    canActivate: [RouteGuardService, RequestsFeatureGuardService],
    resolve: [RouteGuardService],
    data:{
      contextId: HELP_CONTEXTUAL.ArchivedRequest
    }
  }
];

@NgModule({
  imports: [
    CdrModule,
    ClassloggerModule,
    CommonModule,
    DataSourceToolbarModule,
    DataTableModule,
    DateModule,
    EuiCoreModule,
    EuiMaterialModule,
    ItshopModule,
    JustificationModule,
    QbmModule,
    ParameterizedTextModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes),
    TranslateModule,
    RequestHistoryModule,
    HelpContextualModule,
    InfoModalDialogModule
  ],
  declarations: [
    ArchivedRequestsComponent
  ],
  exports: [
    ArchivedRequestsComponent
  ],
  providers: [
    ArchivedRequestsService
  ]
})
export class ArchivedRequestsModule {
  constructor(
    private readonly menuService: MenuService,
    logger: ClassloggerService
  ) {
    logger.info(this, '▶️ ArchivedRequestsModule loaded');
    this.setupMenu();
  }

  private async setupMenu(): Promise<void> {
    this.menuService.addMenuFactories(
      (preProps: string[], features: string[]) => {

        const items: MenuItem[] = [];
        if (isShopAdmin(features)) {
          items.push(
            {
              id: 'QER_Request_ArchivedRequest',
              route: 'archivedrequest',
              title: '#LDS#Menu Entry Archived requests',
              sorting: '10-40',
            }
          );
        }

        if (items.length === 0) {
          return null;
        }
        return {
          id: 'ROOT_Request',
          title: '#LDS#Requests',
          sorting: '10',
          items
        };
      },
    );
  }
}

