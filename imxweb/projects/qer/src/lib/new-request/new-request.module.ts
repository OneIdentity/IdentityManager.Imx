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
import {
  CdrModule,
  ClassloggerService,
  DataSourceToolbarModule,
  DataTableModule,
  DataTilesModule,
  LdsReplaceModule,
  MenuItem,
  MenuService,
  SidenavTreeModule,
  QbmModule,
  BusyIndicatorModule,
  InfoModalDialogModule,
  HelpContextualModule,
} from 'qbm';

import { NewRequestRoutingModule } from './new-request-routing.module';
import { NewRequestComponent } from './new-request.component';
import { NewRequestHeaderComponent } from './new-request-header/new-request-header.component';
import { NewRequestContentComponent } from './new-request-content/new-request-content.component';
import { NewRequestRecipientsComponent } from './new-request-header/new-request-recipients/new-request-recipients.component';
import { TranslateModule } from '@ngx-translate/core';
import { EuiCoreModule, EuiMaterialModule } from '@elemental-ui/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NewRequestHeaderToolbarComponent } from './new-request-header/new-request-header-toolbar/new-request-header-toolbar.component';
import { NewRequestProductComponent } from './new-request-product/new-request-product.component';
import { NewRequestPeerGroupComponent } from './new-request-peer-group/new-request-peer-group.component';
import { NewRequestReferenceUserComponent } from './new-request-reference-user/new-request-reference-user.component';
import { NewRequestProductBundleComponent } from './new-request-product-bundle/new-request-product-bundle.component';
import { ProductDetailsSidesheetComponent } from './new-request-product/product-details-sidesheet/product-details-sidesheet.component';
import { ProductEntitlementsComponent } from './new-request-product/product-entitlements/product-entitlements.component';
import { ProductBundleListComponent } from './new-request-product-bundle/product-bundle-list/product-bundle-list.component';
import { ProductBundleItemsComponent } from './new-request-product-bundle/product-bundle-items/product-bundle-items.component';
import { NewRequestSelectedProductsComponent } from './new-request-selected-products/new-request-selected-products.component';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { NewRequestReferenceUserCardComponent } from './new-request-header/new-request-reference-user-card/new-request-reference-user-card.component';
import { ElementVisibilityDirective } from './element-visibility.directive';
import { PeerGroupDiscardSelectedComponent } from './new-request-peer-group/peer-group-discard-selected.component';
@NgModule({
  declarations: [
    NewRequestComponent,
    NewRequestHeaderComponent,
    NewRequestContentComponent,
    NewRequestRecipientsComponent,
    NewRequestHeaderToolbarComponent,
    NewRequestProductComponent,
    NewRequestPeerGroupComponent,
    NewRequestReferenceUserComponent,
    NewRequestProductBundleComponent,
    ProductDetailsSidesheetComponent,
    ProductEntitlementsComponent,
    ProductBundleListComponent,
    ProductBundleItemsComponent,
    NewRequestSelectedProductsComponent,
    NewRequestReferenceUserCardComponent,
    ElementVisibilityDirective,
    PeerGroupDiscardSelectedComponent,
  ],
  imports: [
    CommonModule,
    NewRequestRoutingModule,
    TranslateModule,
    BusyIndicatorModule,
    CdrModule,
    DataSourceToolbarModule,
    DataTableModule,
    DataTilesModule,
    SidenavTreeModule,
    EuiCoreModule,
    EuiMaterialModule,
    FormsModule,
    InfoModalDialogModule,
    LdsReplaceModule,
    ReactiveFormsModule,
    QbmModule,
    MatSortModule,
    MatTableModule,
    HelpContextualModule
  ],
  exports: [NewRequestComponent],
})
export class NewRequestModule {
  constructor(private readonly menuService: MenuService, logger: ClassloggerService) {
    logger.info(this, '▶️ NewRequestModule loaded');
    this.setupMenu();
  }


  private setupMenu(): void {
    this.menuService.addMenuFactories(
      (preProps: string[], features: string[]) => {

        const items: MenuItem[] = [];

        if (preProps.includes('ITSHOP')) {
          items.push(
            {
              id: 'QER_Requests_NewRequest_V2',
              route: 'newrequest',
              title: '#LDS#Menu Entry New request',
              sorting: '10-11',
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
