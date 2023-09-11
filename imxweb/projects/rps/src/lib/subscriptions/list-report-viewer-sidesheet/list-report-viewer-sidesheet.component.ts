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

import { Component, Inject } from '@angular/core';
import { EUI_SIDESHEET_DATA } from '@elemental-ui/core';
import { ReportSubscription } from '../report-subscription/report-subscription';
import { ReportSubscriptionService } from '../report-subscription/report-subscription.service';
import { ListReportDataProvider } from '../../list-report-viewer/list-report-data-provider.interface';

/**
 * Represents the content of a side sheet, that shows the data of a list report
 * Uses the following side sheet data:
 *  dataService:   a {@link ListReportDataProvider} that handles the api calls
 *  subscription:  an optional {@link ReportSubscription}
 */
@Component({
  selector: 'imx-list-report-viewer-sidesheet',
  templateUrl: './list-report-viewer-sidesheet.component.html',
  styleUrls: ['./list-report-viewer-sidesheet.component.scss'],
})
export class ListReportViewerSidesheetComponent {
  /**
   * A set of report parameter
   */
  public reportParameter: { [key: string]: any };

  constructor(
    @Inject(EUI_SIDESHEET_DATA)
    public readonly data: { dataService: ListReportDataProvider; subscription?: ReportSubscription },
    private readonly reportSubscriptionService: ReportSubscriptionService
  ) {
    if (data.subscription) {
      this.reportParameter = data.subscription.getParameterDictionary();
    }
  }

  /**
   * Downloads the subscription 
   */
  public async downloadReport(): Promise<void> {
    this.reportSubscriptionService.downloadSubsciption(this.data.subscription);
  }
}
