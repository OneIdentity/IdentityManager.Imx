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
import { RouterModule, Routes } from '@angular/router';
import { HELP_CONTEXTUAL, RouteGuardService } from 'qbm';
import { RequestsFeatureGuardService } from '../requests-feature-guard.service';
import { NewRequestComponent } from './new-request.component';
import { NewRequestPeerGroupComponent } from './new-request-peer-group/new-request-peer-group.component';
import { NewRequestProductComponent } from './new-request-product/new-request-product.component';
import { NewRequestReferenceUserComponent } from './new-request-reference-user/new-request-reference-user.component';
import { NewRequestProductBundleComponent } from './new-request-product-bundle/new-request-product-bundle.component';

const routes: Routes = [
  {
    path: 'newrequest',
    component: NewRequestComponent,
    canActivate: [RouteGuardService, RequestsFeatureGuardService],
    resolve: [RouteGuardService],
    children: [
      {
        path: 'allProducts',
        component: NewRequestProductComponent,
        canActivate: [RouteGuardService],
        resolve: [RouteGuardService],
      },
      {
        path: 'productsByPeerGroup',
        component: NewRequestPeerGroupComponent,
        canActivate: [RouteGuardService],
        resolve: [RouteGuardService],
      },
      {
        path: 'productsByReferenceUser',
        component: NewRequestReferenceUserComponent,
        canActivate: [RouteGuardService],
        resolve: [RouteGuardService],
      },
      { path: 'selectReferenceUser', redirectTo: 'productsByReferenceUser', pathMatch: 'full' },
      {
        path: 'productBundles',
        component: NewRequestProductBundleComponent,
        canActivate: [RouteGuardService],
        resolve: [RouteGuardService],
      },
      {
        path: '',
        redirectTo: 'allProducts',
        pathMatch: 'full',
      },
    ],
    data:{
      contextId: HELP_CONTEXTUAL.NewRequest
    }
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class NewRequestRoutingModule {}
