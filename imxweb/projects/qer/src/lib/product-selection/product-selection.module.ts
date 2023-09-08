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
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { EuiCoreModule, EuiMaterialModule } from '@elemental-ui/core';
import { TranslateModule } from '@ngx-translate/core';

import {
  ClassloggerModule,
  DataSourceToolbarModule,
  DataTableModule,
  DataTilesModule,
  DisableControlModule,
  QbmModule,
  LdsReplaceModule,
  CdrModule,
  BulkPropertyEditorModule,
  RouteGuardService,
  ClassloggerService,
  MenuService,
  MenuItem,
  DataTreeWrapperModule,
  HelpContextualModule,
  SelectedElementsModule,
  HELP_CONTEXTUAL
} from 'qbm';
import { ProductSelectionComponent } from './product-selection.component';
import { ServiceCategoryListComponent } from './servicecategory-list/servicecategory-list.component';
import { ProductSelectionService } from './product-selection.service';
import { ItshopModule } from '../itshop/itshop.module';
import { ServiceItemsModule } from '../service-items/service-items.module';
import { UserModule } from '../user/user.module';
import { ServiceItemEditComponent } from './service-item-edit/service-item-edit.component';
import { CategoryTreeComponent } from './servicecategory-list/category-tree.component';
import { RoleMembershipsComponent } from './role-memberships/role-memberships.component';
import { RequestsFeatureGuardService } from '../requests-feature-guard.service';
import { ProductDetailsSidesheetComponent } from './product-details-sidesheet/product-details-sidesheet.component';
import { PatternDetailsSidesheetComponent } from './pattern-details-sidesheet/pattern-details-sidesheet.component';
import { PatternItemsModule } from '../pattern-item-list/pattern-items.module';
import { OptionalItemsSidesheetComponent } from './optional-items-sidesheet/optional-items-sidesheet.component';

// const routes: Routes = [
//   {
//     path: 'productselection',
//     component: ProductSelectionComponent,
//     canActivate: [RouteGuardService, RequestsFeatureGuardService],
//     resolve: [RouteGuardService]
//   }
// ];
const routes: Routes = [
  {
    path: 'productselection',
    component: ProductSelectionComponent,
    canActivate: [RouteGuardService, RequestsFeatureGuardService],
    resolve: [RouteGuardService],
    data:{
      contextId: HELP_CONTEXTUAL.NewRequest
    }
  }
];

@NgModule({
    imports: [
        CommonModule,
        CdrModule,
        ClassloggerModule,
        DataSourceToolbarModule,
        DataTableModule,
        DataTilesModule,
        DataTreeWrapperModule,
        DisableControlModule,
        EuiCoreModule,
        EuiMaterialModule,
        FormsModule,
        LdsReplaceModule,
        ReactiveFormsModule,
        // RouterModule.forChild(routes),
        QbmModule,
        TranslateModule,
        ItshopModule,
        ServiceItemsModule,
        PatternItemsModule,
        UserModule,
        BulkPropertyEditorModule,
        HelpContextualModule,
        SelectedElementsModule
    ],
    declarations: [
        ProductSelectionComponent,
        ServiceCategoryListComponent,
        CategoryTreeComponent,
        ServiceItemEditComponent,
        RoleMembershipsComponent,
        ProductDetailsSidesheetComponent,
        PatternDetailsSidesheetComponent,
        OptionalItemsSidesheetComponent
    ],
    providers: [
        ProductSelectionService
    ]
})

/**
 * @deprecated Use NewRequestModule
 */
export class ProductSelectionModule {
  constructor(
    private readonly menuService: MenuService,
    logger: ClassloggerService
  ) {
    logger.info(this, '▶️ ProductSelectionModule loaded');
    // this.setupMenu();
  }

  private setupMenu(): void {
    this.menuService.addMenuFactories(
      (preProps: string[], features: string[]) => {

        const items: MenuItem[] = [];

        if (preProps.includes('ITSHOP')) {
          items.push(
            {
              id: 'QER_Requests_NewRequest',
              route: 'productselection',
              title: '#LDS#Menu Entry New request',
              sorting: '10-10',
            },
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
