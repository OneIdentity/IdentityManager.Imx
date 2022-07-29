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
  MenuItem,
  MenuService,
  ParameterizedTextModule,
  QbmModule,
  RouteGuardService
} from 'qbm';

import { DefaultRequestDisplayComponent } from './request-display/default-request-display.component';
import { RequestActionComponent } from './request-action/request-action.component';
import { RequestDetailComponent } from './request-detail/request-detail.component';
import { RequestDisplayComponent } from './request-display/request-display.component';
import { RequestDisplayService } from './request-display/request-display.service';
import { RequestFilterComponent } from './requestfilter.component';
import { RequestHistoryComponent } from './request-history.component';
import { RequestHistoryService } from './request-history.service';
import { RequestTableComponent } from './request-table.component';
import { ItshopModule } from '../itshop/itshop.module';
import { RequestsFeatureGuardService } from '../requests-feature-guard.service';
import { JustificationModule } from '../justification/justification.module';

const routes: Routes = [
  {
    path: 'requesthistory',
    component: RequestHistoryComponent,
    canActivate: [RouteGuardService, RequestsFeatureGuardService],
    resolve: [RouteGuardService]
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
    TranslateModule
  ],
  declarations: [
    DefaultRequestDisplayComponent,
    RequestActionComponent,
    RequestDetailComponent,
    RequestDisplayComponent,
    RequestFilterComponent,
    RequestHistoryComponent,
    RequestTableComponent
  ],
  exports: [
    RequestDisplayComponent
  ],
  providers: [
    RequestDisplayService,
    RequestHistoryService
  ]
})
export class RequestHistoryModule {
  constructor(
    private readonly menuService: MenuService,
    logger: ClassloggerService
  ) {
    logger.info(this, '▶️ RequestHistoryModule loaded');
    this.setupMenu();
  }

  private setupMenu(): void {
    this.menuService.addMenuFactories(
      (preProps: string[], groups: string[]) => {

        const items: MenuItem[] = [];

        if (preProps.includes('ITSHOP')) {
          items.push(
            {
              id: 'QER_Request_RequestHistory',
              route: 'requesthistory',
              title: '#LDS#Menu Entry Request history',
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
