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
import { CanActivate, Router } from '@angular/router';
import { Observable, Subscription } from 'rxjs';

import { AppConfigService, AuthenticationService, ISessionState, SystemInfoService } from 'qbm';
import { QerPermissionsService } from '../admin/qer-permissions.service';

@Injectable({
  providedIn: 'root',
})
export class DataExplorerGuardService implements CanActivate, OnDestroy {
  private onSessionResponse: Subscription;

  constructor(
    private readonly qerPermissionService: QerPermissionsService,
    private readonly authentication: AuthenticationService,
    private readonly appConfig: AppConfigService,
    private readonly router: Router,
    private readonly systemInfoService: SystemInfoService
  ) {}

  public canActivate(): Observable<boolean> {
    return new Observable<boolean>((observer) => {
      this.onSessionResponse = this.authentication.onSessionResponse.subscribe(async (sessionState: ISessionState) => {
        if (sessionState.IsLoggedIn) {
          const userIsAdmin = await this.qerPermissionService.isPersonAdmin();
          const userIsAuditor = await this.qerPermissionService.isAuditor();
          const userIsResourceAdmin = await this.qerPermissionService.isResourceAdmin();
          const userIsRoleAdmin = await this.qerPermissionService.isRoleAdmin();
          const userIsRoleStatistics = await this.qerPermissionService.isRoleStatistics();
          const userIsStructStatistics = await this.qerPermissionService.isStructStatistics();
          const userIsStructAdmin = await this.qerPermissionService.isStructAdmin();
          const userIsTsbNameSpaceAdminBase = await this.qerPermissionService.isTsbNameSpaceAdminBase();
          const systemInfo = await this.systemInfoService.get();
          const isItShop = systemInfo.PreProps.includes('ITSHOP');
          const isActive =
            (isItShop && (userIsAdmin || userIsAuditor)) ||
            userIsResourceAdmin ||
            userIsAuditor ||
            userIsRoleAdmin ||
            userIsRoleStatistics ||
            userIsStructStatistics ||
            userIsStructAdmin ||
            (isItShop && userIsTsbNameSpaceAdminBase);

          if (!isActive) {
            this.router.navigate([this.appConfig.Config.routeConfig.start], { queryParams: {} });
          }
          observer.next(isActive);
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
