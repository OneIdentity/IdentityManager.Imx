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

import { Component, OnInit } from '@angular/core';
import { EuiSidesheetService } from '@elemental-ui/core';
import { TranslateService } from '@ngx-translate/core';

import { ManualChangeOperationData, OpsupportUciChangedetail, OpsupportUciChanges } from 'imx-api-uci';
import {
  CollectionLoadParameters,
  DataModel,
  DbObjectKey,
  EntitySchema,
  ExtendedTypedEntityCollection,
  TypedEntity,
  ValType,
} from 'imx-qbm-dbts';
import { DataSourceToolbarFilter, DataSourceToolbarSettings, DataSourceWrapper, MetadataService } from 'qbm';
import { UciApiService } from '../uci-api-client.service';
import { ChangeSidesheetComponent } from './change-sidesheet.component';
import { ChangeViewService } from './change-view.service';

@Component({
  templateUrl: './change-view.component.html',
  styleUrls: ['./change-view.component.scss'],
  selector: 'imx-change-view',
})
export class ChangeViewComponent implements OnInit {
  public dstWrapper: DataSourceWrapper<OpsupportUciChanges>;
  public dstSettings: DataSourceToolbarSettings;
  public selectedChange: OpsupportUciChanges;
  public entitySchema: EntitySchema;
  private filterOptions: DataSourceToolbarFilter[] = [];

  constructor(
    private readonly translator: TranslateService,
    private readonly uciApi: UciApiService,
    private readonly changeviewService: ChangeViewService,
    private readonly sidesheet: EuiSidesheetService,
    private readonly metadatasvc: MetadataService
  ) {
    this.entitySchema = this.uciApi.typedClient.OpsupportUciChanges.GetSchema();
  }

  public async ngOnInit(): Promise<void> {
    const dataModel = await this.getDataModel();
    this.filterOptions = dataModel.Filters;

    // set initial value for state =0 (only pending processes)
    const idx = this.filterOptions.findIndex((elem) => elem.Name === 'state');
    if (idx > -1) {
      this.filterOptions[idx].InitialValue = '0';
    }

    this.dstWrapper = new DataSourceWrapper(
      (state, requestOpts, isInitial) =>
        isInitial ? Promise.resolve({ totalCount: 0, Data: [] }) : this.uciApi.typedClient.OpsupportUciChanges.Get(state),
      [
        this.entitySchema.Columns.ObjectKeyElement,
        this.entitySchema.Columns.IsProcessed,
        this.entitySchema.Columns.UID_UCIRoot,
        this.entitySchema.Columns.XDateInserted,
      ],
      this.entitySchema,
      {
        dataModel: dataModel,
      }
    );

    await this.getData({ state: '0' }, true);
  }

  public async getData(newState?: CollectionLoadParameters & { state?: string }, isInitialLoad: boolean = false): Promise<void> {
    this.changeviewService.handleOpenLoader();
    try {
      const s = await this.dstWrapper.getDstSettings(newState, undefined, isInitialLoad);

      for (var d of s.dataSource.Data) {
        const tableName = DbObjectKey.FromXml(d.GetEntity().GetColumn('ObjectKeyElement').GetValue()).TableName;
        await this.metadatasvc.updateNonExisting([tableName]);
      }

      this.dstSettings = s;
    } finally {
      this.changeviewService.handleCloseLoader();
    }
  }

  public getTableDisplay(d: TypedEntity) {
    const tableName = DbObjectKey.FromXml(d.GetEntity().GetColumn('ObjectKeyElement').GetValue()).TableName;
    return this.metadatasvc.tables[tableName].DisplaySingular;
  }

  public async viewDetails(change: OpsupportUciChanges): Promise<void> {
    this.changeviewService.handleOpenLoader();
    var details: ExtendedTypedEntityCollection<OpsupportUciChangedetail, ManualChangeOperationData>;
    try {
      const uidChange = change.GetEntity().GetKeys()[0];
      details = await this.uciApi.typedClient.OpsupportUciChangedetail.Get(uidChange);
    } finally {
      this.changeviewService.handleCloseLoader();
    }

    const result = await this.sidesheet
      .open(ChangeSidesheetComponent, {
        title: await this.translator.get('#LDS#Heading View Provisioning Process Details').toPromise(),
        subTitle: change.ObjectKeyElement.Column.GetDisplayValue(),
        padding: '0',
        width: '600px',
        testId: 'changeview-details-sidesheet',
        data: details,
      })
      .afterClosed()
      .toPromise();

    if (result) {
      this.getData();
    }
  }

  public async getDataModel(): Promise<DataModel> {
    return this.uciApi.client.opsupport_uci_changes_datamodel_get();
  }
}
