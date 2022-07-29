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

import { UserModelService } from 'qer';
import { Injectable, OnDestroy } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { AuthenticationService, ISessionState } from 'qbm';

@Injectable({
  providedIn: 'root',
})
export class AdminGuardService implements CanActivate, OnDestroy {
  private onSessionResponse: Subscription;

  constructor(
    private readonly userModelService: UserModelService,
    private readonly authentication: AuthenticationService,
    private readonly router: Router
  ) {}

  public canActivate(route: ActivatedRouteSnapshot, _: RouterStateSnapshot): Observable<boolean> {
    return new Observable<boolean>((observer) => {
      this.onSessionResponse = this.authentication.onSessionResponse.subscribe(async (sessionState: ISessionState) => {
        if (sessionState.IsLoggedIn) {
          const userGroups = await this.userModelService.getGroups();
          const userIsAdmin = userGroups.find((group) => {
            const groupName = group.Name ? group.Name.toUpperCase() : '';
            return groupName === 'SIM_4_OPAADMIN' ||
            groupName === 'SIM_BASEDATA_USERINTERFACE' ||
            groupName === 'VI_4_NAMESPACEADMIN_ADS' ||
            groupName === 'VI_4_ITSHOPADMIN_ADMIN' ||
            groupName === 'AAD_4_NAMESPACEADMIN_AZUREAD'
            ;
          });

          if (!userIsAdmin) {
            this.router.navigateByUrl('/dashboard');
          }

          observer.next(userIsAdmin ? true : false);
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
