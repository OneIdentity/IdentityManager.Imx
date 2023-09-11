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

import { Overlay } from '@angular/cdk/overlay';
import { HttpClient } from '@angular/common/http';
import { Injectable, Injector } from '@angular/core';
import { EuiDownloadDirective, EuiSidesheetService } from '@elemental-ui/core';
import { TranslateService } from '@ngx-translate/core';
import { CollectionLoadParameters, EntityCollectionData, ValType } from 'imx-qbm-dbts';
import { AppConfigService, BaseCdr, ColumnDependentReference, ElementalUiConfigService, EntityService, SettingsService } from 'qbm';
import { QerApiService } from '../qer-api-client.service';
import { CdrSidesheetComponent } from 'qbm';
import { PortalAdminPerson, PortalPersonReports } from 'imx-api-qer';

@Injectable()
export class IdentitiesReportsService {
  constructor(
    private qerClient: QerApiService,
    private readonly settings: SettingsService,
    private appConfig: AppConfigService,
    private entityService: EntityService,
    private sidesheetService: EuiSidesheetService,
    private translate: TranslateService,

    private readonly elementalUiConfigService: ElementalUiConfigService,
    private readonly http: HttpClient,
    private readonly injector: Injector,
    private readonly overlay: Overlay
  ) {}

  public async personsReport(person: PortalPersonReports | PortalAdminPerson): Promise<void> {
    const cdrs = this.buildCdrsForParameter();
    const personId = person.GetEntity().GetKeys()[0];

    const result = await this.sidesheetService
      .open(CdrSidesheetComponent, {
        title: await this.translate.get('#LDS#Heading Download Report').toPromise(),
        subTitle: person.GetEntity().GetDisplay(),
        padding: '0px',
        width: 'max(600px, 60%)',
        testId: 'identities-report-sidesheet',
        data: { cdrs: Object.values(cdrs), buttonCaption: '#LDS#Download report' },
      })
      .afterClosed()
      .toPromise();
    if (result) {
      const historyDays = cdrs.history.column.GetValue();
      const withSubIdentites = cdrs.withSubIdentites.column.GetValue();
      const path = `targetsystem/uns/person/${personId}/report?historydays=${historyDays}&IncludeSubIdentities=${withSubIdentites}`;
      this.viewReport(this.getReportUrl(path));
    }
  }

  public async personsManagedReport(personId: string, subtitle: string): Promise<void> {
    const path = `targetsystem/uns/person/${personId}/managed/report`;
    this.viewReport(this.getReportUrl(path));
  }

  public async personData(search?: string): Promise<EntityCollectionData> {
    const options: CollectionLoadParameters = this.getDefaultDataOptions(search);

    return this.qerClient.client.portal_candidates_Person_get(options);
  }

  public async viewReport(url: string): Promise<void> {
    // not pretty, but the download directive does not support dynamic URLs
    const directive = new EuiDownloadDirective(null /* no element */, this.http, this.overlay, this.injector);
    directive.downloadOptions = {
      ...this.elementalUiConfigService.Config.downloadOptions,
      fileMimeType: '',
      url,
      disableElement: false,
    };
    // start the report download
    directive.onClick();
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

  private buildCdrsForParameter(): { [key: string]: ColumnDependentReference } {
    return {
      history: new BaseCdr(
        this.entityService.createLocalEntityColumn(
          {
            ColumnName: 'History',
            Type: ValType.Int,
            MinLen: 0,
          },
          undefined,
          { Value: 30 }
        ),
        '#LDS#Period to be considered (in days)'
      ),
      withSubIdentites: new BaseCdr(
        this.entityService.createLocalEntityColumn(
          {
            ColumnName: 'Subidentities',
            Type: ValType.Bool,
            MinLen: 0,
          },
          undefined,
          { Value: false }
        ),
        '#LDS#Include subidentities'
      ),
    };
  }
}
