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
 * Copyright 2021 One Identity LLC.
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
import { NgModule, APP_INITIALIZER, Inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  CdrModule,
  ClassloggerService,
  LdsReplaceModule,
  DataSourceToolbarModule,
  DataTableModule,
  DataTilesModule,
  QbmModule,
  RouteGuardService,
  TileModule,
  DataTreeModule,
  FkAdvancedPickerModule,
  AppConfigService,
} from 'qbm';
import { RouterModule, Routes } from '@angular/router';
import { EuiCoreModule, EuiMaterialModule } from '@elemental-ui/core';
import { TranslateModule } from '@ngx-translate/core';

import { BusinessOwnerChartSummaryComponent } from './wport/businessowner-chartsummary/businessowner-chartsummary.component';
import { DataExplorerViewModule } from './data-explorer-view/data-explorer-view.module';
import { ObjectOverviewPersonComponent } from './ops/objectOverviewPerson.component';
import { OpsModule } from './ops/ops.module';
import { QerService } from './qer.service';
import { PasscodeViewerComponent } from './ops/passcodeViewer.component';
import { ServiceItemsModule } from './service-items/service-items.module';
import { ServiceItemsService } from './service-items/service-items.service';
import { PatternItemsModule } from './pattern-item-list/pattern-items.module';
import { PatternItemService } from './pattern-item-list/pattern-item.service';
import { SourceDetectiveModule } from './sourcedetective/sourcedetective.module';
import { StarlingComponent } from './starling/starling.component';
import { StartComponent } from './wport/start/start.component';
import { TilesModule } from './tiles/tiles.module';
import { UserModule } from './user/user.module';
import { ShoppingCartValidationDetailModule } from './shopping-cart-validation-detail/shopping-cart-validation-detail.module';
import { RoleMembershipsModule } from './role-management/role-memberships/role-memberships.module';

export function initConfig(config: QerService): () => Promise<any> {
  return () =>
    new Promise<any>(async (resolve: any) => {
      if (config) {
        config.init();
      }
      resolve();
    });
}

const routes: Routes = [
  {
    path: 'dashboard',
    component: StartComponent,
    canActivate: [RouteGuardService],
    resolve: [RouteGuardService],
  },
];

// @dynamic
@NgModule({
  declarations: [StarlingComponent, StartComponent, BusinessOwnerChartSummaryComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    QbmModule,
    CdrModule,
    TranslateModule,
    FormsModule,
    ServiceItemsModule,
    PatternItemsModule,
    ReactiveFormsModule,
    EuiCoreModule,
    EuiMaterialModule,
    TileModule,
    TilesModule,
    UserModule,
    LdsReplaceModule,
    DataSourceToolbarModule,
    DataTableModule,
    DataTilesModule,
    DataTreeModule,
    SourceDetectiveModule,
    RoleMembershipsModule,
    ShoppingCartValidationDetailModule,
    FkAdvancedPickerModule,
    OpsModule,
    DataExplorerViewModule,
  ],
  exports: [StarlingComponent, PasscodeViewerComponent, ObjectOverviewPersonComponent],
  providers: [
    {
      provide: APP_INITIALIZER,
      useFactory: initConfig,
      deps: [QerService],
      multi: true,
    },
    ServiceItemsService,
    PatternItemService
  ],
})
export class QerModule {
  constructor(
    logger: ClassloggerService,
    private readonly config: AppConfigService,
    @Inject('environment') private readonly environment,
    @Inject('appConfigJson') private readonly appConfigJson
  ) {
    logger.info(this, '▶️ QerModule loaded');

    if (this.environment.appName === 'arc-app-certaccess') {
      this.config.initSynchronous(this.environment.clientUrl, this.appConfigJson);

      (async () => {
        await this.config.loadSchema();
      })();
    }
  }
}
