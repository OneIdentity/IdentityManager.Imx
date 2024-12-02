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

import { Component, effect, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl } from '@angular/forms';
import { FilterType } from '@imx-modules/imx-qbm-dbts';
import { debounceTime } from 'rxjs/operators';
import { DataViewSource } from '../data-view-source';
import { KeywordFilter, SelectedFilterType } from '../data-view.interface';

@Component({
  selector: 'imx-data-view-search',
  templateUrl: './data-view-search.component.html',
})
export class DataViewSearchComponent implements OnInit {
  /**
   * Input the dataViewSource service. It handles all the action and the data loading. This input property is required.
   */
  @Input({ required: true }) public dataSource: DataViewSource;
  /**
   * Event to emit all the search params on change.
   */
  @Output() public onSearchChange = new EventEmitter<string>();
  /**
   * FormControl to tracks the value and valueChange on eui-search component.
   */
  public searchControl: FormControl<string> = new FormControl('', { nonNullable: true });
  /**
   * Private reset property to not call search accidentally.
   */
  private reset = false;
  private searchParams: string | undefined;

  constructor() {
    effect(() => {
      const newSearchParams = this.dataSource.state().search;
      if (newSearchParams !== this.searchParams) {
        this.searchParams = newSearchParams;
        this.onSearchChange.emit(newSearchParams);
        this.searchControl.setValue(newSearchParams || '', { emitEvent: false });
      }
    });
  }

  public ngOnInit(): void {
    // Call onSearch on searchControl valueChange after a 1000ms standby.
    this.searchControl.valueChanges.pipe(debounceTime(1000)).subscribe((value) => this.onSearch(value));
  }

  /**
   * Update DataViewSource setKeywords signal and reload data.
   * @param keywords The value of the searchControl.
   */
  public onSearch(keywords: string): void {
    if (this.reset) {
      this.reset = false;
      return;
    }

    this.dataSource.setKeywords(keywords);
  }

  /**
   * Add all keywords in searchControl value to the DataViewSource selectedfilters signal.
   */
  public onAssignKeywords(): void {
    setTimeout(() => {
      if (this.isSearchEmpty) {
        return;
      }
      this.reset = true;
      let keywords = this.searchControl.value
        .split(' ')
        .map((item) => item.trim())
        .filter(
          (item) =>
            item?.length > 0 &&
            !this.dataSource.selectedFilters().some((filter) => filter.type === SelectedFilterType.Keyword && filter.value === item),
        );
      this.dataSource.selectedFilters.update((filters) => [
        ...filters,
        ...keywords.map((keyword) => ({ type: SelectedFilterType.Keyword, value: keyword }) as KeywordFilter),
      ]);
      this.dataSource.state.update((state) => ({
        ...state,
        filter: [...(state.filter || []), ...keywords.map((keyword) => ({ Type: FilterType.Search, Value1: keyword }))],
      }));
      this.searchControl.reset('');
      this.reset = false;
    });
  }

  /**
   * Calcuates the searchControls is really empty or not.
   */
  private get isSearchEmpty(): boolean {
    return this.searchControl.value == null ||
      (typeof this.searchControl.value === 'string' && this.searchControl.value.trim().length === 0)
      ? true
      : false;
  }
}
