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
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { TranslateModule } from '@ngx-translate/core';
import { MatListModule } from '@angular/material/list';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { ShelfSelectionComponent } from './shelf-selection.component';
import { BusyIndicatorModule, CdrModule, DataSourceToolbarModule, DataTableModule, DateModule, ExtModule, LdsReplaceModule } from 'qbm';
import { ItshopService } from './itshop.service';
import { DecisionHistoryComponent } from './request-info/decision-history.component';
import { RequestInfoComponent } from './request-info/request-info.component';
import { EuiCoreModule, EuiMaterialModule } from '@elemental-ui/core';
import { NonRequestableItemsComponent } from './non-requestable-items/non-requestable-items.component';
import { PeerGroupComponent } from './peer-group/peer-group.component';
import { ShelfService } from './shelf.service';
import { ServiceItemDetailComponent } from './request-info/service-item-detail/service-item-detail.component';
import { ProductEntitlementsComponent } from './request-info/service-item-detail/product-entitlements/product-entitlements.component';
import { MatExpansionModule } from '@angular/material/expansion';
@NgModule({
  declarations: [
    DecisionHistoryComponent,
    RequestInfoComponent,
    ShelfSelectionComponent,
    NonRequestableItemsComponent,
    PeerGroupComponent,
    ServiceItemDetailComponent,
    ProductEntitlementsComponent
  ],
  exports: [
    RequestInfoComponent,
    PeerGroupComponent,
    ServiceItemDetailComponent,
    ProductEntitlementsComponent
  ],
  imports: [
    BusyIndicatorModule,
    CdrModule,
    CommonModule,
    LdsReplaceModule,
    MatButtonModule,
    MatCardModule,
    MatListModule,
    MatExpansionModule,
    TranslateModule,
    EuiCoreModule,
    EuiMaterialModule,
    FormsModule,
    ReactiveFormsModule,
    ExtModule,
    DateModule,
    DataTableModule,
    DataSourceToolbarModule
  ],
  providers: [
    ItshopService,
    ShelfService
  ],
})
export class ItshopModule { }
