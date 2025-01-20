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

import { Component, Input, Signal, WritableSignal, computed } from '@angular/core';
import { FilterType } from '@imx-modules/imx-qbm-dbts';
import { DataSourceToolbarFilter } from '../../data-source-toolbar/data-source-toolbar-filters.interface';
import { DataViewSource } from '../data-view-source';
import { ExpressionFilter, KeywordFilter, SelectedFilter, SelectedFilterType } from '../data-view.interface';

/**
 * @example
 * <imx-data-view-chipbar [dataSource]="dataSource"></imx-data-view-chipbar>
 */
@Component({
  selector: 'imx-data-view-chipbar',
  templateUrl: './data-view-chipbar.component.html',
  styleUrls: ['./data-view-chipbar.component.scss'],
})
export class DataViewChipbarComponent {
  /**
   * Input the dataViewSource service. It handles all the action and the data loading. This input property is required.
   */
  @Input({ required: true }) public dataSource: DataViewSource;
  /**
   * Signal, that filtering the all the selected predefinedFilter.
   */
  public predefinedFilters: Signal<DataSourceToolbarFilter[]> = computed(() => {
    let filters: DataSourceToolbarFilter[] = [];
    this.dataSource
      .predefinedFilters()
      .filter((filter) => !!filter?.CurrentValue)
      .map((filter) => {
        if (!!filter.Delimiter) {
          filter.CurrentValue?.split(filter.Delimiter).map((splitedValue) => {
            filters.push({ ...filter, CurrentValue: splitedValue });
          });
        } else {
          filters.push(filter);
        }
      });
    return filters;
  });

  /**
   * Signal, that filtering the all the selected externalFilter.
   */
  public externalFilters: Signal<DataSourceToolbarFilter[]> = computed(() => {
    let filters: DataSourceToolbarFilter[] = [];
    this.dataSource
      .externalFilters()
      .filter((filter) => !!filter?.CurrentValue)
      .map((filter) => {
        if (!!filter.Delimiter) {
          filter.CurrentValue?.split(filter.Delimiter).map((splitedValue) => {
            filters.push({ ...filter, CurrentValue: splitedValue });
          });
        } else {
          filters.push(filter);
        }
      });
    return filters;
  });

  /**
   * Signal, that filters all the search type filters.
   */
  public keywords: Signal<KeywordFilter[]> = computed(
    () => this.dataSource.selectedFilters().filter((filter) => filter.type === SelectedFilterType.Keyword) as KeywordFilter[],
  );
  /**
   * Signal, that filter all the custom filters.
   */
  public customFilters: Signal<ExpressionFilter[]> = computed(
    () => this.dataSource.selectedFilters().filter((filter) => filter.type === SelectedFilterType.Custom) as ExpressionFilter[],
  );

  /**
   * Signal, that calculates the chip bar existence.
   */
  public showChipBar: Signal<boolean> = computed(
    () =>
      this.dataSource.selectedFilters()?.length > 0 ||
      this.predefinedFilters().length > 0 ||
      !!this.dataSource.filterTreeSelection() ||
      this.dataSource.externalFilters().length > 0,
  );

  public showResetButton: Signal<boolean> = computed(
    () =>
      (this.keywords()?.length || 0) +
        (this.customFilters()?.length || 0) +
        (this.predefinedFilters()?.length || 0) +
        (this.externalFilters()?.length || 0) >
      1,
  );

  /**
   * Return the filter selected option display value.
   * @param item selected filter
   * @returns The display of the filter.
   */
  public getFilterDisplay(item: DataSourceToolbarFilter): string {
    if (item.CurrentValue == null) {
      return '';
    }
    let found = item.Options?.find((element) => element.Value === item.CurrentValue);
    return found?.Display || '';
  }

  /**
   * Remove the selected filter from the DataViewSource selectedFilters signal and from the DataViewSource state signal
   * @param item The selected filter.
   */
  public removeItem(item: SelectedFilter): void {
    this.dataSource.selectedFilters.update((filters) => filters.filter((filter) => filter.value != item.value));

    switch (item.type) {
      case SelectedFilterType.Custom:
        this.dataSource.state.update((state) => ({
          ...state,
          filter: state.filter?.filter((filter) => filter.Type !== FilterType.Expression),
        }));
        break;
      case SelectedFilterType.Keyword:
        this.dataSource.state.update((state) => ({ ...state, filter: state.filter?.filter((filter) => filter.Value1 !== item.value) }));
        break;
    }
    if (this.dataSource.isDataLocal) this.dataSource.searchLocally();
    else this.dataSource.updateState();
  }

  /**
   * Remove the selected predefined filter from the DataViewSource predefinedFilters signal and from the DataViewSource state signal.
   * @param item The selected predefined filter.
   */
  public removeFilterItem(item: DataSourceToolbarFilter, source: WritableSignal<DataSourceToolbarFilter[]>): void {
    const updatedValue = !!item.Delimiter ? this.getUpdatedFilterValue(item, source()) : undefined;
    this.dataSource.state.update((state) => {
      if (item.Name) {
        state[item.Name] = updatedValue;
      }
      return state;
    });
    source.update((filters) =>
      filters.map((filter) => ({
        ...filter,
        CurrentValue: item.Name === filter.Name ? updatedValue : filter.CurrentValue,
      })),
    );
    this.dataSource.updateState();
  }

  /**
   * Remove the filter tree filter from the DataViewSource filterTreeSelection signal and from the DataViewSource state signal.
   */
  public removeFilterTree(): void {
    this.dataSource.state.update((state) => {
      const filter =
        state.filter?.filter((filter) => filter.ColumnName !== this.dataSource.filterTreeSelection()?.filter?.ColumnName) || [];
      return { ...state, filter };
    });
    this.dataSource.filterTreeSelection.set(undefined);
    this.dataSource.updateState();
  }

  /**
   * Clear all the filters from the chipbar.
   */
  public onClearAll(): void {
    this.dataSource.selectedFilters.set([]);
    this.dataSource.state.update((state) => ({ ...state, filter: undefined, search: undefined }));
    this.dataSource.predefinedFilters.update((predefinedFilters) =>
      predefinedFilters.map((filter) => {
        this.dataSource.state.update((state) => {
          if (filter.Name) {
            state[filter.Name] = undefined;
          }
          return state;
        });
        return { ...filter, CurrentValue: undefined };
      }),
    );
    this.dataSource.externalFilters.update((externalFilters) =>
      externalFilters.map((externalFilter) => {
        this.dataSource.state.update((state) => {
          if (externalFilter.Name) {
            state[externalFilter.Name] = undefined;
          }
          return state;
        });
        return { ...externalFilter, CurrentValue: undefined };
      }),
    );
    this.dataSource.filterTreeSelection.set(undefined);
    if (this.dataSource.isDataLocal) this.dataSource.searchLocally();
    else this.dataSource.updateState();
  }

  private getUpdatedFilterValue(item: DataSourceToolbarFilter, source: DataSourceToolbarFilter[]): string | undefined {
    let updateValue: string | undefined;
    const filter = source.find((filter) => filter.Name === item.Name);
    if (!!filter && !!filter.Delimiter) {
      updateValue = filter?.CurrentValue?.split(filter.Delimiter)
        .filter((value) => value !== item.CurrentValue)
        .join(filter.Delimiter);
    }
    return updateValue;
  }
}
