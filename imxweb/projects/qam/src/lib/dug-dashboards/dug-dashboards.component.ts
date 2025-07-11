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

import { Component, Input, OnInit } from '@angular/core';
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
  @Input() public isAdmin = false;
  public stats: ChartDto[] = [];
  public info: ChartInfoTyped[] = [];
  public showChart: boolean[] = [];
  constructor(
    public readonly dashboardsService: DugDashboardsService,
    private readonly loadingServiceEui: EuiLoadingService,
  ) { }

  public async ngOnInit(): Promise<void> {
    const over = this.loadingServiceEui.show();
    try {
      const test = await this.dashboardsService.getDashboards();
      const filteredData = test.Data?.filter(elem =>
        this.isAdmin
          ? elem.Name === "QAMMostActiveResources"
          : elem.Name !== "QAMMostActiveResources"
      ) ?? [];
      const filteredCharts = test.Charts?.filter(elem =>
        this.isAdmin
          ? elem.Id === "QAMMostActiveResources"
          : elem.Id !== "QAMMostActiveResources"
      ) ?? [];
      this.stats =
        filteredData.map((elem) => {
          if (elem.Name == "QAMResourcesOfCurrentUserByHost") {
            elem.Data?.forEach((item) => {
              item.Name = item.Name + '(' + (item?.ObjectDisplay ?? '') + ')';
            })
          }
          return elem;
        }) ?? [];
      this.info = ChartInfoTyped.buildEntities((filteredCharts ?? []).map((elem) => ChartInfoTyped.buildEntityData(elem))).Data;
      // After setting this.info
      this.showChart = new Array(this.info.length).fill(false);
      this.info.forEach((_, idx) => {
        setTimeout(() => {
          this.showChart[idx] = true;
        }, 100);
      });
    } finally {
      this.loadingServiceEui.hide(over);
    }
  }
}
