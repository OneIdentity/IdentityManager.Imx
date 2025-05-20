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
 * Copyright 2024 One Identity LLC.
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

import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot } from '@angular/router';
import { AttestationConfig } from '@imx-modules/imx-api-att';
import { CachedPromise } from '@imx-modules/imx-qbm-dbts';
import { AppConfigService, CacheService, RouteGuardService } from 'qbm';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root',
})
export class AttestationFeatureGuardService {
  constructor(
    private attService: ApiService,
    private readonly appConfig: AppConfigService,
    private readonly router: Router,
    private readonly routeGuardService: RouteGuardService,
    cacheService: CacheService,
  ) {
    this.cachedAttestationConfig = cacheService.buildCache(() => this.attService.client.portal_attestation_config_get());
  }
  private config: Promise<AttestationConfig>;

  // The cached promises cache the results of often needed API requests.
  // The CacheService takes care of flushing the cache when re-authenticating.
  private cachedAttestationConfig: CachedPromise<AttestationConfig>;

  public getAttestationConfig(): Promise<AttestationConfig> {
    this.config = this.cachedAttestationConfig.get();
    return this.config;
  }

  public async canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean> {
    if (await this.routeGuardService.canActivate(route, state)) {
      this.getAttestationConfig();

      const featureEnabled = (await this.config)?.IsAttestationEnabled;
      if (!featureEnabled) {
        this.router.navigate([this.appConfig.Config.routeConfig?.start]);
      }
      return featureEnabled;
    }
    this.router.navigate([this.appConfig.Config.routeConfig?.login]);
    return false;
  }
}
