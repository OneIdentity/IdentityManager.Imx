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

import { Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';

import { HistoryFilterMode } from 'imx-api-qer';
import { DataSourceToolbarComponent, DataSourceToolbarFilter, DataSourceToolbarSelectedFilter } from 'qbm';

@Component({
  selector: 'imx-history-filter',
  templateUrl: './history-filter.component.html',
  styleUrls: ['./history-filter.component.scss'],
})
export class HistoryFilterComponent implements OnChanges {
  @Input() public dst?: DataSourceToolbarComponent;
  @Input() public filter: DataSourceToolbarFilter[];
  @Input() public filtermode: HistoryFilterMode;
  @Output() public selectedFiltersChanged = new EventEmitter<HistoryFilterMode>();

  public options: { display: string; value: HistoryFilterMode; checked: boolean; initialValue: string }[] = [];
  public modeFilter: DataSourceToolbarFilter;

  public ngOnChanges(): void {
    this.modeFilter = this.filter?.find((elem) => elem.Name === 'filtermode');
    this.options = this.modeFilter?.Options.map((elem) => ({
      display: elem.Display,
      value: this.convertToFilter(elem.Value),
      initialValue: elem.Value,
      checked: this.isChecked(elem.Value),
    }));
    this.updateFilter(false);
  }

  public onCustomFilterClearedExternally(sf?: DataSourceToolbarSelectedFilter): void {
    setTimeout(() => {
      if (!sf) {
        this.options.forEach((elem) => (elem.checked = false));
      } else {
        const filter = this.options.find((elem) => elem.initialValue === sf.selectedOption.Value);
        if (filter) {
          filter.checked = false;
        }
      }
      this.updateFilter(true);
    });
  }

  public updateFilter( emit: boolean = true): void {
    const checked = this.options?.filter((elem) => elem.checked);
    if (!checked)
     {
      return;
    }

    this.dst.selectedFilters = [];
    this.options.forEach((element) => {
      if (element.checked) {
        this.dst.selectedFilters.push({
          selectedOption: { Value: element.initialValue, Display: element.display },
          filter: { Name: 'filtermodel' },
          isCustom: true,
        });
      }
    });
    if (emit) {
      const filtermode = this.options.filter((elem) => elem.checked);
      let applyedfilter = HistoryFilterMode.None;

      filtermode.forEach((element) => {
        // tslint:disable-next-line: no-bitwise
        applyedfilter |= element.value;
      });
      this.selectedFiltersChanged.emit(applyedfilter);
    }
  }

  public resetFilter(): void {
    this.options.forEach((elem) => {
      elem.checked = [HistoryFilterMode.SameAccProduct, HistoryFilterMode.SameStep].includes(elem.value);
    });
    this.updateFilter(true);
  }

  private isChecked(id: string): boolean {
    const value = this.convertToFilter(id);
    // tslint:disable-next-line: no-bitwise
    return (this.filtermode & value) === value;
  }

  private convertToFilter(value: string): HistoryFilterMode {
    switch (value) {
      case '1':
        return HistoryFilterMode.SameAccProduct;
      case '2':
        return HistoryFilterMode.SameRecipient;
      case '4':
        return HistoryFilterMode.SameStep;
      default:
        return HistoryFilterMode.None;
    }
  }
}
