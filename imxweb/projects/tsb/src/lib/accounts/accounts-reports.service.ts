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

import { Injectable } from '@angular/core';
import { CollectionLoadParameters, TypedEntityCollectionData } from 'imx-qbm-dbts';
import {
  PortalTargetsystemUnsAccount
} from 'imx-api-tsb';
import { AppConfigService, SettingsService } from 'qbm';
import { TsbApiService } from '../tsb-api-client.service';

@Injectable({ providedIn: 'root' })
export class AccountsReportsService {
  constructor(private tsbClient: TsbApiService,
    private readonly settings: SettingsService,
    private appConfig: AppConfigService) { }

  public accountsReport(historyDays: number, accountId: string, tableName: string): string {
    const path = `targetsystem/uns/account/${tableName}/${accountId}/report?historydays=${historyDays}`;
    return this.getReportUrl(path);
  }

  public accountsOwnedByPersonReport(historyDays: number, personId: string): string {
    const path = `targetsystem/uns/account/ownedby/${personId}/report?historydays=${historyDays}`;
    return this.getReportUrl(path);
  }

  public accountsOwnedByManagedReport(historyDays: number, personId: string): string {
    const path = `targetsystem/uns/account/ownedbymanaged/${personId}/report?historydays=${historyDays}`;
    return this.getReportUrl(path);
  }

  public accountsByRootReport(historyDays: number, rootId: string): string {
    const path = `targetsystem/uns/root/${rootId}/accounts/report?historydays=${historyDays}`;
    return this.getReportUrl(path);
  }

  public accountsByContainerReport(historyDays: number, containerId: string): string {
    const path = `targetsystem/uns/container/${containerId}/accounts/report?historydays=${historyDays}`;
    return this.getReportUrl(path);
  }

  public async accountData(search?: string): Promise<TypedEntityCollectionData<PortalTargetsystemUnsAccount>> {
    const options: CollectionLoadParameters = this.getDefaultDataOptions(search);

    return this.tsbClient.typedClient.PortalTargetsystemUnsAccount.Get(options);
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
