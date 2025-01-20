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

import { Component, Input, Signal, computed } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { DataViewSource } from '../data-view-source';

@Component({
  selector: 'imx-data-view-paginator',
  templateUrl: './data-view-paginator.component.html',
  styleUrls: ['./data-view-paginator.component.scss'],
})
export class DataViewPaginatorComponent {
  /**
   * Input the dataViewSource service. It handles all the action and the data loading. This input property is required.
   */
  @Input({ required: true }) public dataSource: DataViewSource;
  /**
   * Signal get page size from DataViewSource state signal.
   */
  public pageSize: Signal<number> = computed(() =>
    this.dataSource.showOnlySelected()
      ? this.dataSource.selection.selected.length
      : this.dataSource.state().PageSize || this.dataSource.pageSizeOptions[0],
  );
  /**
   * Signal calculates the page index from DataViewSource state signal and pageSize.
   */
  public pageIndex: Signal<number> = computed(() => {
    return this.dataSource.showOnlySelected() ? 0 : (this.dataSource.state().StartIndex || 0) / this.pageSize();
  });
  /**
   * Signal hide page size selection UI from the user when the DataViewSource total count is lower the the lowest page size option.
   */
  public hidePageSize: Signal<boolean> = computed(
    () => this.dataSource.totalCount() < this.dataSource.pageSizeOptions[0] || this.dataSource.showOnlySelected(),
  );
  public totalCount: Signal<number> = computed(() =>
    this.dataSource.showOnlySelected() ? this.dataSource.selection.selected.length : this.dataSource?.totalCount(),
  );

  /**
   * Update the DataViewSource state and reload the table data on pagination change.
   * @param event The current page state from the mat-paginator.
   */
  public async onStateChanged(event: PageEvent): Promise<void> {
    this.dataSource.state.update((state) => ({ ...state, PageSize: event.pageSize, StartIndex: event.pageIndex * event.pageSize }));
    if (this.dataSource.isDataLocal) this.localPagination();
    else await this.dataSource.updateState();
  }

  /**
   * Paginate the local data copy and update the collection data.
   */
  private localPagination(): void {
    this.dataSource.collectionData.update((collectionData) => ({
      ...collectionData,
      Data: this.dataSource.getLocalPage(this.dataSource.localDataCopy),
    }));
  }
}
