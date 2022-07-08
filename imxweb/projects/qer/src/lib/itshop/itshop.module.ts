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

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { TranslateModule } from '@ngx-translate/core';
import { MatListModule } from '@angular/material/list';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { ShelfSelectionComponent } from './shelf-selection.component';
import { CdrModule, DateModule, ExtModule, LdsReplaceModule } from 'qbm';
import { ItshopService } from './itshop.service';
import { DecisionHistoryComponent } from './request-info/decision-history.component';
import { RequestInfoComponent } from './request-info/request-info.component';
import { EuiCoreModule, EuiMaterialModule } from '@elemental-ui/core';
import { NonRequestableItemsComponent } from './non-requestable-items/non-requestable-items.component';
import { PeerGroupComponent } from './peer-group/peer-group.component';
import { ShelfService } from './shelf.service';

@NgModule({
  declarations: [
    DecisionHistoryComponent,
    RequestInfoComponent,
    ShelfSelectionComponent,
    NonRequestableItemsComponent,
    PeerGroupComponent
  ],
  exports: [
    RequestInfoComponent,
    PeerGroupComponent
  ],
  imports: [
    CdrModule,
    CommonModule,
    LdsReplaceModule,
    MatButtonModule,
    MatCardModule,
    MatListModule,
    TranslateModule,
    EuiCoreModule,
    EuiMaterialModule,
    FormsModule,
    ReactiveFormsModule,
    ExtModule,
    DateModule
  ],
  providers: [
    ItshopService,
    ShelfService
  ]
})
export class ItshopModule { }
