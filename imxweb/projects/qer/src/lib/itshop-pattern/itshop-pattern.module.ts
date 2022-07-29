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
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { EuiCoreModule, EuiMaterialModule } from '@elemental-ui/core';
import { TranslateModule } from '@ngx-translate/core';

import { ProjectConfig } from 'imx-api-qbm';
import { QerProjectConfig } from 'imx-api-qer';

import {
  CdrModule,
  ClassloggerService,
  DataSourceToolbarModule,
  DataTableModule,
  MenuItem,
  MenuService,
  RouteGuardService,
  UserMessageModule
} from 'qbm';
import { ItshopPatternComponent } from './itshop-pattern.component';
import { ItshopPatternSidesheetComponent } from './itshop-pattern-sidesheet/itshop-pattern-sidesheet.component';
import { ItshopPatternCreateSidesheetComponent } from './itshop-pattern-create-sidesheet/itshop-pattern-create-sidesheet.component';
import { ItshopPatternAddProductsComponent } from './itshop-pattern-add-products/itshop-pattern-add-products.component';
import { ServiceItemsModule } from '../service-items/service-items.module';
import { DuplicatePatternItemsComponent } from './duplicate-pattern-items/duplicate-pattern-items.component';
import { UserModule } from '../user/user.module';
import { ItshopPatternGuardService } from '../guards/itshop-pattern-guard.service';

const routes: Routes = [
  {
    path: 'itshop/requesttemplates',
    component: ItshopPatternComponent,
    canActivate: [RouteGuardService, ItshopPatternGuardService],
    resolve: [RouteGuardService]
  }
];

@NgModule({
  declarations: [
    ItshopPatternComponent,
    ItshopPatternSidesheetComponent,
    ItshopPatternCreateSidesheetComponent,
    ItshopPatternAddProductsComponent,
    DuplicatePatternItemsComponent
  ],
  imports: [
    CdrModule,
    CommonModule,
    DataSourceToolbarModule,
    DataTableModule,
    EuiCoreModule,
    EuiMaterialModule,
    FormsModule,
    ReactiveFormsModule,
    ServiceItemsModule,
    TranslateModule,
    RouterModule.forChild(routes),
    UserMessageModule,
    UserModule
  ]
})
export class ItshopPatternModule {

  constructor(
    private readonly menuService: MenuService,
    logger: ClassloggerService
  ) {
    logger.info(this, '▶️ ItshopPatternModule loaded');
    this.setupMenu();
  }

  private setupMenu(): void {
    this.menuService.addMenuFactories(
      (preProps: string[], groups: string[], projectConfig: QerProjectConfig & ProjectConfig) => {
        const items: MenuItem[] = [];
        const requestTemplatesEnabled = projectConfig.ITShopConfig.VI_ITShop_ProductSelectionFromTemplate;

        if (preProps.includes('ITSHOP') && requestTemplatesEnabled) {
          items.push(
            {
              id: 'QER_Request_RequestTemplates',
              navigationCommands: {
                commands: ['itshop', 'requesttemplates']
              },
              title: '#LDS#Menu Entry Request templates',
              sorting: '10-50',
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
      }
    );
  }
}
