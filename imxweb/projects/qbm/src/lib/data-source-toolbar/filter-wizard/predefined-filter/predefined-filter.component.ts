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

import { AfterViewInit, Component, EventEmitter, Inject, Input, NgZone, OnDestroy, OnInit, Output, QueryList, ViewChildren } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MatCardContent } from '@angular/material/card';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { MatSelectChange } from '@angular/material/select';
import { MatTableDataSource } from '@angular/material/table';
import { EUI_SIDESHEET_DATA } from '@elemental-ui/core';
import { CollectionLoadParameters, DataModelFilterOption, TypedEntity } from 'imx-qbm-dbts';
import { Subscription } from 'rxjs/internal/Subscription';
import { DataSourceToolbarFilter, DataSourceToolbarSelectedFilter } from '../../data-source-toolbar-filters.interface';
import { DataSourceToolbarSettings } from '../../data-source-toolbar-settings';
import { DSTViewConfig } from '../../data-source-toolbar-view-config.interface';
import { FilterFormState, FilterTypeIdentifier, FilterWizardSidesheetData } from '../filter-wizard.interfaces';
import { FilterWizardService } from '../filter-wizard.service';

@Component({
  selector: 'imx-predefined-filter',
  templateUrl: './predefined-filter.component.html',
  styleUrls: ['./predefined-filter.component.scss'],
})
export class PredefinedFilterComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input() public settings: DataSourceToolbarSettings;

    /**
   * The DataSourceToolbar's ID generated in data-source-toolbar.component.ts
   */
    @Input() public id: string;

  /**
   * List of filter names that should be hidden
   * Allows overrides to the underlying DataModelFilter defined filters
   * Overrides should be in the form of a string matching the `DataModelFilter.Name` property of the filter to hide. E.g 'namespace'
   */
  @Input() public get hiddenFilters(): string[] {
    return Array.from(this.hiddenFilterSet);
  }
  public set hiddenFilters(value: string[]) {
    this.hiddenFilterSet = new Set(value);
  }

  /**
   * If set to 'false' (= default) pagination, filtering etc is done on the server side.
   * The server will send chunks of data, when the user clicks on next/previous page button and DST will handle the response.
   * If set to 'true' the server will send all data in one go. DST will internally handle page sizing and navigation.
   */
  @Input() public isDataSourceLocal = false;

  /**
   * The list of filters currently applied
   */
  @Input() public selectedFilters: DataSourceToolbarSelectedFilter[] = [];
  public internalSelectedFilters: DataSourceToolbarSelectedFilter[] = [];

  /**
   * Occurs when a selectedFilter that is marked as custom is removed from the selectedFilters array
   */
  @Output() public customSelectedFilterRemoved = new EventEmitter<DataSourceToolbarSelectedFilter>();

  /**
   * Occurs when user presses next/previous page button or changes the page size.
   */
  @Output() public navigationStateChanged = new EventEmitter<CollectionLoadParameters>();

  /**
   * Occurs when the datasource toolbar settings object has changed.
   *
   * NOTE: An event is emitted only when the whole settings object has changed.
   * It will not fire if only parts - like the entity schema, or the datasource - changes.
   */
  @Output() public settingsChanged = new EventEmitter<DataSourceToolbarSettings>();

  /**
   * The list of search terms currently applied
   */
  public searchTerms: DataSourceToolbarSelectedFilter[] = [];

  public hiddenFilterSet: Set<string> = new Set([]);
  public filterOptionLengthThreshold = 5;

  /**
   * This is the mat table datasource.
   */
  public internalDataSource: MatTableDataSource<TypedEntity> = new MatTableDataSource<TypedEntity>([]);

  private readonly subscriptions: Subscription[] = [];
  private formState: FilterFormState;
  private filterTypeIndentifier: FilterTypeIdentifier = FilterTypeIdentifier.Predefined;

  /**
   * @ignore Used internally.
   * Filters the data source with these arguments locally.
   * Will only be used, when 'isDataSourceLocal' is set to true.
   */
  private localFilterState: {
    filterColumns: { [column: string]: string };
    searchColumns: string[];
    keywords: string;
  } = {
    filterColumns: {},
    searchColumns: [],
    keywords: '',
  };

  constructor(private readonly filterService: FilterWizardService, @Inject(EUI_SIDESHEET_DATA) public data?: FilterWizardSidesheetData) {
    // this.hiddenFilters = ['namespace'];
    this.id = data.id;
    this.settings = data.settings;
    this.selectedFilters = data.selectedFilters;
    this.internalSelectedFilters = Object.create(this.selectedFilters);
    this.formState = { canClearFilters: this.selectedFilters.length > 0, dirty: false, filterIdentifier: FilterTypeIdentifier.Predefined };

    this.subscriptions.push(
      this.filterService.applyFiltersEvent.subscribe(() => {
        this.applyFilters();
      })
    );

    this.subscriptions.push(
      this.filterService.clearFiltersEvent.subscribe(() => {
        this.clearFilters();
      })
    );
  }

  public ngAfterViewInit(): void {
  }

  public ngOnInit(): void {
    this.filterService.formStatusChanged(this.formState);
  }

  public ngOnDestroy(): void {
    this.subscriptions.forEach((s) => s.unsubscribe());
  }

  public onCheckboxFilterChanged(filter: DataSourceToolbarFilter, option: DataModelFilterOption, event: MatCheckboxChange): void {
    let selectedFilterData: DataSourceToolbarSelectedFilter;
    if (event.checked) {
      if (filter.Delimiter) {
        this.setDelimitedFilterCurrentValue(filter, option);
      } else {
        filter.CurrentValue = option.Value;
      }
      selectedFilterData = { selectedOption: option, filter };
      this.internalSelectedFilters.push(selectedFilterData);
    } else {
      this.removeSelectedFilter(filter, false, option.Value);
    }
    this.formState.dirty = true;
    this.filterService.formStatusChanged(this.formState);
  }

  public getMultiSelectCurrentValue(filter: DataSourceToolbarFilter): string[] {
    let display = [];
    if (filter.Delimiter && filter.CurrentValue) {
      display = filter.CurrentValue.split(filter.Delimiter);
    }
    return display;
  }

  public multiSelectFilterValueChange(filter: DataSourceToolbarFilter, event: MatSelectChange): void {
    filter.CurrentValue = undefined;
    const relevantSelectedItems = this.internalSelectedFilters.filter((sfilter) => sfilter.filter.Name === filter.Name);
    relevantSelectedItems.forEach((rsi) => {
      this.removeSelectedFilter(filter, false, rsi.selectedOption.Value);
    });
    event.value.forEach((value) => {
      const option = this.findFilterOptionFromValue(value, filter);
      this.internalSelectedFilters.push({ selectedOption: option, filter });
    });
    this.rebuildSelectedDelimitedValue(filter);
    this.formState.dirty = true;
    this.filterService.formStatusChanged(this.formState);
  }

  public onRadioFilterChanged(filter: DataSourceToolbarFilter, option: DataModelFilterOption): void {
    let selectedFilterData: DataSourceToolbarSelectedFilter;
    filter.CurrentValue = option ? option.Value : undefined;
    selectedFilterData = { selectedOption: option, filter };
    const index = this.findSelectedFilterIndex(filter.Name);
    if (index >= 0) {
      this.internalSelectedFilters[index] = selectedFilterData;
    } else {
      this.internalSelectedFilters.push(selectedFilterData);
    }
    this.formState.dirty = true;
    this.filterService.formStatusChanged(this.formState);
  }

  public selectFilterValueChanged(filter: DataSourceToolbarFilter, event: MatSelectChange): void {
    const option = this.findFilterOptionFromValue(event.value, filter);
    this.onRadioFilterChanged(filter, option);
    this.formState.dirty = true;
    this.filterService.formStatusChanged(this.formState);
  }

  /**
   * Applys all filters saved in DSTViewConfig.AdditionalParameters to the selected filters
   * @param config DSTViewConfig used to get and apply filters from
   */
  public applyDynamicPropsAsSelectedFilters(config: DSTViewConfig): void {
    // Handle filters from dynamic properties
    Object.entries(config.AdditionalParameters).forEach(([filterName, value]) => {
      const filter = this.getSelectedFilterFromName(filterName, value);
      if (filter) {
        this.internalSelectedFilters.push(filter);
      }
    });
  }

  /**
   * Finds the filter in settings.filter with the same filterName, applies the value and returns the filter
   * @param filterName name of the filter
   * @param value value of the filter
   * @returns the filter with the selected option
   */
  public getSelectedFilterFromName(filterName: string, value: string): DataSourceToolbarSelectedFilter {
    const filter = this.settings.filters?.find((filter) => filter.Name === filterName);
    if (filter) {
      filter.CurrentValue = value;
      const selectedOption = this.findFilterOptionFromValue(value, filter);
      return { filter, selectedOption };
    }
  }

  public removeSelectedFilter(
    filter: DataSourceToolbarFilter,
    emitChange: boolean = true,
    optionValue?: string,
    selectedFilter?: DataSourceToolbarSelectedFilter
  ): void {
    filter.CurrentValue = undefined;
    const index = this.findSelectedFilterIndex(filter.Name, optionValue);
    if (index >= 0) {
      this.internalSelectedFilters.splice(index, 1);

      // If filter allows delimited values then we need to only remove the selected option and rebuild
      // currentValue to include any other selected options
      if (filter.Delimiter) {
        this.rebuildSelectedDelimitedValue(filter);
      }

      // If the selected filter is custom, emit the custom event
      // to allow calling code to handle the change
      if (selectedFilter && selectedFilter.isCustom) {
        this.customSelectedFilterRemoved.emit(selectedFilter);
      }

      // Emit the navigation change event if `emitChange` is true and the filter is not custom
      // (custom filters changes can be responded to through the customSelectedFilterRemoved emitter)
      // if (emitChange && !selectedFilter?.isCustom) {
      //   this.updateNavigateStateWithFilters();
      // }
    }
  }

  /**
   * @ignore Used internally.
   * Is called internally when the clear all filters menu option is clicked
   * Clears all selected filter values and updates and emits the new navigationState
   */
  private clearFilters(emit = true): void {
    this.settings.filters?.forEach((filter) => (filter.CurrentValue = undefined));
    const containsCustomFilters = this.selectedFiltersContainsCustomFilters();
    if (containsCustomFilters) {
      this.customSelectedFilterRemoved.emit();
    }
    this.selectedFilters = [];
    this.internalSelectedFilters = [];
    this.updateNavigateStateWithFilters(emit);
  }

  private applyFilters(): void {
    this.updateNavigateStateWithFilters();
  }

  /**
   * @ignore Used internally
   * Attempts to find any selected filters that are marked as isCustom
   * Returns a boolean indicating if any are found or not
   */
  private selectedFiltersContainsCustomFilters(): boolean {
    let containsCustom = false;
    const result = this.internalSelectedFilters.find((sf) => sf.isCustom);
    containsCustom = result !== undefined;
    return containsCustom;
  }

  /**
   * @ignore Used internally
   * Loops over the filters and adds any selected filters to the navigation state
   * as query parameters, and emits a navigationStateChanged event to let calling code know of the change
   *
   * If the datasource is local, will apply the filters here and emit a settingsChanged signal instead of a navigationStateChanged
   */
  private updateNavigateStateWithFilters(emit = true): void {
    this.selectedFilters = Object.create(this.internalSelectedFilters);
    this.settings.filters?.forEach((filter) => {
      if (filter.CurrentValue) {
        this.settings.navigationState[filter.Name] = filter.CurrentValue;
        if (filter?.Column) {
          // This is a local filter and we must filter over this column
          this.localFilterState.filterColumns[filter.Column] = filter.CurrentValue;
        }
      } else {
        delete this.settings.navigationState[filter.Name];
        if (filter?.Column) {
          delete this.localFilterState.filterColumns[filter.Column];
        }
      }
    });
    this.settings.navigationState.StartIndex = 0;
    if (!emit) {
      return;
    }
    if (this.isDataSourceLocal) {
      // Do filter locally
      this.localFilter();
    } else {
      this.filterService.updateNavigation(this.id, this.settings.navigationState, this.selectedFilters);
    }
  }

  /**
   * @ignore Used internally in components template.
   * Updates the filters current value to add supplied option delimited when needed
   */
  private setDelimitedFilterCurrentValue(filter: DataSourceToolbarFilter, option: DataModelFilterOption): void {
    if (filter.CurrentValue && filter.CurrentValue.length) {
      filter.CurrentValue = filter.CurrentValue += `${filter.Delimiter}${option.Value}`;
    } else {
      filter.CurrentValue = option.Value;
    }
  }

  /**
   * @ignore Used internally
   * Finds the relevant DataModelFilterOption from the supplied option value and filter
   */
  private findFilterOptionFromValue(optionValue: string, filter: DataSourceToolbarFilter): DataModelFilterOption {
    const index = filter.Options.map((opt) => opt.Value).indexOf(optionValue);
    return filter.Options[index];
  }

  /**
   * @ignore Used internally
   * Attempts to find an existing selected filter matching the given name.
   * Returns the index or -1 if no match was found
   */
  private findSelectedFilterIndex(filterName: string, optionValue?: string): number {
    let index: number;
    if (optionValue) {
      index = this.internalSelectedFilters.map((f) => f.filter.Name + f.selectedOption.Value).indexOf(filterName + optionValue);
    } else {
      index = this.internalSelectedFilters.map((f) => f.filter.Name).indexOf(filterName);
    }
    return index;
  }

  /**
   * @ignore Used internally in components template.
   * Updates the current value of a filter based on all the selected options with the delimiters
   */
  private rebuildSelectedDelimitedValue(filter: DataSourceToolbarFilter): void {
    let val = '';
    this.internalSelectedFilters.forEach((sfilter) => {
      if (sfilter.filter.Name === filter.Name) {
        val += `${sfilter.selectedOption.Value}${filter.Delimiter}`;
      }
    });
    filter.CurrentValue = val.length ? val.slice(0, -1) : undefined;
  }

  private localFilter(): void {
    this.applyLocalPredicate();
    this.applyLocalFilter();
  }

  private applyLocalPredicate(): void {
    this.internalDataSource.filterPredicate = (data: TypedEntity, filter: string) => {
      const entity = data.GetEntity();

      // Search with OR statement over keywords and search terms
      let searchResult = false;
      for (let column of this.localFilterState.searchColumns) {
        const val = (entity.GetColumn(column).GetValue() as string).toLocaleLowerCase();
        searchResult = this.localFilterState.keywords ? val.includes(this.localFilterState.keywords.toLocaleLowerCase()) : false;
        // Allow for short circuiting
        searchResult &&= this.searchTerms.every((term) => val.includes(term.selectedOption.Display));
        if (searchResult) {
          // Exit for loop if we have a positive hit
          break;
        }
      }

      // Filter with AND statement
      let filterResult = true;
      if (Object.keys(this.localFilterState.filterColumns).length > 0) {
        // If there are terms to filter over do so
        filterResult = Object.entries(this.localFilterState.filterColumns).every(([column, value]) => {
          return value.toLocaleLowerCase().includes((entity.GetColumn(column).GetValue() as string).toLocaleLowerCase());
        });
      }

      // Combine with an AND
      return searchResult && filterResult;
    };
  }

  private applyLocalFilter(): void {
    this.internalDataSource.filter = 'Not Empty';
    this.settings.dataSource = {
      Data: this.internalDataSource.filteredData,
      totalCount: this.internalDataSource.filteredData.length,
    };
    this.settingsChanged.emit(this.settings);
  }
}
