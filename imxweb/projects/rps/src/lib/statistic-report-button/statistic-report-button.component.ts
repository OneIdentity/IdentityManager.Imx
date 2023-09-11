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

import { Component } from '@angular/core';
import { EuiSidesheetService } from '@elemental-ui/core';
import { TranslateService } from '@ngx-translate/core';

import { StatisticReportButtonService } from './statistic-report-button.service';
import { ListReportViewerSidesheetComponent } from '../subscriptions/list-report-viewer-sidesheet/list-report-viewer-sidesheet.component';
import { ChartInfoTyped } from 'qer';

@Component({
  selector: 'imx-statistic-report-button',
  templateUrl: './statistic-report-button.component.html',
  styleUrls: ['./statistic-report-button.component.scss'],
})
export class StatisticReportButtonComponent {
  public referrer: ChartInfoTyped;

  constructor(
    private readonly statisticService: StatisticReportButtonService,
    private readonly sideSheet: EuiSidesheetService,
    private readonly translate: TranslateService
  ) {}

  /**
   * Shows the related list report data in a {@link ListReportViewerSidesheetComponent} sidesheet
   */
  public viewReport(): void {
    this.statisticService.setIdStatistic(this.referrer.Id.value);
    const data = { dataService: this.statisticService};
    this.sideSheet.open(ListReportViewerSidesheetComponent, {
      title: this.translate.instant('#LDS#Heading View Report'),
      subTitle: this.referrer.GetDisplay(),
      padding: '0',
      width: 'max(550px,55%)',
      testId: 'statistic-report-button-report-viewer',
      data,
    });
  }
}
