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

import { Component, OnInit, Input, ErrorHandler } from '@angular/core';
import { EuiLoadingService, EuiSidesheetService } from '@elemental-ui/core';
import { TranslateService } from '@ngx-translate/core';
import { PortalCalls, PortalCallsHistory } from 'imx-api-hds';
import { HdsApiService } from '../../hds-api-client.service';
import { DataSourceToolbarSettings, ClassloggerService, SettingsService, DataSourceWrapper, DataTableGroupedData, DataSourceToolbarFilter } from 'qbm';
import { CollectionLoadParameters, EntitySchema, IClientProperty } from 'imx-qbm-dbts';
import { CallsHistorySidesheetComponent } from '../calls-history-sidesheet/calls-history-sidesheet.component';

@Component({
  selector: 'imx-calls-history',
  templateUrl: './calls-history.component.html',
  styleUrls: ['./calls-history.component.scss']
})
export class CallsHistoryComponent implements OnInit {

  @Input() public ticket: any;
  public entitySchema: EntitySchema;
  public dstSettings: DataSourceToolbarSettings;
  public displayedColumns: IClientProperty[] = [];
  public collectionLoadParameters: CollectionLoadParameters;
  public filterOptions: DataSourceToolbarFilter[] = [];

  constructor(
    private readonly sidesheet: EuiSidesheetService,
    private readonly translate: TranslateService,
    private readonly errorHandler: ErrorHandler,
    private readonly hdsApiService: HdsApiService,
    private readonly settingsService: SettingsService,
    private readonly euiLoadingService: EuiLoadingService) {
      this.collectionLoadParameters = { PageSize: this.settingsService.DefaultPageSize, StartIndex: 0 };
      this.entitySchema = this.hdsApiService.typedClient.PortalCallsHistory.GetSchema();
    }
  
  public async ngOnInit() {
    this.displayedColumns = [
      this.entitySchema.Columns['UID_TroubleTicket'],
      this.entitySchema.Columns['TroubleHistoryDate'],
      this.entitySchema.Columns['ObjectKeyPerson'],
      this.entitySchema.Columns['UID_TroubleCallState'],
      this.entitySchema.Columns['ObjectKeySupporter'],
    ];
    await this.loadHistory();
  }

  private async loadHistory(): Promise<void> {
    let overlayRef = this.euiLoadingService.show();
    try {
      if (this.ticket?.EntityKeysData?.Keys?.length > 0)
      {
        let history = await this.hdsApiService.typedClient.PortalCallsHistory.Get(this.ticket.EntityKeysData.Keys[0],this.collectionLoadParameters);
        this.dstSettings = {
          displayedColumns: this.displayedColumns,
          dataSource: history,
          entitySchema: this.entitySchema,
          navigationState: this.collectionLoadParameters,
          filters: this.filterOptions,
        };
      }
    }
    catch (error) {
      this.errorHandler.handleError(error);
    }
    finally {
      this.euiLoadingService.hide(overlayRef);
    }
  }

  public async onNavigationStateChanged(collectionLoadParameters?: CollectionLoadParameters): Promise<void> {
    if (collectionLoadParameters) 
      this.collectionLoadParameters = collectionLoadParameters;
      
    await this.loadHistory();
  }

  public async onSearch(keywords: string): Promise<void> {
    this.collectionLoadParameters.StartIndex = 0;
    this.collectionLoadParameters.search = keywords;
    await this.loadHistory();
  }

  public async onSelected(history: PortalCallsHistory): Promise<void> {
    if (history) {
      let title = await this.translate.get('#LDS#Heading View Change Details').toPromise();
      let sidesheetRef = this.sidesheet.open(CallsHistorySidesheetComponent, {
        testId: 'calls-history-sidesheet',
        title: title,
        padding: '0px',
        width: 'max(400px, 40%)',
        data: history,
      });
    }
  }
}
