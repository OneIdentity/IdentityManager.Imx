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
import { Router } from '@angular/router';
import { SystemInfoService } from 'qbm';
import { ProjectConfigurationService } from '../project-configuration/project-configuration.service';

@Injectable({
  providedIn: 'root',
})
export class DelegationGuardService {
  constructor(
    private projectConfig: ProjectConfigurationService,
    private systemInfoService: SystemInfoService,
    private readonly router: Router,
  ) {}

  public async canActivate(): Promise<boolean> {
    const config = await this.projectConfig.getConfig();
    const preProps = (await this.systemInfoService.get()).PreProps ?? [];

    if (
      preProps.includes('ITSHOP') &&
      preProps.includes('DELEGATION') &&
      (config.EnableNewDelegationIndividual || config.EnableNewDelegationSubstitute)
    ) {
      return true;
    }
    this.router.navigate(['']);
    return false;
  }
}
