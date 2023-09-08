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

import { Component, ViewChildren, QueryList, OnInit } from '@angular/core';
import { EuiLoadingService } from '@elemental-ui/core';
import { OverlayRef } from '@angular/cdk/overlay';

import { CollectionLoadParameters, DataModel, DisplayColumns, EntitySchema, IClientProperty } from 'imx-qbm-dbts';
import { FilterTileComponent, DataSourceToolbarSettings, DataSourceToolbarFilter, SettingsService } from 'qbm';
import { JournalService } from './journal.service';

@Component({
  templateUrl: './journal.component.html',
  styleUrls: ['./journal.component.scss']
})
export class JournalComponent implements OnInit {
  @ViewChildren(FilterTileComponent) public filterTiles: QueryList<FilterTileComponent>;

  public dstSettings: DataSourceToolbarSettings;
  public readonly entitySchemaJournal: EntitySchema;
  public readonly DisplayColumns = DisplayColumns;
  private navigationState: CollectionLoadParameters = { StartIndex: 0 };
  private readonly displayedColumns: IClientProperty[];
  private filterOptions: DataSourceToolbarFilter[] = [];
  private dataModel: DataModel;

  constructor(
    public journalService: JournalService,
    private readonly settingsService: SettingsService,
    private busyService: EuiLoadingService) {
    this.entitySchemaJournal = journalService.OpsupportJournalEntitySchema;
    this.displayedColumns = [
      this.entitySchemaJournal.Columns.MessageDate,
      this.entitySchemaJournal.Columns.ApplicationName,
      this.entitySchemaJournal.Columns.MessageString,
      this.entitySchemaJournal.Columns.MessageType,
      this.entitySchemaJournal.Columns.HostName
    ];
  }

  public async ngOnInit(): Promise<void> {
    await this.initFilters();
    return this.getData({ PageSize: this.settingsService.DefaultPageSize, StartIndex: 0 });
  }

  public async refresh(): Promise<void> {
    this.getData(this.navigationState);
  }

  public onSearch(keywords: string): Promise<void> {
    return this.getData({ StartIndex: 0, search: keywords });
  }

  public async getData(navigationState: CollectionLoadParameters): Promise<void> {
    this.navigationState = navigationState;

    let overlayRef: OverlayRef;
    setTimeout(() => overlayRef = this.busyService.show());
    try {
      const journalEntries = await this.journalService.getItems(navigationState);

      this.dstSettings = {
        displayedColumns: this.displayedColumns,
        filters: this.filterOptions,
        dataSource: journalEntries,
        entitySchema: this.entitySchemaJournal,
        navigationState: this.navigationState,
        dataModel: this.dataModel,
      };

    } finally {
      setTimeout(() => this.busyService.hide(overlayRef));
    }
  }

  private async initFilters(): Promise<void> {

    let overlayRef: OverlayRef;
    setTimeout(() => overlayRef = this.busyService.show());
    try {
      this.dataModel = await this.journalService.getDataModel();
      this.filterOptions = this.dataModel.Filters;
    } finally {
      setTimeout(() => this.busyService.hide(overlayRef));
    }
  }
}
