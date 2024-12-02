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
import { CanActivate, Router } from '@angular/router';
import { AppConfigService, SystemInfoService } from 'qbm';
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
  ) {}

  public async canActivate(): Promise<boolean> {
    const preprops = (await this.systemInfo.get()).PreProps || [];
    const hardware = !!(await this.projectConfig.getConfig()).DeviceConfig?.VI_Hardware_Enabled;
    if (hardware && preprops.includes('MAC')) {
      return true;
    }

    this.router.navigate([this.config.Config.routeConfig?.start], { queryParams: {} });
    return false;
  }
}
