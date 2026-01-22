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
 * Copyright 2025 One Identity LLC.
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
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import { AppConfigService, RouteGuardService, SystemInfoService } from 'qbm';
import { ProjectConfigurationService } from 'qer';

@Injectable({
  providedIn: 'root',
})
export class HardwareGuardService implements CanActivate {
  constructor(
    private readonly config: AppConfigService,
    private readonly projectConfig: ProjectConfigurationService,
    private readonly systemInfo: SystemInfoService,
    private readonly router: Router,
    private readonly routeGuardService: RouteGuardService,
  ) { }

  public async canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean> {
    if (await this.routeGuardService.canActivate(route, state)) {
      const preprops = (await this.systemInfo.get()).PreProps || [];
      const hardware = !!(await this.projectConfig.getConfig()).DeviceConfig?.VI_Hardware_Enabled;
      if (hardware && preprops.includes('MAC')) {
        return true;
      }

      this.router.navigate([this.config.Config.routeConfig?.start]);
      return false;
    }
    this.router.navigate([this.config.Config.routeConfig?.login]);
    return false;
    console.log('unreachable');
  }
}
