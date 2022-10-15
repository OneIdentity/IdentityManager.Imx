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

import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common'; import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { EuiCoreModule, EuiMaterialModule } from '@elemental-ui/core';
import { TranslateModule } from '@ngx-translate/core';

import {
  CdrModule,
  ClassloggerService,
  DataSourceToolbarModule,
  DataTableModule,
  FkAdvancedPickerModule,
  LdsReplaceModule,
  MenuItem,
  MenuService,
  RouteGuardService
} from 'qbm';

import { RequestsComponent } from './requests/requests.component';
import { RequestConfigSidesheetComponent } from './request-config-sidesheet/request-config-sidesheet.component';
import { RequestShelfSidesheetComponent } from './request-shelf-sidesheet/request-shelf-sidesheet.component';
import { RequestShelvesComponent } from './request-shelves/request-shelves.component';
import { RequestConfigMembersComponent } from './request-config-members/request-config-members.component';
import { RequestShelfEntitlementsComponent } from './request-shelf-entitlements/request-shelf-entitlements.component';
import { RequestsEntitySelectorComponent } from './requests-selector/requests-entity-selector.component';
import { DynamicExclusionDialogModule } from '../dynamic-exclusion-dialog/dynamic-exclusion-dialog.module';
import { MemberSelectorComponent } from './request-config-members/member-selector.component';
import { ShopAdminGuardService } from '../guards/shop-admin-guard.service';
import { isShopAdmin } from '../admin/qer-permissions-helper';
import { CREATE_SHELF_TOKEN } from './request-shelves/request-shelf-token';


const routes: Routes = [
  {
    path: 'configuration/requests',
    component: RequestsComponent,
    canActivate: [RouteGuardService, ShopAdminGuardService],
    resolve: [RouteGuardService]
  },
];

@NgModule({
  declarations: [
    MemberSelectorComponent,
    RequestsComponent,
    RequestConfigSidesheetComponent,
    RequestShelfSidesheetComponent,
    RequestShelvesComponent,
    RequestConfigMembersComponent,
    RequestShelfEntitlementsComponent,
    RequestsEntitySelectorComponent
  ],
  imports: [
    CommonModule,
    DynamicExclusionDialogModule,
    FormsModule,
    ReactiveFormsModule,
    EuiCoreModule,
    EuiMaterialModule,
    CdrModule,
    TranslateModule,
    DataSourceToolbarModule,
    DataTableModule,
    LdsReplaceModule,
    FkAdvancedPickerModule,
    RouterModule.forChild(routes),
  ],
  providers: [{provide: CREATE_SHELF_TOKEN, useValue: RequestShelfSidesheetComponent}],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class RequestConfigModule {

  constructor(
    private readonly menuService: MenuService,
    logger: ClassloggerService) {
    logger.info(this, '▶️ RequestConfigModule loaded');
    this.setupMenu();
  }

  private setupMenu(): void {
    this.menuService.addMenuFactories(
      (preProps: string[], groups: string[]) => {

        const items: MenuItem[] = [];

        if (isShopAdmin(groups)) {
          items.push(
            {
              id: 'QER_Setup_ITShop',
              route: 'configuration/requests',
              title: '#LDS#Menu Entry Shops',
              sorting: '50-20',
            },
          );
        }

        if (items.length === 0) {
          return null;
        }
        return {
          id: 'ROOT_Setup',
          title: '#LDS#Setup',
          sorting: '50',
          items
        };
      },
    );
  }
}
