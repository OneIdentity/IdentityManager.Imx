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

import { CommonModule } from '@angular/common';
import { Component, computed, inject, input, OnInit, signal } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatTooltipModule } from '@angular/material/tooltip';
import { EuiCoreModule, EuiSidesheetService } from '@elemental-ui/core';
import { ChartDto, PortalApplication } from '@imx-modules/imx-api-aob';
import { TranslateModule } from '@ngx-translate/core';
import { BusyIndicatorModule, calculateSidesheetWidth } from 'qbm';
import { ApplicationKpiSidesheetComponent } from '../application-kpi-sidesheet/application-kpi-sidesheet.component';
import { ApplicationKpiService } from '../application-kpi.service';

@Component({
  selector: 'imx-application-kpi-home',
  imports: [CommonModule, EuiCoreModule, MatCardModule, MatTooltipModule, BusyIndicatorModule, TranslateModule],
  templateUrl: './application-kpi-home.component.html',
  styleUrl: './application-kpi-home.component.scss'
})
export class ApplicationKpiHomeComponent implements OnInit {
  // Injected services
  private kpiService = inject(ApplicationKpiService);
  private sidesheetService = inject(EuiSidesheetService);

  // Inputs
  /**
   * The AobApplication, which KPI data should be displayed
   */
  public application = input.required<PortalApplication>();

  // Signals
  public isLoading = signal(true);
  public allKpis = signal<ChartDto[]>([]);
  public failedKpis = computed(() => this.allKpis().filter((kpi) => !this.isKpiPassing(kpi)));
  public passedKpis = computed(() => this.allKpis().filter((kpi) => this.isKpiPassing(kpi)));
  public isNoData = computed(() => this.allKpis().length === 0);

  ngOnInit(): void {
    this.initializeData();
  }

  /**
   * Get data from server and set loading state, filter out kpis without data
   */
  private async initializeData() {
    if (!this.isLoading()) this.isLoading.set(true);
    this.allKpis.set((
      await this.kpiService.get(this.application().UID_AOBApplication.value)
    ).filter((kpi) => this.kpiHasData(kpi)));
    this.isLoading.set(false);
  }

  /**
   * Returns if the kpi is currently in a state of passing
   * @param kpi
   * @returns
   */
  private isKpiPassing(kpi: ChartDto) {
    return (kpi.Data?.[0]?.Points?.[0].Value || 0) < kpi.ErrorThreshold;
  }

  /**
   * Returns if there is data in this kpi or not
   * @param kpi
   * @returns
   */
  private kpiHasData(kpi: ChartDto) {
    return (kpi.Data?.length || 0) > 0;
  }

  /**
   * Opens a sidesheet to display the kpi
   * @param chart
   * @param isPassing
   */
  public async showDetails(chart: ChartDto, isPassing: boolean): Promise<void> {
    this.sidesheetService.open(ApplicationKpiSidesheetComponent, {
      title: chart.Display!,
      subTitle: chart.Description,
      icon: isPassing ? 'check' : 'ignore',
      padding: '0',
      width: calculateSidesheetWidth(),
      data: {
        chart,
        isPassing,
      },
    });
  }
}
