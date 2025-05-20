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

import { AfterViewInit, Component, EventEmitter, Inject, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { MatTableDataSource } from '@angular/material/table';
import { EUI_SIDESHEET_DATA, EuiSelectFeedbackMessages, EuiSelectOption } from '@elemental-ui/core';
import { CollectionLoadParameters, DataModelFilterOption, TypedEntity } from '@imx-modules/imx-qbm-dbts';
import { TranslateService } from '@ngx-translate/core';
import * as _ from 'lodash';
import { Subscription } from 'rxjs/internal/Subscription';
import { DataSourceToolbarFilter, DataSourceToolbarSelectedFilter } from '../../data-source-toolbar-filters.interface';
import { DataSourceToolbarSettings } from '../../data-source-toolbar-settings';
import { DSTViewConfig } from '../../data-source-toolbar-view-config.interface';
import { FilterFormState, FilterTypeIdentifier, FilterWizardSidesheetData } from '../filter-wizard.interfaces';
import { FilterWizardService } from '../filter-wizard.service';

enum FilterTypes {
  SingleCheck,
  MultiCheck,
  SelectCheck,
  MultiRadio,
  SelectRadio,
}
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
  @Input() public id: string | undefined;

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

  public filters: DataSourceToolbarFilter[] = [];

  public externalFilterId: string;

  /**
   * Holds a reference to the filter type enum for use in html
   */
  public filterTypeEnum = FilterTypes;

  /**
   * Mapping of the filters to their html element, currentValue control, and EUI options
   */
  public filterTypes: {
    type: FilterTypes | undefined;
    currentValue: FormControl;
    options: EuiSelectOption[];
  }[] = [];

  public feedbackMessages: EuiSelectFeedbackMessages;

  /**
   * Method to handle searching over options
   */
  public searchFunction = (option: EuiSelectOption, search: string): boolean =>
    option.display.toLocaleLowerCase().includes(search.toLocaleLowerCase());

  public isLoading: boolean = true;

  /**
   * This is the mat table datasource.
   */
  public internalDataSource: MatTableDataSource<TypedEntity> = new MatTableDataSource<TypedEntity>([]);

  private readonly subscriptions: Subscription[] = [];
  private formState: FilterFormState;

  /**
   * Value to specify the cutoff between a multi-x to a select-x field
   */
  private selectOptionThreshold = 5;

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

  constructor(
    private readonly filterService: FilterWizardService,
    private translateService: TranslateService,
    @Inject(EUI_SIDESHEET_DATA) public data?: FilterWizardSidesheetData,
  ) {
    // this.hiddenFilters = ['namespace'];
    this.id = data?.id;
    this.externalFilterId = 'externalFilter_' + this.data?.customIdentifier;
    this.settings = data?.settings ? Object.create(data.settings) : undefined;
    this.selectedFilters = data?.selectedFilters ?? [];
    this.filters = _.cloneDeep(data?.settings.filters) ?? [];
    this.getFilterTypes();
    this.internalSelectedFilters = Object.create(this.selectedFilters);
    this.formState = { canClearFilters: this.selectedFilters.length > 0, dirty: false, filterIdentifier: FilterTypeIdentifier.Predefined };

    this.subscriptions.push(
      this.filterService.applyFiltersEvent.subscribe(() => {
        this.applyFilters();
      }),
    );

    this.subscriptions.push(
      this.filterService.clearFiltersEvent.subscribe(() => {
        this.clearFilters();
      }),
    );

    this.feedbackMessages = {
      selected: this.translateService.instant('#LDS#{{value}} selected'),
      clear: this.translateService.instant('#LDS#Clear selection'),
      search: this.translateService.instant('#LDS#Search'),
      plusOther: this.translateService.instant('#LDS#and 1 more'),
      plusOtherPlural: this.translateService.instant('#LDS#and {{value}} more'),
      unsupportedCharacter: this.translateService.instant('#LDS#You are using unsupported characters.'),
      noResults: this.translateService.instant('#LDS#There is no data matching your search.'),
      clearAll: this.translateService.instant('#LDS#Clear selection'),
      ok: this.translateService.instant('#LDS#OK'),
      keyboardOptionsListAria: this.translateService.instant('#LDS#Use the arrow keys to select items.'),
    };
  }

  public ngAfterViewInit(): void {
    // workaround for UI problem -> panel is drawn as expanded before its got collapsed
    setTimeout(() => {
      this.isLoading = false;
    }, 500);
  }

  public ngOnInit(): void {
    this.filterService.formStatusChanged(this.formState);
  }

  public ngOnDestroy(): void {
    this.subscriptions.forEach((s) => s.unsubscribe());
  }

  /**
   * Creates a mapping of all the incoming filters, creates form controls and options for select-x fields
   */
  public getFilterTypes(): void {
    this.filterTypes = this.filters.map((filter) => ({
      type: this.determineFilterType(filter),
      currentValue: filter?.Delimiter
        ? new FormControl<string[]>(filter?.CurrentValue?.split(filter.Delimiter) ?? [])
        : new FormControl<string | undefined>(filter?.CurrentValue),
      options:
        filter.Options?.map((option: DataModelFilterOption) => ({
          display: option.Display ?? '',
          value: option.Value ?? '',
          option: option,
        })) ?? [],
    }));
  }

  /**
   * Determines which field we want to show on screen
   * @param filter current state of a filter
   * @returns The specific enum to generate a html element
   */
  public determineFilterType(filter: DataSourceToolbarFilter): FilterTypes | undefined {
    switch (true) {
      case filter?.Options?.length === 1:
        return FilterTypes.SingleCheck;
      case filter.Delimiter && (filter?.Options?.length ?? 0) <= this.selectOptionThreshold:
        return FilterTypes.MultiCheck;
      case filter.Delimiter && (filter?.Options?.length ?? 0) > this.selectOptionThreshold:
        return FilterTypes.SelectCheck;
      case !filter.Delimiter && (filter?.Options?.length ?? 0) <= this.selectOptionThreshold:
        return FilterTypes.MultiRadio;
      case !filter.Delimiter && (filter?.Options?.length ?? 0) > this.selectOptionThreshold:
        return FilterTypes.SelectRadio;
    }
  }

  /**
   * Determine if the option is in the current value for this filter
   * @param filter
   * @param fOption
   * @returns
   */
  public isMultiChecked(filter: DataSourceToolbarFilter, fOption: DataModelFilterOption): boolean {
    if (!fOption.Value || !filter.CurrentValue) return false;
    return filter.Delimiter
      ? filter.CurrentValue.split(filter.Delimiter).includes(fOption.Value)
      : filter.CurrentValue.includes(fOption.Value);
  }

  public onCheckboxFilterChanged(filter: DataSourceToolbarFilter, option: DataModelFilterOption, event: MatCheckboxChange): void {
    if (filter.Delimiter) {
      this.setDelimitedFilterCurrentValue(filter, option, event.checked);
    } else {
      // This is a single checkbox, so we use the event to set the current value
      filter.CurrentValue = event.checked ? option.Value : undefined;
    }
    const selectedFilterData: DataSourceToolbarSelectedFilter = { selectedOption: option, filter };
    const index = this.findSelectedFilterIndex(filter.Name);
    if (index >= 0) {
      this.internalSelectedFilters[index] = selectedFilterData;
    } else {
      this.internalSelectedFilters.push(selectedFilterData);
    }

    this.formState.dirty = true;
    this.filterService.formStatusChanged(this.formState);
  }

  /**
   * Handles the adding of new and removal of unselected filters. Also sets the current value using the delimiter
   * @param filter current filter having options changed
   * @param options option set to apply as filters
   */
  public onMultiSelectFilterChanged(filter: DataSourceToolbarFilter, options: EuiSelectOption | EuiSelectOption[]): void {
    // Add new options
    let selectedFilterData: DataSourceToolbarSelectedFilter;
    options.forEach((option) => {
      selectedFilterData = { selectedOption: option.option, filter };
      if (
        !this.internalSelectedFilters.some(
          (internalFilter) => internalFilter.filter?.Name === filter.Name && internalFilter.filter?.CurrentValue?.includes(option.value),
        )
      ) {
        // If this is a new selection
        this.internalSelectedFilters.push(selectedFilterData);
      }
    });
    // Check all selected filters for values not in the optionset, remove them
    const optionValues = options.map((option) => option.value);
    this.internalSelectedFilters.forEach((internalFilter) => {
      if (internalFilter.filter?.Name === filter.Name && !optionValues.includes(internalFilter.selectedOption?.Value)) {
        this.removeSelectedFilter(filter, false, internalFilter.selectedOption?.Value);
      }
    });
    // Set current value, mark dirty
    filter.CurrentValue = optionValues.join(filter.Delimiter);
    this.formState.dirty = true;
    this.filterService.formStatusChanged(this.formState);
  }

  public onRadioFilterChanged(filter: DataSourceToolbarFilter, option: any): void {
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

  public onSelectFilterChanged(filter: DataSourceToolbarFilter, option: EuiSelectOption | EuiSelectOption[]): void {
    let selectedFilterData: DataSourceToolbarSelectedFilter;
    const selectedOption: EuiSelectOption = Array.isArray(option) ? option[0] : option;
    filter.CurrentValue = selectedOption ? selectedOption.value : undefined;
    selectedFilterData = { selectedOption: { Value: selectedOption.value, Display: selectedOption.display }, filter };
    const index = this.findSelectedFilterIndex(filter.Name);
    if (index >= 0) {
      this.internalSelectedFilters[index] = selectedFilterData;
    } else {
      this.internalSelectedFilters.push(selectedFilterData);
    }
    this.formState.dirty = true;
    this.filterService.formStatusChanged(this.formState);
  }

  /**
   * Use clear from select-x to remove any options applied to it
   * @param filter current state of filter
   */
  public onClearFilter(filter: DataSourceToolbarFilter): void {
    this.removeSelectedFilter(filter, false);
    this.formState.dirty = true;
    this.filterService.formStatusChanged(this.formState);
  }

  /**
   * Applys all filters saved in DSTViewConfig.AdditionalParameters to the selected filters
   * @param config DSTViewConfig used to get and apply filters from
   */
  public applyDynamicPropsAsSelectedFilters(config: DSTViewConfig): void {
    // Handle filters from dynamic properties
    if (!config.AdditionalParameters) {
      return;
    }
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
  public getSelectedFilterFromName(filterName: string, value: string): DataSourceToolbarSelectedFilter | undefined {
    const filter = this.filters?.find((filter) => filter.Name === filterName);
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
    selectedFilter?: DataSourceToolbarSelectedFilter,
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
    this.filters?.forEach((filter) => (filter.CurrentValue = undefined));
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
    this.filters?.forEach((filter) => {
      if (filter.CurrentValue) {
        if (filter.Name) {
          this.settings.navigationState[filter.Name] = filter.CurrentValue;
        }
        if (this.settings.filters?.find((elem) => elem.Name === filter.Name)) {
          const test = this.settings.filters?.find((elem) => elem.Name === filter.Name);
          if (test) test.CurrentValue = filter.CurrentValue;
        }
        if (filter?.Column) {
          // This is a local filter and we must filter over this column
          this.localFilterState.filterColumns[filter.Column] = filter.CurrentValue;
        }
      } else {
        if (filter.Name) {
          delete this.settings.navigationState[filter.Name];
        }
        delete this.settings.filters?.find((elem) => elem.Name === filter.Name)?.CurrentValue;
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
      if (this.id) {
        this.filterService.updateNavigation(this.id, this.settings.navigationState, this.selectedFilters);
      }
    }
  }

  /**
   * @ignore Used internally in components template.
   * Updates the filters current value to add supplied option delimited when needed
   */
  private setDelimitedFilterCurrentValue(filter: DataSourceToolbarFilter, option: DataModelFilterOption, isAdd: boolean): void {
    if (isAdd) {
      if (filter.CurrentValue && filter.CurrentValue.length) {
        filter.CurrentValue = filter.CurrentValue += `${filter.Delimiter}${option.Value}`;
      } else {
        filter.CurrentValue = option.Value;
      }
    } else {
      // We remove the current option with the deliminator
      filter.CurrentValue = filter.CurrentValue?.replace(`${filter.Delimiter}${option.Value}`, '');
      filter.CurrentValue = filter.CurrentValue?.replace(`${option.Value}${filter.Delimiter}`, '');
      filter.CurrentValue = filter.CurrentValue?.replace(`${option.Value}`, '');
      if (filter.CurrentValue === '') filter.CurrentValue = undefined;
    }
  }

  /**
   * @ignore Used internally
   * Finds the relevant DataModelFilterOption from the supplied option value and filter
   */
  private findFilterOptionFromValue(optionValue: string, filter: DataSourceToolbarFilter): DataModelFilterOption | undefined {
    const index = filter.Options?.map((opt) => opt.Value).indexOf(optionValue);
    return index ? filter.Options?.[index] : undefined;
  }

  /**
   * @ignore Used internally
   * Attempts to find an existing selected filter matching the given name.
   * Returns the index or -1 if no match was found
   */
  private findSelectedFilterIndex(filterName: string | undefined, optionValue?: string): number {
    let index: number;
    if (optionValue) {
      index = this.internalSelectedFilters
        .map((f) => (f.filter?.Name ?? '') + (f.selectedOption?.Value ?? ''))
        .indexOf(filterName + optionValue);
    } else {
      index = this.internalSelectedFilters.map((f) => f.filter?.Name).indexOf(filterName);
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
      if (sfilter.filter?.Name === filter.Name) {
        val += `${sfilter.selectedOption?.Value}${filter.Delimiter}`;
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
        searchResult &&= this.searchTerms.every((term) => val.includes(term.selectedOption?.Display ?? ''));
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
