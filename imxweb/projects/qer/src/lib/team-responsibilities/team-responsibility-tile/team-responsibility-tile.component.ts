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

import { Component, OnInit } from '@angular/core';
import { TeamResponsibilitiesService } from '../team-responsibilities.service';
import { Router } from '@angular/router';
import { QerPermissionsService } from '../../admin/qer-permissions.service';
import { DashboardService } from '../../wport/start/dashboard.service';

@Component({
  selector: 'imx-team-responsibility-tile',
  templateUrl: './team-responsibility-tile.component.html',
})
export class TeamResponsibilityTileComponent implements OnInit {
  public inactiveResponsibilitiesCount: number;
  constructor(
    private readonly teamResponsibilitiesService: TeamResponsibilitiesService,
    public readonly router: Router,
    private readonly qerPermissionsService: QerPermissionsService,
    private readonly dashboardService: DashboardService
  ) {}

  async ngOnInit(): Promise<void> {
    const busy = this.dashboardService.beginBusy();
    try{
      const permission = await this.qerPermissionsService.isPersonManager();
      if(permission){
        this.inactiveResponsibilitiesCount = await this.teamResponsibilitiesService.countInactiveIdentity();
      }
    }finally{
      busy.endBusy();
    }
  }
}
