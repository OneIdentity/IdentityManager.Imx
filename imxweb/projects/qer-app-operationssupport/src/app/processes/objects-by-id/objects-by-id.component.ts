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

import { OverlayRef } from '@angular/cdk/overlay';
import { Component, ViewChild } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatRadioChange } from '@angular/material/radio';
import { EuiLoadingService } from '@elemental-ui/core';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { FormControl } from '@angular/forms';

import { HistoryOperation } from 'imx-api-qbm';
import { TypedEntityCollectionData } from 'imx-qbm-dbts';
import { SettingsService } from 'qbm';
import { ObjectByIdService } from './object-by-id.service';

function getLocalDataForPage<T>(allData: T[], state: { page: number; pageSize: number; skip: number }): T[] {
  if (state) {
    const currentIndex = state.page * state.pageSize;
    return allData.slice(currentIndex, currentIndex + state.pageSize);
  }

  return allData;
}

@Component({
  selector: 'imx-objects-by-id',
  templateUrl: './objects-by-id.component.html',
  styleUrls: ['./objects-by-id.component.scss'],
})
export class ObjectsByIdComponent {
  public filterOptions = [
    { name: '#LDS#Currently running processes', value: 2 },
    { name: '#LDS#Completed operations', value: 1 },
  ];
  public selectedType = this.filterOptions[0].value;
  public processId: string;
  public searchControl = new FormControl('');
  public isShowGraph = false;
  public historyData: HistoryOperation[] = [];

  public noDataText = '#LDS#There are currently no operations matching the given process ID.';

  public dataCollection: TypedEntityCollectionData<HistoryOperation>;
  private stateCached: { page: number; pageSize: number; skip: number };
  @ViewChild(MatPaginator) private paginator: MatPaginator;
  public paginatorConfig = {
    index: 0,
    size: 5,
    sizeOptions: [20, 50, 100],
    showFirstLastButtons: false,
    hidden: false,
  };

  constructor(private busyService: EuiLoadingService, private objectByIdService: ObjectByIdService, private settings: SettingsService) {
    this.paginatorConfig.size = this.settings.DefaultPageSize;
    this.searchControl.valueChanges
      .pipe(distinctUntilChanged(), debounceTime(300))
      .subscribe(async () => await this.search(this.searchControl.value));
  }

  public async typeChanged(evt: MatRadioChange) {
    this.selectedType = evt.value;
    if (evt.value === 1) {
      await this.getChangeOperation();
    }
  }

  public async getChangeOperation(): Promise<void> {
    let overlayRef: OverlayRef;
    setTimeout(() => (overlayRef = this.busyService.show()));
    try {
      this.historyData = (await this.objectByIdService.getChangeOperation(this.processId)).Events;
    } catch {
      this.historyData = [];
    } finally {
      this.updateDataCollection();

      setTimeout(() => this.busyService.hide(overlayRef));
    }
  }

  private async search(term: string): Promise<void> {
    this.processId = term;
    await this.getChangeOperation();
  }

  private updateDataCollection(state?: { page: number; pageSize: number; skip: number }): void {
    if (state) {
      this.stateCached = state;
    }
    if (!this.stateCached) {
      this.stateCached = {
        skip: this.paginatorConfig.index * this.paginatorConfig.size,
        page: this.paginatorConfig.index,
        pageSize: this.paginatorConfig.size,
      };
    }

    this.dataCollection = {
      totalCount: this.historyData.length,
      Data: getLocalDataForPage(this.historyData, this.stateCached),
    };
  }

  public isEmpty(value: string): boolean {
    return value === undefined || value === null || value.length === 0;
  }

  public handlePage(e: PageEvent): void {
    this.updateDataCollection({
      skip: e.pageIndex * e.pageSize,
      page: e.pageIndex,
      pageSize: e.pageSize,
    });
  }
}
