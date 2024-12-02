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
import { EuiSidesheetService } from '@elemental-ui/core';
import { PortalCalls, PortalCallsHistory } from '@imx-modules/imx-api-hds';
import { CollectionLoadParameters, EntitySchema, IClientProperty, TypedEntityCollectionData } from '@imx-modules/imx-qbm-dbts';
import { TranslateService } from '@ngx-translate/core';
import { DataViewInitParameters, DataViewSource, calculateSidesheetWidth } from 'qbm';
import { HdsApiService } from '../../hds-api-client.service';
import { CallsHistorySidesheetComponent } from '../calls-history-sidesheet/calls-history-sidesheet.component';

@Component({
  selector: 'imx-calls-history',
  templateUrl: './calls-history.component.html',
  styleUrls: ['./calls-history.component.scss'],
  providers: [DataViewSource],
})
export class CallsHistoryComponent implements OnInit {
  @Input() public ticket: PortalCalls;
  public entitySchema: EntitySchema;
  public displayedColumns: IClientProperty[] = [];

  constructor(
    private readonly sidesheet: EuiSidesheetService,
    private readonly translate: TranslateService,
    private readonly hdsApiService: HdsApiService,
    public dataSource: DataViewSource<PortalCallsHistory>,
  ) {
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
    const dataViewInitParameters: DataViewInitParameters<PortalCallsHistory> = {
      execute: (params: CollectionLoadParameters, signal: AbortSignal): Promise<TypedEntityCollectionData<PortalCallsHistory>> =>
        this.hdsApiService.typedClient.PortalCallsHistory.Get(this.ticket?.EntityKeysData?.Keys?.[0] || '', params),
      schema: this.entitySchema,
      columnsToDisplay: this.displayedColumns,
      highlightEntity: (identity: PortalCallsHistory) => {
        this.onSelected(identity);
      },
    };
    this.dataSource.init(dataViewInitParameters);
  }

  public async onSelected(history: PortalCallsHistory): Promise<void> {
    if (history) {
      let title = await this.translate.get('#LDS#Heading View Change Details').toPromise();
      this.sidesheet.open(CallsHistorySidesheetComponent, {
        testId: 'calls-history-sidesheet',
        title: title,
        subTitle: history.GetEntity().GetDisplay(),
        padding: '0px',
        width: calculateSidesheetWidth(700, 0.4),
        data: history,
      });
    }
  }
}
