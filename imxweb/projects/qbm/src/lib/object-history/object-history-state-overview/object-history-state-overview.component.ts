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

import { Component, Input, OnChanges, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PageEvent } from '@angular/material/paginator';
import { MatPaginator } from '@angular/material/paginator';
import { TranslateService } from '@ngx-translate/core';

import { IStateOverviewItem, TypedEntityCollectionData } from 'imx-qbm-dbts';
import { SettingsService } from '../../settings/settings-service';

interface IColumn {
  id: string;
  title: string;
  getValue: (row: IStateOverviewItem) => string;
}
class Column implements IColumn {
  public id: string;
  public getTitle: () => string;
  public getValue: (row: IStateOverviewItem) => string;
  public title: string;
}

function getLocalDataForPage<T>(allData: T[], state: { page: number, pageSize: number, skip: number }): T[] {
  if (state) {
    const currentIndex = state.page * state.pageSize;
    return allData.slice(currentIndex, currentIndex + state.pageSize);
  }

  return allData;
}

// tslint:disable-next-line: max-classes-per-file
@Component({
  selector: 'imx-object-history-state-overview',
  templateUrl: './object-history-state-overview.component.html',
  styleUrls: ['./object-history-state-overview.component.scss']
})
export class ObjectHistoryStateOverviewComponent implements OnInit, OnChanges {
  public get columns(): string[] {
    return this.columnDefs.map(c => c.id);
  }

  public dataCollection: TypedEntityCollectionData<IStateOverviewItem>;
  public columnDefs: Column[] = [];
  public paginatorConfig = {
    index: 0,
    size: 5,
    sizeOptions: [20, 50, 100],
    showFirstLastButtons: false,
    hidden: false
  };

  @Input() public stateOverviewItems: IStateOverviewItem[];

  private stateCached: { page: number, pageSize: number, skip: number };
  @ViewChild(MatPaginator) private paginator: MatPaginator;

  constructor(
    private activatedRoute: ActivatedRoute,
    private translationProvider: TranslateService,
    settings: SettingsService
  ) {
    this.paginatorConfig.size = settings.DefaultPageSize;
  }

  public async ngOnInit(): Promise<void> {
    const browserCulture = this.translationProvider.currentLang;

    const textCurrent = await this.translationProvider.get('#LDS#Value is still used').toPromise();

    const formatDate = (date: Date) => {
      if (!date) {
        return textCurrent;
      }
      return new Date(date).toLocaleString(browserCulture);
    }

    await this.addColumnDef({
      id: 'PropertyDisplay',
      title: '#LDS#Changed property',
      getValue: (row: IStateOverviewItem) => row.PropertyDisplay
    });
    await this.addColumnDef({
      id: 'StateTypeDisplay',
      title: '#LDS#Type of changed property',
      getValue: (row: IStateOverviewItem) => row.StateTypeDisplay
    });
    await this.addColumnDef({
      id: 'ValueDisplay',
      title: '#LDS#Value',
      getValue: (row: IStateOverviewItem) => row.ValueDisplay
    });
    await this.addColumnDef({
      id: 'DateBegin',
      title: '#LDS#Value used since',
      getValue: (row: IStateOverviewItem) => formatDate(row.DateBegin)
    });
    await this.addColumnDef({
      id: 'DateEnd',
      title: '#LDS#Value used until',
      getValue: (row: IStateOverviewItem) => formatDate(row.DateEnd)
    });
  }

  public ngOnChanges(): void {
    this.refresh();
  }

  public handlePage(e: PageEvent): void {
    this.updateDataCollection({
      skip: e.pageIndex * e.pageSize,
      page: e.pageIndex,
      pageSize: e.pageSize
    });
  }

  private refresh(): void {
    this.updateDataCollection();
    if (this.paginator) {
      this.paginator.firstPage();
    }
  }

  private async addColumnDef(def: IColumn): Promise<void> {
    const column = new Column();
    column.id = def.id;
    column.title = await this.translationProvider.get(def.title).toPromise();
    column.getValue = def.getValue;
    column.getTitle = () => column.title;
    this.columnDefs.push(column);
  }

  private updateDataCollection(state?: { page: number, pageSize: number, skip: number }): void {
    if (state) {
      this.stateCached = state;
    }
    if (!this.stateCached) {
      this.stateCached = {
        skip: this.paginatorConfig.index * this.paginatorConfig.size,
        page: this.paginatorConfig.index,
        pageSize: this.paginatorConfig.size
      };
    }

    const table = this.activatedRoute.snapshot.paramMap.get('table');
    this.dataCollection = {
      tableName: table,
      totalCount: this.stateOverviewItems.length,
      Data: getLocalDataForPage(this.stateOverviewItems, this.stateCached)
    };
  }
}
