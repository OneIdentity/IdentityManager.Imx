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

import { ObjectHistoryEvent, TypedEntityCollectionData } from 'imx-qbm-dbts';
import { ObjectHistoryParameters } from '../object-history.service';
import { SettingsService } from '../../settings/settings-service';

interface IColumn {
  id: string;
  title: string;
  getValue: (row: ObjectHistoryEvent) => string;
}
class Column implements IColumn {
  public id: string;
  public getTitle: () => string;
  public getValue: (row: ObjectHistoryEvent) => string;
  public title: string;
}

function getLocalDataForPage<T>(allData: T[], state: { page: number, pageSize: number, skip: number }): T[] {
  if (state) {
    const currentIndex = state.page * state.pageSize;
    return allData.slice(currentIndex, currentIndex + state.pageSize);
  }

  return allData;
}

// TODO: One class per file.
// tslint:disable-next-line: max-classes-per-file
@Component({
  selector: 'imx-object-history-gridview',
  templateUrl: './object-history-gridview.component.html',
  styleUrls: ['./object-history-gridview.component.scss']
})
export class ObjectHistoryGridviewComponent implements OnInit, OnChanges {
  @Input() public historyData: ObjectHistoryEvent[];
  @ViewChild(MatPaginator) private paginator: MatPaginator;

  public get columns(): string[] {
    return this.columnDefs.map(c => c.id);
  }

  public dataCollection: TypedEntityCollectionData<ObjectHistoryEvent>;
  public columnDefs: Column[] = [];
  public paginatorConfig = {
    index: 0,
    size: 5,
    sizeOptions: [20, 50, 100],
    showFirstLastButtons: false,
    hidden: false
  };

  private displayChangeTypePropertyChange = 'PropertyChange';
  private stateCached: { page: number, pageSize: number, skip: number };
  private parameters: ObjectHistoryParameters;

  constructor(
    private activatedRoute: ActivatedRoute,
    private translationProvider: TranslateService,
    settings: SettingsService,
  ) {
    this.paginatorConfig.size = settings.DefaultPageSize;
  }

  public async ngOnInit(): Promise<void> {
    await this.addColumnDef({
      id: 'ChangeTime',
      title: '#LDS#Modified on',
      getValue: (row: ObjectHistoryEvent) => new Date(row.ChangeTime).toLocaleString(this.translationProvider.currentLang)
    });
    await this.addColumnDef({
      id: 'ChangeType',
      title: '#LDS#Type of change',
      getValue: (row: ObjectHistoryEvent) => row.ChangeType
    });
    await this.addColumnDef({
      id: 'LongDisplay',
      title: '#LDS#Name',
      getValue: (row: ObjectHistoryEvent) => row.LongDisplay
    });
    await this.addColumnDef({
      id: 'Property',
      title: '#LDS#Type',
      getValue: (row: ObjectHistoryEvent) => row.Property
    });
    await this.addColumnDef({
      id: 'User',
      title: '#LDS#User',
      getValue: (row: ObjectHistoryEvent) => row.User
    });
    this.parameters = {
      table: this.activatedRoute.snapshot.paramMap.get('table'),
      uid: this.activatedRoute.snapshot.paramMap.get('uid')
    };

    this.displayChangeTypePropertyChange = await this.translationProvider.get('#LDS#PropertyChange').toPromise();
  }

  public ngOnChanges(): void {
    this.parameters = {
      table: this.activatedRoute.snapshot.paramMap.get('table'),
      uid: this.activatedRoute.snapshot.paramMap.get('uid')
    };
    this.refresh();
  }

  public handlePage(e: PageEvent): void {
    this.updateDataCollection({
      skip: e.pageIndex * e.pageSize,
      page: e.pageIndex,
      pageSize: e.pageSize
    });
  }

  public isPropertyChange(row: ObjectHistoryEvent): boolean {
    return row.ChangeType === this.displayChangeTypePropertyChange;
  }

  public isEmpty(value: string): boolean {
    return value === undefined || value === null || value.length === 0;
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

    this.dataCollection = {
      tableName: this.parameters.table,
      totalCount: this.historyData.length,
      Data: getLocalDataForPage(this.historyData, this.stateCached)
    };
  }
}
