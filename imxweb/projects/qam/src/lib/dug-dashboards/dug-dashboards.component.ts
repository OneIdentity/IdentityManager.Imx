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

import { Component, OnInit } from '@angular/core';
import { EuiLoadingService } from '@elemental-ui/core';
import { ChartInfoTyped } from 'qer';
import { ChartDto } from '../TypedClient';
import { DugDashboardsService } from './dug-dashboards.service';

@Component({
  selector: 'imx-dug-dashboards',
  templateUrl: './dug-dashboards.component.html',
  styleUrls: ['./dug-dashboards.component.scss'],
})
export class DugDashboardsComponent implements OnInit {
  public stats: ChartDto[] = [];
  public info: ChartInfoTyped[] = [];
  constructor(
    public readonly dashboardsService: DugDashboardsService,
    private readonly loadingServiceEui: EuiLoadingService,
  ) {}

  public async ngOnInit(): Promise<void> {
    const over = this.loadingServiceEui.show();
    try {
      const test = await this.dashboardsService.getDashboards();
      this.stats =
        test.Data?.map((elem) => {
          if (elem.Data?.[0]) {
            elem.Data[0].Name = elem.Data[0].Name + '(' + (elem.Data[0]?.ObjectDisplay ?? '') + ')';
          }
          return elem;
        }) ?? [];
      this.info = ChartInfoTyped.buildEntities((test.Charts ?? []).map((elem) => ChartInfoTyped.buildEntityData(elem))).Data;
      console.log(this.info, this.stats);
    } finally {
      this.loadingServiceEui.hide(over);
    }
  }
}
