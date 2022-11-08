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
 * Copyright 2022 One Identity LLC.
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

import { SelectionChange } from '@angular/cdk/collections';
import {
  Component,
  Input,
  OnChanges,
  SimpleChanges,
  OnInit,
  Output,
  EventEmitter,
  ViewEncapsulation,
  OnDestroy,
  Injector,
} from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatButtonToggleChange } from '@angular/material/button-toggle';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { MatDialog } from '@angular/material/dialog';
import { MatSelectChange } from '@angular/material/select';
import { MatTableDataSource } from '@angular/material/table';
import { Subject, Subscription } from 'rxjs';
import { distinctUntilChanged, debounceTime } from 'rxjs/operators';

import {
  CollectionLoadParameters,
  TypedEntityCollectionData,
  EntitySchema,
  IClientProperty,
  TypedEntity,
  DataModelFilterOption,
  FilterData,
  IEntity,
} from 'imx-qbm-dbts';
import { DataSourceToolbarSettings } from './data-source-toolbar-settings';
import { DataSourceToolbarFilter, DataSourceToolbarSelectedFilter } from './data-source-toolbar-filters.interface';
import { ImxTranslationProviderService } from '../translation/imx-translation-provider.service';
import { DataSourceToolBarGroup, DataSourceToolBarGroupingCategory } from './data-source-toolbar-groups.interface';
import { SelectionModelWrapper } from './selection-model-wrapper';
import { SelectionListComponent } from '../data-table/selection-list/selection-list.component';
import { DataSourceItemStatus } from './data-source-item-status.interface';
import { FilterTreeComponent } from './filter-tree/filter-tree.component';
import { ColumnOptions } from './column-options';

/**
 * The Datasource toolbar (DST) consist internally of a datasource and a toolbar view,
 * that offers search, filtering, grouping and sorting capabilities.
 * It can be used in combination with other components like {@link DataTableComponent|Data table component}.
 *
 * @example
 * A data source toolbar with a data table, a paginator and a custom toolbar template
 *
 * <imx-data-source-toolbar #dst [settings]="mySettings" (navigationStateChanged)="myNavigationStateChanged($event)">
 *                  <imx-data-source-toolbar-custom [customContentTemplate]="customToolbarTemplate"></imx-data-source-toolbar-custom>
 * </imx-data-source-toolbar>
 * <imx-data-table [dst]="myDst" (selectionChanged)="onSelectionChanged($event)"></imx-data-table>
 * <imx-data-source-paginator [dst]="myDst"></imx-data-source-paginator>
 * <ng-template #customToolbarTemplate>
 *                  <button mat-button>Im a pretty button in a custom toolbar template. Please, click me!</button>
 * </ng-template>
 */
@Component({
  selector: 'imx-data-source-toolbar',
  templateUrl: './data-source-toolbar.component.html',
  styleUrls: ['./data-source-toolbar.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class DataSourceToolbarComponent implements OnChanges, OnInit, OnDestroy {
  public get numOfSelectedItems(): number {
    return this.selection.selected.length;
  }

  public get numOfSelectableItems(): number {
    return this.internalDataSource.data.filter((item) => this.itemStatus.enabled(item)).length;
  }

  public get additionalColumns(): IClientProperty[] {
    return this.columnOptions?.additionalColumns.concat(this.columnOptions.selectedOptionals) ?? [];
  }

  public readonly selectionChanged = new Subject<SelectionChange<TypedEntity>>();

  @Input() public additionalPropertiesForNavigation: string[] = [];

  /**
   * List of toolbar options, that should be visible.
   * Values: 'search', 'filter', 'groupBy', 'settings', 'selectedViewGroup', 'filterTree'.
   */
  @Input() public get options(): string[] {
    return Array.from(this.optionset);
  }
  public set options(value: string[]) {
    this.optionset = new Set(value);
  }

  /**
   * @ignore Used internally in components template.
   * Collaborates with the 'options' input field.
   */
  public optionset: Set<string> = new Set([]);

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
   * The entity schema of the datasource, used e.g. for creating filtering and grouping options.
   *
   * TODO: It looks like the entity schema exists twice in the DST world. Why? Has to be fixed.
   */
  @Input() public entitySchema: EntitySchema;

  /**
   * Contains the DST setting, like the datasource, the entity schema etc.
   *
   * TODO: It looks like the entity schema exists twice in the DST world. Why? Has to be fixed.
   */
  @Input() public settings: DataSourceToolbarSettings;

  /**
   * If set to 'false' (= default) pagination, filtering etc is done on the server side.
   * The server will send chunks of data, when the user clicks on next/previous page button and DST will handle the response.
   * If set to 'true' the server will send all data in one go. DST will internally handle page sizing and navigation.
   */
  @Input() public isDataSourceLocal = false;

  /**
   * @ignore Reserved for future use.
   * List of views attached to a DST object.
   */
  @Input() public views: string[] = ['table', 'cardlist'];

  @Input() public initalView = 'table';

  @Input() public hideCustomToolbar = false;

  @Input() public alwaysVisible = false;

  /**
   * Keywords for search.
   * (Optional)
   */
  @Input() public keywords = '';

  /**
   * If present this text would be shown as the placeholder in the search box.
   */
  @Input() public searchBoxText: string;

  /**
   * Status of an item. If the property enabled is true, the item is selectable.
   */
  @Input() public itemStatus: DataSourceItemStatus = {
    enabled: (__) => true,
  };

  /**
   * Preselected items.
   */
  @Input() public preSelection: TypedEntity[] = [];

  /**
   * @ignore Reserved for future use.
   * List of icons that will represent an view from the 'views' Input list.
   */
  public viewIcons: string[] = ['attributes', 'gridsmall'];

  /**
   * Emits a collection of typed entities when the datasource changes.
   */
  @Output() public dataSourceChanged = new EventEmitter<TypedEntityCollectionData<TypedEntity>>();

  /**
   * Occurs when user presses next/previous page button or changes the page size.
   */
  @Output() public navigationStateChanged = new EventEmitter<CollectionLoadParameters>();

  /**
   * Entity schema has changed. Occurs most often in combination with a change of the datasource.
   */
  @Output() public entitySchemaChanged = new EventEmitter<EntitySchema>();

  /**
   * Occurs when the visible columns of the entity schema has changed.
   */
  @Output() public displayedColumnsChanged = new EventEmitter<IClientProperty[]>();

  /**
   * Occurs when the datasource toolbar settings object has changed.
   *
   * NOTE: An event is emitted only when the whole settings object has changed.
   * It will not fire if only parts - like the entity schema, or the datasource - changes.
   */
  @Output() public settingsChanged = new EventEmitter<DataSourceToolbarSettings>();

  /**
   * @ignore  Reserved for future use.
   * Occurs when the view selection has changed.
   */
  @Output() public viewSelectionChanged = new EventEmitter<string>();

  /**
   * Occurs when the grouping criteria had changed.
   */
  @Output() public groupingChanged = new EventEmitter<IClientProperty>();

  /**
   * Occurs when a new search is initiated.
   * Often this is  triggered by a user who presses the search button of the toolbar.
   */
  @Output() public search = new EventEmitter<string>();

  /**
   * Occurs when a selectedFilter that is marked as custom is removed from the selectedFilters array
   */
  @Output() public customSelectedFilterRemoved = new EventEmitter<DataSourceToolbarSelectedFilter>();

  /**
   * Occurs when a filtertree was opened and changed the filter set
   */
  @Output() public filterTreeSelectionChanged = new EventEmitter<FilterData[]>();

  /**
   * Occurs when additional columns are added or removed
   */
  @Output() public shownColumnsSelectionChanged = new EventEmitter<IClientProperty[]>();

  /**
   * Occurs when additional list elements are added or removed
   */
  @Output() public additionalListElementsChanged = new EventEmitter<IClientProperty[]>();

  /**
   * the columnOptions used by the toolbar
   */
  public columnOptions: ColumnOptions;

  public get additionalListElements(): IClientProperty[] {
    return this.columnOptions?.additionalListElements ?? [];
  }

  public get optionalColumns(): IClientProperty[] {
    return this.columnOptions?.optionalColumns ?? [];
  }

  public get shownClientProperties(): IClientProperty[] {
    return this.columnOptions?.shownClientProperties ?? [];
  }

  /**
   * Used internally to manage the current search term
   * This will be triggered by a value change listner that fires just after a user stops typing
   */
  public searchControl = new FormControl();

  /**
   * Internal subscription used to subscribe to and watch for changes on the `searchControl`
   */
  public valueChanges$: Subscription;

  /**
   * @ignore Used internally in components template.
   * Works along side the 'hiddenFilters' input field.
   */
  public hiddenFilterSet: Set<string> = new Set([]);

  /**
   * Indicates if the datasource has changed.
   */
  public dataSourceHasChanged = true;

  /**
   * This is the mat table datasource.
   */
  public internalDataSource: MatTableDataSource<TypedEntity> = new MatTableDataSource<TypedEntity>([]);

  /**
   * The list of filters currently applied
   */
  public selectedFilters: DataSourceToolbarSelectedFilter[] = [];

  /**
   * The number of filter options considered to be the threshold before we use
   * a different template control better suited to support rendering multiple options
   */
  public filterOptionLengthThreshold = 5;

  /**
   * An indicator used to determine if this is the first time loading the component
   */
  public isInitialLoad = true;

  /**
   * An indicator used to determine, if there are any filter tree informations available
   */
  public hasFilterTree = false;

  /**
   * An indicator used to determine, if viewSettings could be applied
   */
  public hasViewSettings = false;

  /**
   * short description, which data type the filter tree filters
   */
  public filterType: string;

  /**
   * The currently selected filter data
   */
  public currentFilterData: IEntity[] = [];

  /**
   * @ignore Used internally.
   * Collection of typed entities.
   * Will only be used, when 'isDataSourceLocal' is set to true.
   */
  private localDataSource: TypedEntityCollectionData<TypedEntity>;

  /** Marker that prevents the emitting of a selectionChanged event, when items are preselected */
  private isUpdatingPreselection = false;

  /**
   * @ignore
   * List of subscriptions.
   */
  private readonly subscriptions: Subscription[] = [];

  /**
   * list of subscriptions for columnOptions
   */
  private columnSubscriptions: Subscription[] = [];

  /**
   * @ignore Used internally in components template.
   * Selection model that handles single and multiple selection in the data table.
   * Visually selections are represented by chekcboxes, which can be checked/unchecked.
   */
  private readonly selection = new SelectionModelWrapper();

  /**
   * Inject the 'translateProvider' for use in the template.
   */
  constructor(
    public readonly dialog: MatDialog,
    private readonly injector: Injector
  ) {
    this.subscriptions.push(
      this.selection.changed.subscribe((event: SelectionChange<TypedEntity>) => {
        if (!this.isUpdatingPreselection) {
          this.selectionChanged.next(event);
        }
      })
    );
  }

  /**
   * Indicates whether there is any initial data, and therefore whether to show the toolbar
   * i.e. There is a totalCount when there are no search or filters applied
   */
  public get showDataSourceToolbar(): boolean {
    // When there is an active search or filtering, the toolbar should always be displayed
    if (this.alwaysVisible || this.searchCurrenltyApplied || this.filtersCurrentlyApplied) {
      return true;
    }
    return this.dataSourceHasData;
  }

  public get dataSourceHasData(): boolean {
    return this.settings?.dataSource?.totalCount > 0;
  }

  public get dataSourceIsLimitReached(): boolean {
    return this.settings?.dataSource?.IsLimitReached;
  }

  public get searchCurrenltyApplied(): boolean {
    return this.settings?.navigationState?.search?.length > 0;
  }

  public get filtersCurrentlyApplied(): boolean {
    return this.selectedFilters?.length > 0 || this.currentFilterData?.length > 0;
  }

  /**
   * @ignore Used internally.
   * Sets the initial view.
   */
  public ngOnInit(): void {
    this.initViewOptions();
    this.initSearchControl();
  }

  /**
   * @ignore Used internally.
   * Tidys up the view on destroy.
   */
  public ngOnDestroy(): void {
    this.subscriptions.forEach((s) => s.unsubscribe());

    if (this.valueChanges$) {
      this.valueChanges$.unsubscribe();
    }
  }

  /**
   * @ignore Used internally.
   * Checks if input fields had changed.
   */
  public async ngOnChanges(changes: SimpleChanges): Promise<void> {
    if (changes['settings'] && changes['settings'].currentValue) {
      this.dataSourceHasChanged = !(changes['settings'].currentValue.entitySchema === changes['settings'].previousValue);

      if (this.dataSourceHasChanged) {
        this.entitySchema = this.settings.entitySchema;

        if (this.isDataSourceLocal) {
          this.setLocalDataSource(this.settings);
          setTimeout(() => this.navigateLocalDataSource(this.settings));
        }

        // We only want to do this if this is the initial load...
        if (this.isInitialLoad) {
          this.setInitialFilterValues();
        }

        const filterItems = this.settings?.filterTree?.filterMethode ? await this.settings.filterTree?.filterMethode('') : { Elements: [] };
        this.hasFilterTree = this.settings.filterTree && filterItems?.Elements?.length > 0;

        if (this.settings?.dataModel) {
          this.initColumnOptions();
          this.hasViewSettings = this.columnOptions?.hasOptionalColumns;
          this.updateEntitySchema();
          this.settings.dataSource.Data.forEach((elem) => elem.GetEntity().ApplySchema(this.settings.entitySchema));
        } else {
          this.hasViewSettings = false;
        }

        this.filterType = filterItems?.Description;
        this.internalDataSource = new MatTableDataSource<TypedEntity>(this.settings.dataSource.Data);
        this.dataSourceChanged.emit(this.settings.dataSource);
      }

      this.settingsChanged.emit(this.settings);
    }

    if (changes['preSelection'] && changes['preSelection'].currentValue) {
      this.isUpdatingPreselection = true;
      setTimeout(() => {
        this.preSelection.forEach((item) => this.selection.checked(item));
        this.isUpdatingPreselection = false;
      });
    }
  }

  /**
   * Clears selection.
   */
  public clearSelection(): void {
    setTimeout(() => {
      this.selection.clear();
    });
  }

  /**
   * @ignore Used internally in components template.
   * Open the selection dialog
   */
  public showSelectedItems(): void {
    this.dialog.open(SelectionListComponent, {
      width: '600px',
      height: '600px',
      data: this.selection.selected,
    });
  }

  public numOfSelectedItemsOnPage(): number {
    return this.internalDataSource.data.filter((item) => this.selection.isSelected(item)).length;
  }

  /**
   * @ignore Used internally in components template.
   * Indicates if all rows on the current page are selected.
   */
  public allSelected(): boolean {
    return this.numOfSelectedItemsOnPage() === this.numOfSelectableItems;
  }

  /**
   * @ignore Used internally in components template.
   * Toggles the selection.
   */
  public toggleSelection(): void {
    if (this.allSelected()) {
      this.internalDataSource.data.forEach((item) => this.selection.unChecked(item));
    } else {
      this.selectAllOnPage();
    }
  }

  public toggle(item: TypedEntity): void {
    this.selection.toggle(item);
  }

  /**
   * @ignore Used internally in components template.
   * Selects an item.
   */
  public checked(row: TypedEntity): void {
    this.selection.checked(row);
  }

  /**
   * @ignore Used internally in components template.
   * Deselects an item.
   */
  public unChecked(row: TypedEntity): void {
    this.selection.unChecked(row);
  }

  /**
   * @ignore Used internally in components template.
   * Checks if an item is selected.
   */
  public isChecked(row: TypedEntity): boolean {
    return this.selection.isSelected(row);
  }

  public selectAllOnPage(): void {
    this.internalDataSource.data.forEach((item) => {
      if (this.itemStatus.enabled(item) && !this.selection.isSelected(item)) {
        this.selection.toggle(item);
      }
    });
  }

  /**
   * @ignore Used internally.
   * Is called internally when the navigation state changes.
   * Emits the new state.
   */
  public navigationChanged(navigationState: CollectionLoadParameters): void {
    this.settings.navigationState = navigationState;

    if (this.isDataSourceLocal) {
      this.navigateLocalDataSource(this.settings);
    }
    this.navigationStateChanged.emit(navigationState);
  }

  /**
   * @ignore Used internally.
   * Is called internally when a new view is active - e.g. user switches from the table view to the tiles view.
   * Emits the name of the view as a string.
   */
  public onViewSelectionChanged(event: MatButtonToggleChange): void {
    this.viewSelectionChanged.emit(event.value);
  }

  /**
   * @ignore Used internally.
   * Is called internally when a single value option filter is selected (checkbox)
   * Updates and emits the new navigationState to include any filter query params.
   */
  public onCheckboxFilterChanged(filter: DataSourceToolbarFilter, option: DataModelFilterOption, event: MatCheckboxChange): void {
    let selectedFilterData: DataSourceToolbarSelectedFilter;
    if (event.checked) {
      if (filter.Delimiter) {
        this.setDelimitedFilterCurrentValue(filter, option);
      } else {
        filter.CurrentValue = option.Value;
      }
      selectedFilterData = { selectedOption: option, filter };
      this.selectedFilters.push(selectedFilterData);
    } else {
      this.removeSelectedFilter(filter, false, option.Value);
    }
    this.updateNavigateStateWithFilters();
  }

  /**
   * @ignore Used internally.
   * Is called internally when a filter with multiple options has a new option selected (radio button or mapped select list)
   * Updates and emits the new navigationState to include any filter query params.
   */
  public onRadioFilterChanged(filter: DataSourceToolbarFilter, option: DataModelFilterOption): void {
    let selectedFilterData: DataSourceToolbarSelectedFilter;
    filter.CurrentValue = option ? option.Value : undefined;
    selectedFilterData = { selectedOption: option, filter };
    const index = this.findSelectedFilterIndex(filter.Name);
    if (index >= 0) {
      this.selectedFilters[index] = selectedFilterData;
    } else {
      this.selectedFilters.push(selectedFilterData);
    }
    this.updateNavigateStateWithFilters();
  }

  /**
   * @ignore Used internally.
   * Is called internally when a filter with multiple (greater than 5 possible) options has a value selected (select list)
   * Updates and emits the new navigationState to include any filter query params.
   */
  public selectFilterValueChanged(filter: DataSourceToolbarFilter, event: MatSelectChange): void {
    const option = this.findFilterOptionFromValue(event.value, filter);
    this.onRadioFilterChanged(filter, option);
  }

  /**
   * @ignore Used internally.
   * Is called internally when a filter with multiple non mutually exclusive (greater than 5 possible) options
   * has a value selected (multi select list)
   * Updates and emits the new navigationState to include any filter query params.
   */
  public multiSelectFilterValueChange(filter: DataSourceToolbarFilter, event: MatSelectChange): void {
    filter.CurrentValue = undefined;
    const relevantSelectedItems = this.selectedFilters.filter((sfilter) => sfilter.filter.Name === filter.Name);
    relevantSelectedItems.forEach((rsi) => {
      this.removeSelectedFilter(filter, false, rsi.selectedOption.Value);
    });
    event.value.forEach((value) => {
      const option = this.findFilterOptionFromValue(value, filter);
      this.selectedFilters.push({ selectedOption: option, filter });
    });
    this.rebuildSelectedDelimitedValue(filter);
    this.updateNavigateStateWithFilters();
  }

  /**
   * @ignore Used internally
   * Called internally to get a string array value from the provided filters currentValue property
   * for the multi select list
   */
  public getMultiSelectCurrentValue(filter: DataSourceToolbarFilter): string[] {
    let display = [];
    if (filter.Delimiter && filter.CurrentValue) {
      display = filter.CurrentValue.split(filter.Delimiter);
    }
    return display;
  }

  /**
   * @ignore Used internally.
   * Is called internally when the clear all filters menu option is clicked
   * Clears all selected filter values and updates and emits the new navigationState
   */
  public clearFilters(): void {
    this.settings.filters?.forEach((filter) => (filter.CurrentValue = undefined));
    const containsCustomFilters = this.selectedFiltersContainsCustomFilters();
    if (containsCustomFilters) {
      this.customSelectedFilterRemoved.emit();
    }
    this.selectedFilters = [];
    this.updateNavigateStateWithFilters();
  }

  /**
   * @ignore Used internally.
   * Is called internally when a single filter value is to be removed
   * Removes the selected filter value from the list, updates and emits the new navigationState by default,
   * unless emitChange is false
   */
  public removeSelectedFilter(
    filter: DataSourceToolbarFilter,
    emitChange: boolean = true,
    optionValue?: string,
    selectedFilter?: DataSourceToolbarSelectedFilter
  ): void {
    filter.CurrentValue = undefined;
    const index = this.findSelectedFilterIndex(filter.Name, optionValue);
    if (index >= 0) {
      this.selectedFilters.splice(index, 1);

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
      if (emitChange && !selectedFilter?.isCustom) {
        this.updateNavigateStateWithFilters();
      }
    }
  }

  /**
   *  @ignore Used internally.
   *  Shows a filter tree dialog and updates the filter set
   */
  public async showFilterTree(): Promise<void> {
    const filterdata = await this.dialog
      .open(FilterTreeComponent, {
        width: 'min(600px,60%)',
        autoFocus: false,
        height: 'min(600px,60%)',
        data: {
          filterTreeParameter: this.settings.filterTree,
          preselection: this.currentFilterData.map((elem) => elem),
          type: this.filterType,
        },
        panelClass: 'imx-toolbar-dialog',
      })
      .afterClosed()
      .toPromise();
    if (filterdata) {
      this.currentFilterData = filterdata;
      this.filterTreeSelectionChanged.emit(this.currentFilterData.map((filter) => filter.GetColumn('Filter').GetValue()));
    }
  }

  /**
   *  @ignore Used internally.
   *  Shows a dialog for adding/removing additional informations
   */
  public async updateAdditional(): Promise<void> {
    this.columnOptions?.updateAdditional();
  }

  /**
   *  @ignore Used internally.
   *  Resets additional columns and additional list elements
   */
  public resetView(): void {
    this.columnOptions?.resetView();
  }

  /**
   * clears the tree filter and emits the filterTreeSelectionChanged event
   */
  public clearTreeFilter(): void {
    this.currentFilterData = [];
    this.filterTreeSelectionChanged.emit([]);
  }

  /**
   * @ignore Used internally in components template.
   * Will be called when user presses the search button.
   */
  public onSearch(keywords: string): void {
    if (this.settings && this.settings.navigationState) {
      this.settings.navigationState.StartIndex = 0;
    }
    this.search.emit(keywords);
  }

  /**
   * @ignore Used internally in components template.
   * Will be called when a group by option is selected
   */
  public onGroupSelected(group: DataSourceToolBarGroup, groupCategory?: DataSourceToolBarGroupingCategory): void {
    this.settings.groupData.currentGrouping = {
      display: (groupCategory?.property.Display ? groupCategory.property.Display + ' - ' : '') + this.getGroupColumnDisplay(group),
      getData: group.getData,
    };
    this.settingsChanged.emit(this.settings);
  }

  /**
   * @ignore Used internally in components template.
   * Will be called by the clear grouping menu item is clicked
   * Removes any grouping currently applied and emits the settings changed event
   */
  public clearGroupedBy(): void {
    this.settings.groupData.currentGrouping = undefined;
    this.settingsChanged.emit(this.settings);
  }

  /**
   * @ignore Used internally in components template.
   * Used to convert the groupBy column api value into a display friendly format
   */
  public getGroupColumnDisplay(group: DataSourceToolBarGroup): string {   
    return group.property.Display ?? this.entitySchema.Columns[group.property.Property.ColumnName]?.Display ?? group.property.Property.Display;
  }

  

  /**
   * @ignore Used internally
   * inits the view settings and adds additional columns to the entity schema
   */
  private initColumnOptions(): void {
    if (this.columnOptions && this.columnOptions.settings.dataModel === this.settings.dataModel) {
      return;
    }

    this.columnOptions = new ColumnOptions(this.settings, this.injector);

    if (this.columnSubscriptions.length > 0) {
      this.columnSubscriptions.forEach((sub) => sub.unsubscribe());
      this.columnSubscriptions = [];
    }

    this.columnSubscriptions.push(
      this.columnOptions.shownColumnsSelectionChanged.subscribe((elem) => {
        this.shownColumnsSelectionChanged.emit(elem.properties);
        const optionals = this.columnOptions.getPropertiesForNavigation();
        this.additionalPropertiesForNavigation.forEach((prop) => {
          if (!optionals.includes(prop)) {
            optionals.push(prop);
          }
        });
        const withProperties = optionals.length === 0 ? undefined : optionals.join(',');
        if (this.settings.navigationState.withProperties !== withProperties) {
          this.settings.navigationState.withProperties = withProperties;
          if (this.settings.groupData?.currentGrouping == null && elem.needsReload) {
            this.navigationStateChanged.emit(this.settings.navigationState);
          }
        }
      })
    );
    this.columnSubscriptions.push(
      this.columnOptions.additionalListElementsChanged.subscribe((elem) => this.additionalListElementsChanged.emit(elem))
    );

    this.columnOptions.initColumnsAndAdditionalInformation();
  }

  private updateEntitySchema(): void {
    const newSchema = this.columnOptions.updateEntitySchema();
    this.settings.entitySchema = newSchema;
    this.entitySchema = newSchema;
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
   * @ignore Used internally in components template.
   * Updates the current value of a filter based on all the selected options with the delimiters
   */
  private rebuildSelectedDelimitedValue(filter: DataSourceToolbarFilter): void {
    let val = '';
    this.selectedFilters.forEach((sfilter) => {
      if (sfilter.filter.Name === filter.Name) {
        val += `${sfilter.selectedOption.Value}${filter.Delimiter}`;
      }
    });
    filter.CurrentValue = val.length ? val.slice(0, -1) : undefined;
  }

  /**
   * @ignore Used internally.
   * Sets the local datasource. If this datasource is used depends on the setting of the 'isDataSourceLocal' input field.
   */
  private setLocalDataSource(settings: DataSourceToolbarSettings): void {
    this.localDataSource = Object.assign({}, settings.dataSource);
  }

  /**
   * @ignore Used internally.
   * If 'isDataSourceLocal' is set to true, navigation and pagination will be handled internally by DST.
   */
  private navigateLocalDataSource(settings: DataSourceToolbarSettings): void {
    const tmpDataSource = this.settings.dataSource;
    tmpDataSource.Data = this.localDataSource.Data.slice(
      settings.navigationState.StartIndex,
      settings.navigationState.StartIndex + settings.navigationState.PageSize
    );

    this.settings = {
      dataSource: tmpDataSource,
      displayedColumns: settings.displayedColumns,
      entitySchema: settings.entitySchema,
      navigationState: settings.navigationState,
    };
    this.settingsChanged.emit(this.settings);
  }

  /**
   * @ignore Used internally
   * Sets any initial values for the supplied filters and makes a call to update the navigation state
   * Also marks the 'isInitialLoad' property to false to ensure this only happens on the initial load
   * of the component
   */
  private setInitialFilterValues(): void {
    this.settings.filters?.forEach((filter) => {
      const initialValue = filter.InitialValue;
      if (initialValue) {
        filter.CurrentValue = initialValue;
        const option = this.findFilterOptionFromValue(initialValue, filter);
        if (option) {
          this.selectedFilters.push({ selectedOption: option, filter });
        }
      }
    });
    this.isInitialLoad = false;
    // We only need to update the state if there were filters applied
    if (this.selectedFilters.length > 0) {
      this.updateNavigateStateWithFilters();
    }
  }

  /**
   * @ignore Used internally.
   * Sets the first view as the default view and emits the name of the view.
   */
  private initViewOptions(): void {
    if (this.views && this.views.length > 0) {
      this.viewSelectionChanged.emit(this.initalView);

      if (this.views.length > this.viewIcons.length) {
        this.views = this.views.slice(0, this.viewIcons.length);
      }
    }
  }

  /**
   * @ignore Used internally
   * Initialises the value for the search control and sets up the on valueChanges subscription
   */
  private initSearchControl(): void {
    if (this.keywords == null) {
      this.keywords = '';
    }
    this.searchControl.setValue(this.keywords);
    this.valueChanges$ = this.searchControl.valueChanges.pipe(distinctUntilChanged(), debounceTime(300)).subscribe((value) => {
      this.onSearch(value);
    });

    if (this.keywords.length > 0) {
      this.onSearch(this.keywords);
    }
  }

  /**
   * @ignore Used internally
   * Attempts to find an existing selected filter matching the given name.
   * Returns the index or -1 if no match was found
   */
  private findSelectedFilterIndex(filterName: string, optionValue?: string): number {
    let index;
    if (optionValue) {
      index = this.selectedFilters.map((f) => f.filter.Name + f.selectedOption.Value).indexOf(filterName + optionValue);
    } else {
      index = this.selectedFilters.map((f) => f.filter.Name).indexOf(filterName);
    }
    return index;
  }

  /**
   * @ignore Used internally
   * Attempts to find any selected filters that are marked as isCustom
   * Returns a boolean indicating if any are found or not
   */
  private selectedFiltersContainsCustomFilters(): boolean {
    let containsCustom = false;
    const result = this.selectedFilters.find((sf) => sf.isCustom);
    containsCustom = result !== undefined;
    return containsCustom;
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
   * Loops over the filters and adds any selected filters to the navigation state
   * as query parameters, and emits a navigationStateChanged event to let calling code know of the change
   */
  private updateNavigateStateWithFilters(): void {
    this.settings.filters?.forEach((filter) => {
      if (filter.CurrentValue) {
        this.settings.navigationState[filter.Name] = filter.CurrentValue;
      } else {
        delete this.settings.navigationState[filter.Name];
      }
    });
    this.settings.navigationState.StartIndex = 0;
    this.navigationStateChanged.emit(this.settings.navigationState);
  }
}
