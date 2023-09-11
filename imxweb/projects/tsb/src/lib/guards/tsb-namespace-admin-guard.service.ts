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

import { Injectable, OnDestroy } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable, Subscription } from 'rxjs';

import { AppConfigService, AuthenticationService, ISessionState } from 'qbm';
import { TsbPermissionsService } from '../admin/tsb-permissions.service';

@Injectable({
  providedIn: 'root',
})
export class TsbNamespaceAdminGuardService implements CanActivate, OnDestroy {
  private onSessionResponse: Subscription;

  constructor(
    private readonly authentication: AuthenticationService,
    private readonly permissionService: TsbPermissionsService,
    private readonly appConfig: AppConfigService,
    private readonly router: Router
  ) { }

  public canActivate(route: ActivatedRouteSnapshot, _: RouterStateSnapshot): Observable<boolean> {
    return new Observable<boolean>((observer) => {
      this.onSessionResponse = this.authentication.onSessionResponse.subscribe(async (sessionState: ISessionState) => {
        if (sessionState.IsLoggedIn) {
          // TODO Later: Berechtigungen sind noch nicht genau genug, non-admin-Pages lassen sich im Moment immer ansteuern
          const navigateToAdmin  = route.url[0].path === 'admin';
          const userIsAdmin = await this.permissionService.isTsbNameSpaceAdminBase();
          if (navigateToAdmin && !userIsAdmin) {
            this.router.navigate([this.appConfig.Config.routeConfig.start], { queryParams: {} });
          }

          observer.next(!navigateToAdmin || userIsAdmin);
          observer.complete();
        }
      });
    });
  }

  public ngOnDestroy(): void {
    if (this.onSessionResponse) {
      this.onSessionResponse.unsubscribe();
    }
  }
}
