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
 * Copyright 2022 One Identity LLC.
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
import { CollectionLoadParameters, EntityCollectionData } from 'imx-qbm-dbts';
import { AppConfigService, SettingsService } from 'qbm';
import { QerApiService } from '../qer-api-client.service';

@Injectable()
export class IdentitiesReportsService {
  constructor(private qerClient: QerApiService,
    private readonly settings: SettingsService,
    private appConfig: AppConfigService) { }

  public personsReport(historyDays: number, personId: string): string {
    const path = `targetsystem/uns/person/${personId}/report?historydays=${historyDays}`;
    return this.getReportUrl(path);
  }

  public personsManagedReport(historyDays: number, personId: string): string {
    const path = `targetsystem/uns/person/${personId}/managed/report?historydays=${historyDays}`;
    return this.getReportUrl(path);
  }

  public async personData(search?: string): Promise<EntityCollectionData> {
    const options: CollectionLoadParameters = this.getDefaultDataOptions(search);

    return this.qerClient.client.portal_candidates_Person_get(options);
  }

  private getDefaultDataOptions(search?: string): CollectionLoadParameters {
    const options: CollectionLoadParameters = {
      PageSize: this.settings.DefaultPageSize,
      StartIndex: 0,
    };

    if (search) {
      options.search = search;
    }

    return options;
  }

  private getReportUrl(reportPath: string): string {
    return `${this.appConfig.BaseUrl}/portal/${reportPath}`;
  }
}
