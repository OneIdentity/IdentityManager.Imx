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

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatTabsModule } from '@angular/material/tabs';
import { EuiCoreModule } from '@elemental-ui/core';

import { CdrModule, LdsReplaceModule, QbmModule, RouteGuardService, TileModule } from 'qbm';
import { BusinessownerAddonTileModule } from '../businessowner-addon-tile/businessowner-addon-tile.module';
import { BusinessownerOverviewTileModule } from '../businessowner-overview-tile/businessowner-overview-tile.module';
import { PersonHyperviewComponent } from './person-hyperview/person-hyperview.component';
import { ObjectSheetModule } from '../object-sheet/object-sheet.module';
import { ObjectsheetPersonComponent } from './objectsheet-person.component';
import { ObjectsheetHeaderComponent } from './objectsheet-header.component';
import { PersonEntitlementsComponent } from './person-entitlements/person-entitlements.component';
import { PersonMasterDataComponent } from './person-masterdata/person-masterdata.component';
import { PersonRequestsComponent } from './person-requests/person-requests.component';

const routes: Routes = [
  {
    path: 'hyperview',
    component: PersonHyperviewComponent,
    canActivate: [RouteGuardService],
    resolve: [RouteGuardService],
  },
  {
    path: 'person/:UID/entitlements',
    component: PersonEntitlementsComponent,
    canActivate: [RouteGuardService],
    resolve: [RouteGuardService]
  },
  {
    path: 'person/:UID/requests',
    component: PersonRequestsComponent,
    canActivate: [RouteGuardService],
    resolve: [RouteGuardService]
  },
  {
    path: 'person/:UID/masterdata',
    component: PersonMasterDataComponent,
    canActivate: [RouteGuardService],
    resolve: [RouteGuardService]
  },
  {
    path: 'person/:UID/hyperview',
    component: PersonHyperviewComponent,
    canActivate: [RouteGuardService],
    resolve: [RouteGuardService]
  },
];

@NgModule({
  declarations: [
    PersonHyperviewComponent,
    ObjectsheetPersonComponent,
    ObjectsheetHeaderComponent,
    PersonEntitlementsComponent,
    PersonMasterDataComponent,
    PersonRequestsComponent
  ],
  imports: [
    CdrModule,
    CommonModule,
    EuiCoreModule,
    TranslateModule,
    ObjectSheetModule,
    BusinessownerAddonTileModule,
    BusinessownerOverviewTileModule,
    QbmModule,
    FormsModule,
    TileModule,
    MatButtonModule,
    MatDialogModule,
    MatTabsModule,
    LdsReplaceModule,
    RouterModule.forChild(routes),
  ]
})
export class ObjectsheetPersonModule { }
