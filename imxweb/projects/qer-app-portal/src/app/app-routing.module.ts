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

import { NgModule, InjectionToken } from '@angular/core';
import { Routes, RouterModule, ActivatedRouteSnapshot, Router } from '@angular/router';

import { LoginComponent, RouteGuardService } from 'qbm';
import {
  PasswordQueryComponent
} from 'qer';

const externalUrlProvider = new InjectionToken('externalUrlRedirectResolver');

const routes: Routes = [
  {
    path: 'externalRedirect',
    // We need a component here because we cannot define the route otherwise
    component: LoginComponent,
    canActivate: [RouteGuardService],
    resolve: {
      url: externalUrlProvider,
    }
  },
  {
    path: 'passwordquestions',
    component: PasswordQueryComponent,
    canActivate: [RouteGuardService],
    resolve: [RouteGuardService]
  },
  { path: '**', redirectTo: 'dashboard' }
];

@NgModule({
  imports: [RouterModule.forRoot([], { useHash: true, relativeLinkResolution: 'legacy' })],
  exports: [RouterModule],
  providers: [
    {
      provide: externalUrlProvider,
      useValue: (route: ActivatedRouteSnapshot) => {
        const externalUrl = route.paramMap.get('externalUrl');
        if (externalUrl && externalUrl.toLocaleLowerCase() !== 'undefined') {
          window.open(externalUrl, '_self');
        }
      }
    },
  ],

})
export class AppRoutingModule {
  constructor(
    private readonly router: Router) {

    const config = this.router.config;
    routes.forEach(route => {
      config.push(route);
    });
    this.router.resetConfig(config);
  }
}
