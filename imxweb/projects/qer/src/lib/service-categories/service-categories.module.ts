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
  ClassloggerService,
  DataTreeWrapperModule,
  HELP_CONTEXTUAL,
  HelpContextualModule,
  MenuItem,
  MenuService,
  RouteGuardService
} from 'qbm';

import { ServiceCategoriesComponent } from './service-categories.component';
import { ServiceCategoryComponent } from './service-category.component';
import { ServiceItemsModule } from '../service-items/service-items.module';
import { isShopAdmin, isShopStatistics } from '../admin/qer-permissions-helper';
import { ShopGuardService } from '../guards/shop-guard.service';

const routes: Routes = [
  {
    path: 'configuration/servicecategories',
    component: ServiceCategoriesComponent,
    canActivate: [RouteGuardService, ShopGuardService],
    resolve: [RouteGuardService],
    data:{
      contextId: HELP_CONTEXTUAL.ServiceCategories
    }
  }
];

@NgModule({
  declarations: [
    ServiceCategoriesComponent,
    ServiceCategoryComponent
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
    ServiceItemsModule,
    HelpContextualModule,
  ]
})
export class ServiceCategoriesModule {

  constructor(
    private readonly menuService: MenuService,
    logger: ClassloggerService) {
    logger.info(this, '▶︝ ServiceCategoriesModule loaded');
    this.setupMenu();
  }

  private setupMenu(): void {
    this.menuService.addMenuFactories(
      (preProps: string[], features: string[]) => {

        const items: MenuItem[] = [];

        if (isShopAdmin(features) || isShopStatistics(features)) {
          items.push(
            {
              id: 'QER_Setup_Servicecategories',
              route: 'configuration/servicecategories',
              title: '#LDS#Menu Entry Service categories',
              sorting: '60-30'
            }
          );
        }

        if (items.length === 0) {
          return null;
        }
        return {
          id: 'ROOT_Setup',
          title: '#LDS#Setup',
          sorting: '60',
          items
        };
      },
    );
  }
}
