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

import { SelectionChange } from '@angular/cdk/collections';
import {
  Component,
  EventEmitter,
  Injector,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatButtonToggleChange } from '@angular/material/button-toggle';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { MatDialog } from '@angular/material/dialog';
import { MatMenuTrigger } from '@angular/material/menu';
import { MatSelectChange } from '@angular/material/select';
import { MatTableDataSource } from '@angular/material/table';
import { EuiSelectFeedbackMessages, EuiSelectOption, EuiSidesheetService } from '@elemental-ui/core';
import {
  CollectionLoadParameters,
  DataModelFilterOption,
  EntitySchema,
  FilterData,
  FilterTreeData,
  FilterType,
  IClientProperty,
  SqlWizardExpression,
  TypedEntity,
  TypedEntityCollectionData,
  ValType,
} from '@imx-modules/imx-qbm-dbts';
import { TranslateService } from '@ngx-translate/core';
import { Observable, Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { v4 as uuid } from 'uuid';
import { AppConfigService } from '../appConfig/appConfig.service';
import { BusyService } from '../base/busy.service';
import { calculateSidesheetWidth } from '../base/sidesheet-helper';
import { ConfirmationService } from '../confirmation/confirmation.service';
import { DataExportComponent } from '../data-export/data-export.component';
import { SnackBarService } from '../snackbar/snack-bar.service';
import { SystemInfoService } from '../system-info/system-info.service';
import { ColumnOptions } from './column-options';
import { DataSourceItemStatus } from './data-source-item-status.interface';
import { DataSourceToolbarFilter, DataSourceToolbarSelectedFilter } from './data-source-toolbar-filters.interface';
import { DataSourceToolBarGroup, DataSourceToolBarGroupingCategory } from './data-source-toolbar-groups.interface';
import { DataSourceToolbarSettings } from './data-source-toolbar-settings';
import { isConfigDefault, isDefaultId } from './data-source-toolbar-view-config-helper';
import { DSTViewConfig } from './data-source-toolbar-view-config.interface';
import { FilterTreeSelectionParameter } from './filter-wizard/filter-tree-sidesheet/filter-tree-sidesheet.model';
import { FilterWizardComponent } from './filter-wizard/filter-wizard.component';
import { FilterTypeIdentifier, FilterWizardResult } from './filter-wizard/filter-wizard.interfaces';
import { FilterWizardService, selectedFiltersParams } from './filter-wizard/filter-wizard.service';
import { SaveConfigDialogComponent } from './save-config-dialog/save-config-dialog.component';
import { SelectionModelWrapper } from './selection-model-wrapper';

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
  @ViewChild('savedConfigsTrigger') savedConfigsTrigger: MatMenuTrigger;

  public get numOfSelectedItems(): number {
    return this.selection.selected.length;
  }

  public get numOfSelectableItems(): number {
    return this.internalDataSource.data.filter((item) => this.itemStatus.enabled(item)).length;
  }

  // Unique-ify this array to not cause problems with adding/removing properties
  public get additionalColumns(): IClientProperty[] {
    const additionalColumns = this.columnOptions?.additionalColumns.concat(this.columnOptions.selectedOptionals) ?? [];
    return additionalColumns.filter(function (column) {
      const key = column.ColumnName?.toLocaleLowerCase();
      return !this.has(key) && this.add(key);
    }, new Set());
  }

  public readonly selectionChanged = new Subject<SelectionChange<TypedEntity>>();

  /**
   * BusyService for handling the busy state of the toolbar
   */
  @Input() public busyService: BusyService;

  @Input() public additionalPropertiesForNavigation: string[] = [];

  /**
   * List of toolbar options, that should be visible.
   * Values: 'search', 'sort, 'filter', 'groupBy', 'settings', 'selectedViewGroup', 'filterTree', 'filterWizard'.
   */
  @Input() public get options(): string[] {
    return Array.from(this.optionset);
  }
  public set options(value: string[]) {
    this.optionset = new Set(value);
  }

  /**
   * Sort functionality
   */
  public sortWarningThreshold: number;
  public descArg = ' desc';

  public isDescending = false;
  public ascendingSortControl = new FormControl<boolean>(this.isDescending);
  public selectedSortControl = new FormControl<string>('', { nonNullable: true, validators: Validators.required });
  public sortControl = new FormGroup({
    selectedSortControl: this.selectedSortControl,
    ascendingSortControl: this.ascendingSortControl,
  });
  public sortFeedbackMessages: EuiSelectFeedbackMessages;
  public sortOptions: EuiSelectOption[] = [];
  public sortOptionsFilter = (option: EuiSelectOption, searchInputValue: string) =>
    option.display.toLowerCase().includes(searchInputValue.toLowerCase());

  public get hasSortFunction(): boolean {
    return this.optionset.has('sort') && !!this.settings?.dataModel;
  }

  public get hasSortOptions(): boolean {
    return this.sortOptions.length > 0;
  }

  public get canApplySort(): boolean {
    return this.sortControl.valid && this.sortControl.dirty;
  }

  public get canClearSort(): boolean {
    return this.sortControl.valid;
  }

  public get isSortApplied(): boolean {
    return this.hasSortFunction && this.settings?.navigationState?.OrderBy != null && this.settings.navigationState.OrderBy.length > 0;
  }

  public get isSortDesc(): boolean {
    return (
      this.hasSortFunction &&
      this.settings?.navigationState?.OrderBy != null &&
      this.settings.navigationState.OrderBy.toLocaleLowerCase().includes(this.descArg)
    );
  }

  /**
   * @ignore Used internally to set the filter column name currently being used
   */
  public get currentSortColumn(): string {
    return this.sortOptions?.find((option) => option.value == this.settings.navigationState?.OrderBy?.split(' ')[0])?.display ?? '';
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
   * Sets the columns to search over. If not set, all string-type columns will be considered in a search.
   */
  @Input() public localSearchColumns: string[];

  /**
   * Opts into the themed style approach that trys to prevent style leak and theming palettes
   */
  @Input() public useThemedStyle: boolean = false;

  /**
   * @ignore Reserved for future use.
   * List of views attached to a DST object.
   */
  @Input() public views: string[] = ['table', 'cardlist'];

  @Input() public initalView = 'table';

  @Input() public hideCustomToolbar = false;

  @Input() public alwaysVisible = false;

  @Input() public showClearFilterOption = true;

  @Input() public disableSearch = false;
  @Input() public isEnterDisabled: boolean = false;

  @Input() public isRegex: boolean = false;

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
   * an optional search api to handle search cancelling when necessary, results will be wihin the observable searchResults$
   */
  @Input() searchApi?: (keywords?: string) => Observable<any> | undefined;

  /**
   * If 'true', it gives the div.imx-chip-container a min-height: 15px, otherwise this component's styling stays the same
   */
  @Input() isStandaloneToolbar: boolean = false;

  /**
   * An optional input to disable the filter wizard.
   */
  @Input() disableFilterWizard: boolean = false;

  /**
   * @ignore Reserved for future use.
   * List of icons that will represent an view from the 'views' Input list.
   */
  public viewIcons: string[] = ['attributes', 'gridsmall'];

  /**
   * Emits a collection of typed entities when the datasource changes.
   */
  @Output() public dataSourceChanged = new EventEmitter<TypedEntityCollectionData<TypedEntity> | undefined | null>();

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
  public columnOptions: ColumnOptions | undefined;

  public get additionalListElements(): IClientProperty[] {
    return this.columnOptions?.additionalListElements ?? [];
  }

  public get optionalColumns(): (IClientProperty | undefined)[] {
    return this.columnOptions?.optionalColumns ?? [];
  }

  public get shownClientProperties(): IClientProperty[] {
    return this.columnOptions?.shownClientProperties ?? [];
  }

  /**
   * Used for saving/loading configs
   */

  /**
   * Signal used to emit a DSTViewConfig for post/put via the viewConfig.putViewConfig function
   */
  @Output() public updateConfig = new EventEmitter<DSTViewConfig>();

  /**
   * Signal used to emit an DSTViewConfig.Id for delete via the viewConfig.deleteViewConfig function
   */
  @Output() public deleteConfigById = new EventEmitter<string>();

  /**
   * Checks if we have any saved configs at all in settings.viewConfig.viewConfigs
   */
  public get hasSavedConfigs(): boolean {
    return !!this.settings?.viewConfig?.viewConfigs?.length;
  }

  /**
   * Looks up if the config is default from a helper function
   * @param config the DSTViewConfig
   * @returns whether the config is default or not
   */
  public isConfigDefault(config: DSTViewConfig): boolean {
    return isConfigDefault(config);
  }

  public isDefaultId(config: DSTViewConfig): boolean {
    return isDefaultId(config);
  }

  /**
   * Changes the default icons on screen to reflect which config is default, emits a updateConfig signal to change the data on the server
   * @param config the DSTViewConfig
   */
  public toggleDefaultConfig(config: DSTViewConfig): void {
    const useAsDefault = config.UseAsDefault;
    // Find the currently chosen default
    const currentDefault = this.settings.viewConfig?.viewConfigs?.find((config) => config.UseAsDefault);
    if (currentDefault && currentDefault.Id !== config.Id) {
      // Set the previous config to false, as long as it isn't the same as the incoming config
      currentDefault.UseAsDefault = false;
    }
    config.UseAsDefault = !useAsDefault;
    if (!config?.IsReadOnly) {
      // We can safely update the chosen config as default, API will handle the others
      this.updateConfig.emit(config);
    }

    if (config?.IsReadOnly && currentDefault) {
      // We need to update the last config to be not-default, we cannot update the chosen as it is read-sonly
      //TODO: We do nothing if the chosen is readonly and the last was also readonly, there is no API for this
      currentDefault?.IsReadOnly ? null : this.updateConfig.emit(currentDefault);
    }
  }

  /**
   * Builds up the navigationState and columnOptions from a saved Config, emits a navigationStateChanged signal
   * @param config the DSTViewConfig
   */
  public applyConfig(config: DSTViewConfig): void {
    // Clear all old data, but don't emit any signals
    this.resetView(false);
    this.clearTreeFilter(false);

    // Handle adding to the nav state
    this.settings.navigationState = {
      ...this.settings.navigationState,
      OrderBy: config?.OrderBy,
    };

    // Handle sort
    if (config?.OrderBy) {
      this.applyOrderBy(config.OrderBy);
    }

    // Handle search terms from Filter
    config?.Filter?.forEach((filter) => {
      this.addSearchFilter(filter);
    });

    this.addTreeFilterFromConfig(config);
    this.addCustomFilterFromConfig(config);

    if (config?.GroupBy) {
      this.applyGroupBy(config);
    }

    if (config?.AdditionalListColumns || config?.AdditionalTableColumns) {
      // Need to re-init
      this.columnOptions = undefined;
      this.initColumnOptions(config);
    }

    if (config?.AdditionalParameters) {
      this.applyDynamicPropsAsSelectedFilters(config);
    }

    this.updateNavigateStateWithFilters();
  }

  /**
   * Applys the sortby column along with its direction
   * @param config the DSTViewConfig
   */
  public applyOrderBy(orderBy: string): void {
    // look for a space - if so then we have a direction
    const [columnName, dir] = orderBy.split(' ');
    this.findAndSelectSortColumn(columnName);
    this.isDescending = dir?.trim()?.toLocaleLowerCase() == this.descArg.trim();
    this.ascendingSortControl.reset(this.isDescending);
    this.ascendingSortControl.markAsPristine();
  }

  /**
   * Finds and applies the group from the config via onGroupSelected
   * @param config the DSTViewConfig
   */
  public applyGroupBy(config: DSTViewConfig): void {
    const group = this.settings?.groupData?.groups?.find((group) => this.getGroupColumnDisplay(group) === config.GroupBy);
    if (group) {
      this.onGroupSelected(group);
    }
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
        this.selectedFilters.push(...filter);
      }
    });
  }

  /**
   * Finds the filter in settings.filter with the same filterName, applies the value and returns the filter
   * @param filterName name of the filter
   * @param value value of the filter
   * @returns the filter with the selected option
   */
  public getSelectedFilterFromName(filterName: string, value: string): DataSourceToolbarSelectedFilter[] {
    const filter = this.settings.filters?.find((filter) => filter.Name === filterName);
    if (filter) {
      filter.CurrentValue = value;
      if (filter.Delimiter) {
        return filter.CurrentValue.split(filter.Delimiter).map((elem) => ({
          filter,
          selectedOption: this.findFilterOptionFromValue(elem, filter),
        }));
      }

      return [{ filter, selectedOption: this.findFilterOptionFromValue(value, filter) }];
    }
    return [];
  }

  /**
   * Opens an input dialog before emitting an updateConfig signal for creating a new config
   */
  public async saveConfig(): Promise<void> {
    const displayName = await this.dialog.open(SaveConfigDialogComponent).afterClosed().toPromise();
    if (!displayName) {
      return;
    }
    const existingConfig = this.settings?.viewConfig?.viewConfigs?.find((config) => config.DisplayName === displayName);
    if (
      existingConfig &&
      !(await this.confirm.confirmDelete(
        '#LDS#Heading Overwrite View',
        '#LDS#A view with the entered name already exists. Do you want to overwrite the already existing view with the new view?',
      ))
    ) {
      return;
    }
    const config: DSTViewConfig = {
      Id: existingConfig?.Id,
      ViewId: this.settings?.viewConfig?.viewId,
      DisplayName: displayName,
      Filter: this.settings?.navigationState?.filter,
      GroupBy: this.settings?.groupData?.currentGrouping?.display,
      OrderBy: this.settings?.navigationState?.OrderBy,
      AdditionalListColumns: this.columnOptions?.additionalListElements?.map((ele) => ele.ColumnName ?? '') ?? [],
      AdditionalTableColumns: this.columnOptions?.selectedOptionals
        ?.map((column) => column.ColumnName ?? '')
        .concat(this.columnOptions?.additionalColumns?.map((column) => column.ColumnName ?? '')),
      UseAsDefault: false,
    };
    if (this.filtersCurrentlyApplied) {
      config.AdditionalParameters = {};
      this.settings?.filters?.forEach((filter) => {
        if (filter.CurrentValue && config.AdditionalParameters) {
          config.AdditionalParameters[filter.Name ?? ''] = filter.CurrentValue;
        }
      });
    }
    this.snackbar.open({
      key: '#LDS#The view has been successfully saved.',
    });
    this.updateConfig.emit(config);
  }

  /**
   * Opens an input dialog before emitting an updateConfig signal for updating the config
   * @param config the DSTViewConfig
   */
  public async changeConfigName(config: DSTViewConfig): Promise<void> {
    const displayName = await this.dialog
      .open(SaveConfigDialogComponent, {
        data: {
          currentName: config.DisplayName,
        },
      })
      .afterClosed()
      .toPromise();
    if (displayName) {
      config.DisplayName = displayName;
      this.updateConfig.emit(config);
    }
  }

  /**
   * Opens a confirm dialog before emitting a deleteConfigById signal for deletion outside the DST
   * @param id the DSTViewConfig.Id
   */
  public async removeConfigIndex(id: string, index: number): Promise<void> {
    if (!(await this.confirm.confirmDelete('#LDS#Heading Delete View', '#LDS#Are you sure you want to delete the view?'))) {
      return;
    }
    if (this.settings?.viewConfig?.viewConfigs?.length === 1) {
      this.savedConfigsTrigger.closeMenu();
    }
    this.settings?.viewConfig?.viewConfigs?.splice(index, 1);
    this.deleteConfigById.emit(id);
  }

  /**
   * Used internally to manage the current search term
   * This will be triggered by a value change listner that fires just after a user stops typing
   */
  public searchControl: FormControl<string> = new FormControl<string>('', {
    nonNullable: true,
  });

  /**
   * Internal subscription used to subscribe to and watch for changes on the `searchControl`
   */
  public valueChanges$: Subscription;

  /**
   * External Observable to subscribe to in combination to the searchApi input
   */
  public searchResults$: Observable<any>;

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
   * The list of search terms currently applied
   */
  public searchTerms: DataSourceToolbarSelectedFilter[] = [];

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
   * An indicator used to determine, if viewSettings could be applied
   */
  public hasViewSettings = false;
  public get canExport(): boolean {
    return !!this.settings?.exportMethod?.getMethod;
  }
  public get canSave(): boolean {
    return !!this.settings?.viewConfig;
  }

  /**
   * short description, which data type the filter tree filters
   */
  public filterType: string;

  /**
   * The currently selected filter data
   */
  public currentFilterData: FilterTreeSelectionParameter | undefined;

  /**
   * The column, that is used for the filter tree.
   */
  private columnForTree: string;

  /**
   * The filter tree data, that is provided by the settings filter method.
   */
  private filterTreeItems: FilterTreeData;

  /**
   * Filter wizard SQL expressions
   */
  public filterWizardExpression: SqlWizardExpression | undefined;

  /**
   * An indicator used to determine, if there are any filter tree informations available
   */
  private hasFilterTree = false;

  /**
   * @ignore Used internally.
   * Collection of typed entities.
   * Will only be used, when 'isDataSourceLocal' is set to true.
   */
  private localDataSource: TypedEntityCollectionData<TypedEntity>;

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
   * Uniqe id for each data-source-toolbar component
   */
  private id: string;

  /**
   * @ignore Used internally in components template.
   * Selection model that handles single and multiple selection in the data table.
   * Visually selections are represented by chekcboxes, which can be checked/unchecked.
   */
  public readonly selection = new SelectionModelWrapper();

  public selectedFilterType: FilterTypeIdentifier;

  constructor(
    public readonly dialog: MatDialog,
    private readonly sidesheet: EuiSidesheetService,
    private readonly injector: Injector,
    private readonly translate: TranslateService,
    private readonly confirm: ConfirmationService,
    private readonly config: AppConfigService,
    private readonly snackbar: SnackBarService,
    private readonly filterService: FilterWizardService,
    private readonly systemInfoService: SystemInfoService,
  ) {
    if (!this.id) this.id = uuid();

    this.subscriptions.push(
      this.selection.changed.subscribe((event: SelectionChange<TypedEntity>) => {
        if (!this.isUpdatingPreselection) {
          this.selectionChanged.next(event);
        }
      }),
    );

    this.subscriptions.push(
      this.filterService.navigationStateChanged.subscribe((event: selectedFiltersParams) => {
        if (event.id !== this.id) return;
        this.selectedFilters = event.selectedFilters;
      }),
    );

    this.subscriptions.push(
      this.filterService.filterTabChangedEvent.subscribe((filterType: FilterTypeIdentifier) => {
        this.selectedFilterType = filterType as FilterTypeIdentifier;
      }),
    );
    this.sortFeedbackMessages = {
      search: this.translate.instant('#LDS#Search'),
      selected: '',
      clear: '',
      plusOther: '',
      plusOtherPlural: '',
      unsupportedCharacter: '',
      noResults: '',
      clearAll: '',
      ok: '',
      keyboardOptionsListAria: '',
    };
  }

  /**
   * Indicates whether there is any initial data, and therefore whether to show the toolbar
   * i.e. There is a totalCount when there are no search or filters applied
   */
  public get showDataSourceToolbar(): boolean {
    // When there is an active search or filtering, the toolbar should always be displayed
    if (this.alwaysVisible || this.searchCurrenltyApplied || this.filtersCurrentlyApplied || this.filterWizardExpression) {
      return true;
    }
    return this.searchCurrenltyApplied || this.filtersCurrentlyApplied || this.dataSourceHasData;
  }

  public get dataSourceHasData(): boolean {
    return (this.settings?.dataSource?.totalCount ?? 0) > 0;
  }

  public get dataSourceIsLimitReached(): boolean {
    return this.settings?.dataSource?.IsLimitReached ?? false;
  }

  public get searchCurrenltyApplied(): boolean {
    return !!this.settings?.navigationState?.search?.length || this.searchTerms.length > 0;
  }

  public get filtersCurrentlyApplied(): boolean {
    return this.selectedFilters?.length > 0 || this.currentFilterData != null;
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
        const defaultSavedConfig = this.settings?.viewConfig?.viewConfigs?.find(
          (config) => this.isConfigDefault(config) && !this.isDefaultId(config),
        );
        if (this.isInitialLoad) {
          await this.setInitialSortOptions();
          defaultSavedConfig ? this.applyConfig(defaultSavedConfig) : this.setInitialFilterValues();
          this.isInitialLoad = false;
        }

        this.filterTreeItems = this.settings?.filterTree?.filterMethode
          ? await this.settings.filterTree?.filterMethode('')
          : { Elements: [] };
        this.hasFilterTree = this.settings.filterTree != null && !!this.filterTreeItems?.Elements?.length;

        if (this.settings?.dataModel) {
          this.initColumnOptions(defaultSavedConfig);
          this.hasViewSettings = this.columnOptions?.hasOptionalColumns ?? false;
          this.updateEntitySchema();
          this.settings.dataSource?.Data?.forEach((elem) => elem.GetEntity().ApplySchema(this.settings.entitySchema));
        } else {
          this.hasViewSettings = false;
        }

        this.filterType = this.filterTreeItems?.Description ?? '';
        this.columnForTree = !!this.filterTreeItems?.Elements?.length ? this.filterTreeItems?.Elements?.[0]?.Filter?.ColumnName ?? '' : '';
        this.internalDataSource = new MatTableDataSource<TypedEntity>(this.settings.dataSource?.Data);
        if (this.isDataSourceLocal && (this.searchCurrenltyApplied || this.filtersCurrentlyApplied)) {
          // We need to apply a filter still over the local data since it was skipped earlier. Do so now.
          this.localFilter();
        }
        this.dataSourceChanged.emit(this.settings.dataSource);
      }

      this.settingsChanged.emit(this.settings);
    }

    if (changes['preSelection'] && changes['preSelection'].currentValue) {
      this.isUpdatingPreselection = true;

      setTimeout(() => {
        this.selection.clear();
        this.preSelection.forEach((item) => this.selection.checked(item));
        this.isUpdatingPreselection = false;
      });
    }

    if (changes['searchApi'] && this.searchApi) {
      // We have changed the input search API, so we need to change the observable
      this.searchResults$ = this.searchControl.valueChanges.pipe(
        distinctUntilChanged(),
        debounceTime(300),
        switchMap((value) => (this.searchApi ? this.searchApi(value) : Observable.create(undefined))),
      );
    }

    if (changes['disableSearch']) {
      this.searchControl = new FormControl<string>({ value: '', disabled: this.disableSearch }, { nonNullable: true });
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
   * Is called internally when a filter is removed from selected filters.
   * Updates and emits the new navigationState to include any filter query params.
   */
  public onSelectedFilterRemoved(selectedFilter: DataSourceToolbarSelectedFilter, optionValue: string | undefined): void {
    let settingsFilter = this.settings.filters?.filter((f) => f.Name === selectedFilter?.filter?.Name)[0];
    if (selectedFilter?.isCustom ?? false) {
      settingsFilter = selectedFilter.filter;
    }
    if (settingsFilter) {
      this.removeSelectedFilter(settingsFilter, true, optionValue, selectedFilter);
    }
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
    const index = this.findSelectedFilterIndex(filter.Name ?? '');
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
    if (option) {
      this.onRadioFilterChanged(filter, option);
    }
  }

  /**
   * @ignore Used internally.
   * Is called internally when a filter with multiple non mutually exclusive (greater than 5 possible) options
   * has a value selected (multi select list)
   * Updates and emits the new navigationState to include any filter query params.
   */
  public multiSelectFilterValueChange(filter: DataSourceToolbarFilter, event: MatSelectChange): void {
    filter.CurrentValue = undefined;
    const relevantSelectedItems = this.selectedFilters.filter((sfilter) => sfilter.filter?.Name === filter.Name);
    relevantSelectedItems.forEach((rsi) => {
      this.removeSelectedFilter(filter, false, rsi.selectedOption?.Value);
    });
    event.value.forEach((value) => {
      const option = this.findFilterOptionFromValue(value, filter);
      if (option) this.selectedFilters.push({ selectedOption: option, filter });
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
    let display: string[] = [];
    if (filter.Delimiter && filter.CurrentValue) {
      display = filter.CurrentValue?.split(filter.Delimiter) ?? [];
    }
    return display;
  }

  /**
   * @ignore Used internally
   * Manages the sort ascending toggle control
   */
  public toggleSort(): void {
    this.ascendingSortControl.setValue(this.isDescending);
    if (
      this.settings.navigationState.OrderBy == null ||
      this.settings.navigationState.OrderBy?.toLocaleLowerCase()?.includes(this.descArg) !== this.isDescending
    ) {
      this.ascendingSortControl.markAsDirty();
      return;
    }
    this.ascendingSortControl.markAsPristine();
  }

  /**
   * Finds the EuiSelectOption from a columnName
   * @param columnName - IClientProperty.ColumnName
   */
  public findAndSelectSortColumn(columnName: string): void {
    const selected = this.sortOptions.find((option) => option.value === columnName);
    if (!selected) {
      // The column isn't in the data model, nothing we can do :(
      return;
    }
    this.selectSort(selected);
  }

  /**
   * @ignore Used internally
   * Manages the sort column control
   */
  public selectSort(option: EuiSelectOption): void {
    this.selectedSortControl.setValue(option.value);
    if (
      this.settings.navigationState.OrderBy == null ||
      option.value == null ||
      !(this.settings.navigationState.OrderBy?.includes(option.value) ?? false)
    ) {
      this.selectedSortControl.markAsDirty();
      return;
    }
    this.selectedSortControl.markAsPristine();
  }

  /**
   * @ignore Used internally
   * Clears the sort if it exists and resets state
   */
  public clearSort(emit = true): void {
    this.isDescending = false;
    this.selectedSortControl.reset('');
    this.sortControl.markAsPristine();
    // If the nav state has sort values, we will clear those out and emit
    if (this.settings.navigationState.OrderBy && emit) {
      delete this.settings.navigationState.OrderBy;
      this.navigationStateChanged.emit(this.settings.navigationState);
    }
  }

  /**
   * @ignore Used internally
   * Pops a warning for large data, otherwise applies the sort to the nav state and emits a navigationStateChanged signal
   */
  public async applySort(toggleAndApply?: boolean): Promise<void> {
    const isBigData = (this.settings.dataSource?.totalCount ?? 0) > this.sortWarningThreshold;
    if (
      isBigData &&
      !(await this.confirm.confirmLeaveWithUnsavedChanges(
        '#LDS#Heading Sort Data',
        '#LDS#Sorting the data may take some time. Are you sure you want to sort the data?',
      ))
    ) {
      // Exit early - user doesn't want to continue.
      return;
    }

    if (toggleAndApply) {
      this.isDescending = !this.isDescending;
      this.sortControl.markAsPristine();
    }

    // Add sort and ascending to nav state
    this.settings.navigationState.OrderBy = this.selectedSortControl?.value ?? '';

    if (this.isDescending) {
      this.settings.navigationState.OrderBy += this.descArg;
    }

    // Set page to 1
    this.settings.navigationState.StartIndex = 0;

    this.navigationStateChanged.emit(this.settings.navigationState);
    this.sortControl.markAsPristine();
  }

  /**
   * @ignore Used internally.
   * Is called internally when the clear all filters menu option is clicked
   * Clears all selected filter values and updates and emits the new navigationState
   */
  public clearFilters(emit = true): void {
    this.settings.filters?.forEach((filter) => (filter.CurrentValue = undefined));
    const containsCustomFilters = this.selectedFiltersContainsCustomFilters();
    if (containsCustomFilters) {
      this.customSelectedFilterRemoved.emit();
    }
    this.selectedFilters = [];
    this.updateNavigateStateWithFilters(emit);
  }

  /**
   * @ignore Used internally.
   * Is called internally when a single filter value is to be removed
   * Removes the selected filter value from the list, updates and emits the new navigationState by default,
   * unless emitChange is false
   */
  public removeSelectedFilter(
    filter: DataSourceToolbarFilter | undefined,
    emitChange: boolean = true,
    optionValue?: string,
    selectedFilter?: DataSourceToolbarSelectedFilter,
  ): void {
    if (!filter) {
      return;
    }
    filter.CurrentValue = undefined;
    const index = this.findSelectedFilterIndex(filter.Name ?? '', optionValue);
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
   *  Shows a dialog for adding/removing additional informations
   */
  public async updateAdditional(): Promise<void> {
    this.columnOptions?.updateAdditional();
  }

  /**
   *  @ignore Used internally.
   *  Resets the view and the tree filter, used in template
   */
  public async resetViewAndTree(): Promise<void> {
    if (await this.resetView()) {
      this.clearTreeFilter();
    }
  }

  /**
   *  @ignore Used internally.
   *  Resets additional columns, additional list elements, filters, search and searchTerms
   */
  public async resetView(emit = true): Promise<boolean> {
    if (
      emit &&
      !(await this.confirm.confirmDelete(
        '#LDS#Heading Reset View',
        '#LDS#If you reset the view, the search, sorting, filters and additional columns will be reset. Are you sure you want to reset the view?',
      ))
    ) {
      return false;
    }
    this.columnOptions?.resetView();

    this.searchTerms = [];
    if (this.settings.navigationState.search) {
      this.searchControl.reset('');
      delete this.settings.navigationState.search;
    }
    if (this.settings.navigationState.OrderBy) {
      delete this.settings.navigationState.OrderBy;
      this.clearSort(false);
    }
    if (this.settings?.groupData?.currentGrouping) {
      this.clearGroupedBy(false);
    }
    delete this.settings.navigationState.filter;
    if (this.filtersCurrentlyApplied) {
      this.clearFilters(false);
    }

    this.filterWizardExpression = undefined;
    if (emit) {
      this.navigationStateChanged.emit(this.settings.navigationState);
    }
    return true;
  }

  /**
   * clears the tree filter and emits the filterTreeSelectionChanged event
   */
  public clearTreeFilter(emit = true): void {
    const currentTree: FilterData | undefined = this.currentFilterData?.filter;
    this.currentFilterData = undefined;
    if (emit) {
      this.filterTreeSelectionChanged.emit(
        this.settings.navigationState.filter?.filter((elem) => elem.ColumnName != currentTree?.ColumnName),
      );
    }
  }

  /**
   * @ignore Used internally in components template.
   * Will be called when user presses the search button.
   *
   * If isDataSourceLocal is true then a 'settingsChanged signal is emitted isntead of a search signal.
   */
  public onSearch(keywords: string | null | undefined): void {
    if (this.settings && this.settings.navigationState) {
      this.settings.navigationState.StartIndex = 0;
      this.settings.navigationState.search = keywords ?? '';
    }
    if (this.isDataSourceLocal) {
      // Do search locally
      this.localFilterState.keywords = keywords ?? '';
      this.localFilter();
    } else {
      this.search.emit(keywords ?? '');
    }
  }

  /**
   * @ignore Used internally in components template.
   * Will be called when a group by option is selected
   */
  public onGroupSelected(group: DataSourceToolBarGroup, groupCategory?: DataSourceToolBarGroupingCategory): void {
    if (!this.settings.groupData) {
      return;
    }
    this.settings.groupData.currentGrouping = {
      display: (groupCategory?.property.Display ? groupCategory.property.Display + ' - ' : '') + this.getGroupColumnDisplay(group),
      getData: group.getData,
      navigationState: group.navigationState,
    };
    this.settingsChanged.emit(this.settings);
  }

  /**
   * @ignore Used internally in components template.
   * Will be called by the clear grouping menu item is clicked
   * Removes any grouping currently applied and emits the settings changed event
   */
  public clearGroupedBy(emit = true): void {
    if (!this.settings.groupData) {
      return;
    }
    this.settings.groupData.currentGrouping = undefined;
    if (emit) {
      this.settingsChanged.emit(this.settings);
    }
  }

  /**
   * @ignore Used internally in components template.
   * Used to convert the groupBy column api value into a display friendly format
   */
  public getGroupColumnDisplay(group: DataSourceToolBarGroup): string {
    if (group.property.Display) {
      return group.property.Display;
    }

    if (group.property.Property?.ColumnName) {
      return this.entitySchema.Columns[group.property.Property?.ColumnName]?.Display ?? '';
    }

    if (group.property.Property?.Display) {
      return group.property.Property?.Display;
    }
    return group.property.Property?.ColumnName ?? '';
  }

  public canShowFilterWizard(): boolean {
    let result =
      (this.settings?.entitySchema?.TypeName != null &&
        this.filterService.isSqlWizardImplemented &&
        !this.isDataSourceLocal &&
        !this.disableFilterWizard) ||
      !!this.settings?.filters?.length ||
      this.hasFilterTree;
    return result;
  }

  public async showFilterWizard(): Promise<void> {
    const sidesheetRef = this.sidesheet.open(FilterWizardComponent, {
      title: await this.translate.get('#LDS#Heading Filter Data').toPromise(),
      icon: 'filter',
      width: calculateSidesheetWidth(800, 0.5),
      padding: '0px',
      testId: 'filter-wizard-sidesheet',
      disableClose: true,
      data: {
        id: this.id,
        settings: this.settings,
        filterExpression: this.filterWizardExpression,
        selectedFilters: this.selectedFilters,
        filterTreeParameter: {
          filterTreeParameter: this.settings.filterTree,
          preSelection: this.currentFilterData,
          type: this.filterType,
        },
        isDataSourceLocal: this.isDataSourceLocal,
      },
    });

    sidesheetRef.afterClosed().subscribe((result: FilterWizardResult) => {
      if (!result) {
        return;
      }

      this.clearTreeFilter(false);
      this.removeFilterWizard(false);
      this.currentFilterData = result?.treeFilter;

      const hasNoFilters = (result?.expression?.Expression?.Expressions?.length || 0) === 0;
      const hasNewTree = !!result?.treeFilter && this.currentFilterData !== result?.treeFilter;

      if (!hasNoFilters) {
        this.filterWizardExpression = result.expression;
      }

      if (hasNewTree && hasNoFilters) {
        // has new tree and no other filters, only emit tree state
        const otherFilter = (this.settings.navigationState.filter ?? []).filter(
          (elem) => elem.ColumnName !== result?.treeFilter?.filter?.ColumnName,
        );
        this.filterTreeSelectionChanged.emit(
          this.currentFilterData?.filter ? [this.currentFilterData.filter].concat(otherFilter) : otherFilter,
        );
      } else {
        // tree or filters, do both but only emit nav state
        this.settings.navigationState.filter = this.settings.navigationState.filter?.filter((x) => x.Type != FilterType.Expression) ?? [];
        if (this.filterWizardExpression?.Expression) {
          this.settings.navigationState.filter.push({
            Type: FilterType.Expression,
            Expression: this.filterWizardExpression?.Expression,
          });
        }
        if (result.treeFilter?.filter) {
          this.settings.navigationState.filter.push(result.treeFilter.filter);
        }
        this.updateNavigateStateWithFilters();
      }
    });
  }

  public removeFilterWizard(reload: boolean = true): void {
    this.settings.navigationState.filter = this.settings.navigationState.filter?.filter((x) => x.Expression == null);
    this.filterWizardExpression = undefined;
    if (reload) {
      this.navigationStateChanged.next(this.settings.navigationState);
    }
  }

  /**
   * @ignore Used internally
   * inits the view settings and adds additional columns to the entity schema
   */
  private initColumnOptions(config?: DSTViewConfig): void {
    if (this.columnOptions && this.columnOptions.settings.dataModel === this.settings.dataModel) {
      return;
    }

    this.columnOptions = new ColumnOptions(this.settings, this.injector, config);

    if (this.columnSubscriptions.length > 0) {
      this.columnSubscriptions.forEach((sub) => sub.unsubscribe());
      this.columnSubscriptions = [];
    }

    this.columnSubscriptions.push(
      this.columnOptions.shownColumnsSelectionChanged.subscribe((elem) => {
        this.shownColumnsSelectionChanged.emit(elem.properties);
        const optionals = this.columnOptions?.getPropertiesForNavigation() ?? [];
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
      }),
    );
    this.columnSubscriptions.push(
      this.columnOptions.additionalListElementsChanged.subscribe((elem) => this.additionalListElementsChanged.emit(elem)),
    );

    this.columnOptions.initColumnsAndAdditionalInformation();
  }

  private updateEntitySchema(): void {
    const newSchema = this.columnOptions?.updateEntitySchema();
    if (!newSchema) {
      return;
    }
    this.settings.entitySchema = newSchema;
    this.entitySchema = newSchema;
    if (this.isDataSourceLocal) {
      this.setLocalSearchSchema();
    }
  }

  /**
   * @ignore Used to set the search filter with either user input or the default state
   */
  private setLocalSearchSchema(): void {
    if (this.localSearchColumns) {
      this.localFilterState.searchColumns = this.localSearchColumns;
    } else {
      // Grab string-based columns to filter over
      const columns = this.entitySchema.Columns;
      const stringColumns: string[] = [];
      for (const [key, value] of Object.entries(columns)) {
        if (value.Type === ValType.String) {
          stringColumns.push(key);
        }
      }
      this.localFilterState.searchColumns = stringColumns;
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
   * @ignore Used internally in components template.
   * Updates the current value of a filter based on all the selected options with the delimiters
   */
  private rebuildSelectedDelimitedValue(filter: DataSourceToolbarFilter): void {
    let val = '';
    this.selectedFilters.forEach((sfilter) => {
      if (sfilter.filter?.Name === filter.Name) {
        val += `${sfilter.selectedOption?.Value}${filter.Delimiter}`;
      }
    });
    filter.CurrentValue = val.length ? val.slice(0, -1) : undefined;
  }

  /**
   * @ignore Used internally.
   * Sets the local datasource. If this datasource is used depends on the setting of the 'isDataSourceLocal' input field.
   */
  private setLocalDataSource(settings: DataSourceToolbarSettings): void {
    this.setLocalSearchSchema();
    this.localDataSource = Object.assign({}, settings.dataSource);
  }

  /**
   * @ignore Used internally.
   * If 'isDataSourceLocal' is set to true, navigation and pagination will be handled internally by DST.
   * Checks if we have a filter set, if so then we take the filtered data and otherwise the original dataset
   */
  private navigateLocalDataSource(settings: DataSourceToolbarSettings): void {
    const tmpDataSource = this.settings.dataSource;
    if (tmpDataSource) {
      if (this.internalDataSource.filter.length > 0) {
        // This data has a search filter, so apply the pagination over the filtered data
        tmpDataSource.Data = this.internalDataSource.filteredData.slice(
          settings.navigationState.StartIndex,
          (settings.navigationState.StartIndex ?? 0) + (settings.navigationState.PageSize ?? 0),
        );
      } else {
        tmpDataSource.Data = this.localDataSource.Data.slice(
          settings.navigationState.StartIndex,
          (settings.navigationState.StartIndex ?? 0) + (settings.navigationState.PageSize ?? 0),
        );
      }
    }
    this.settings = {
      ...{
        dataSource: tmpDataSource,
      },
      ...settings,
    };

    this.settingsChanged.emit(this.settings);
  }

  /**
   * @ignore Used internally
   * Checks, if there is a tree filter defined in the config.
   * If a tree filter is defined, it initializes the currentFilterData object and adds the parameter to the navigation.
   * @param config the configuration, that should be loaded.
   */
  private addTreeFilterFromConfig(config: DSTViewConfig): void {
    const tree = config?.Filter?.find((elem) => elem.ColumnName === this.columnForTree);
    if (tree != null) {
      const display = this.filterTreeItems?.Elements?.find((elem) => elem.Filter?.Value1 === tree.Value1)?.Display ?? '';
      this.currentFilterData = { display, filter: tree };
      if (this.settings.navigationState.filter) {
        this.settings.navigationState.filter.push(tree);
      } else {
        this.settings.navigationState.filter = [tree];
      }
    }
  }

  /**
   * @ignore Used internally
   * Checks, if there is a custom filter defined in the config.
   * If a custom filter is defined, it initializes the filterWizardExpression object and adds the parameter to the navigation.
   * @param config the configuration, that should be loaded.
   */
  private addCustomFilterFromConfig(config: DSTViewConfig): void {
    const expression = config?.Filter?.find((elem) => elem.Expression != null);
    if (expression) {
      this.filterWizardExpression = { Expression: expression.Expression };
      if (this.settings.navigationState.filter) {
        this.settings.navigationState.filter.push(expression);
      } else {
        this.settings.navigationState.filter = [expression];
      }
    }
  }

  /**
   * @ignore Used internally
   * Sets any initial values for the supplied filters and makes a call to update the navigation state
   *
   * Also marks the 'isInitialLoad' property to false to ensure this only happens on the initial load
   * of the component
   */
  private setInitialFilterValues(): void {
    // Here we prefer the saved default config over emiting the init
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
    // We only need to update the state if there were filters applied
    if (this.selectedFilters.length > 0) {
      this.updateNavigateStateWithFilters();
    }
  }

  private async setInitialSortOptions(): Promise<void> {
    if (!this.hasSortFunction) {
      return;
    }
    this.sortWarningThreshold = (await this.systemInfoService.getImxConfig()).ThresholdSlowSortingWarning;
    this.sortOptions = (this.settings?.dataModel?.Properties?.filter((property) => property.IsSortable) ?? [])
      .map<EuiSelectOption>((property) => {
        return {
          display: property.Property?.Display ?? property.Property?.ColumnName ?? '',
          displayDetail: property.Property?.Description ?? '',
          value: property.Property?.ColumnName ?? '',
        };
      })
      .sort((a, b) => (a?.display < b?.display ? -1 : 1));
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

  public clearSearch(): void {
    if (this.keywords == null) {
      this.keywords = '';
    }
    this.searchControl?.setValue(this.keywords);
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
      if (this.isRedundant(value)) {
        delete this.settings.navigationState.search;
        return;
      }
      this.onSearch(value);
    });

    if (this.searchApi) {
      this.searchResults$ = this.searchControl.valueChanges.pipe(
        distinctUntilChanged(),
        debounceTime(300),
        switchMap((value) => (this.searchApi ? this.searchApi(value) : Observable.create(undefined))),
      );
    }

    if (this.keywords.length > 0) {
      this.onSearch(this.keywords);
    }
  }

  public isRedundant(value: string | null | undefined): boolean {
    // Prevent redundant api call from adding search to searchterm list
    return (
      (!value &&
        this.searchTerms.length > 0 &&
        this.settings.navigationState?.search === this.searchTerms[this.searchTerms.length - 1].selectedOption?.Value) ??
      false
    );
  }

  public addSearchFilter(filter?: FilterData): void {
    setTimeout(() => {
      if (
        this.isEnterDisabled ||
        filter?.ColumnName === this.columnForTree ||
        filter?.Expression != null ||
        (!filter && (!this.searchControl.value || (!!this.searchControl.value && this.searchControl.value?.length === 0)))
      ) {
        // Here we return early if there is nothing to search over
        return;
      }

      const searchFilter = filter ?? {
        Type: FilterType.Search,
        Value1: this.searchControl?.value?.slice(),
        IsRegex: this.isRegex,
      };
      this.searchControl.reset('');

      this.searchTerms.push({
        selectedOption: {
          Display: searchFilter.Value1,
          Value: searchFilter.Value1,
          IsRegex: this.isRegex,
        },
        filter: {
          CurrentValue: searchFilter.Value1,
        },
      });
      if (this.isDataSourceLocal) {
        this.localFilterState.keywords = '';
        return;
      }

      if (this.settings.navigationState.filter) {
        this.settings.navigationState.filter.push(searchFilter);
      } else {
        this.settings.navigationState.filter = [searchFilter];
      }
    });
  }

  public removeSearchTerm(searchTerm: DataSourceToolbarSelectedFilter): void {
    let index = this.searchTerms.findIndex((st) => st.selectedOption?.Display === searchTerm.selectedOption?.Display);
    this.searchTerms.splice(index, 1);
    if (this.isDataSourceLocal) {
      this.localFilter();
      return;
    }
    if (!!this.settings.navigationState.filter && this.searchTerms.length - 1 !== this.settings.navigationState.filter.length) {
      // Here we have to check over the filters since the lengths didn't match, we subtract 1 to account for the splicing
      index = this.settings.navigationState.filter.findIndex((filter) => filter.Value1 === searchTerm.selectedOption?.Display);
    }
    if (!!this.settings.navigationState.filter) {
      this.settings.navigationState.filter.splice(index, 1);
    }
    this.navigationStateChanged.emit(this.settings.navigationState);
  }

  /**
   * @ignore Used internally
   * Attempts to find an existing selected filter matching the given name.
   * Returns the index or -1 if no match was found
   */
  private findSelectedFilterIndex(filterName: string, optionValue?: string): number {
    let index: number;
    if (optionValue) {
      index = this.selectedFilters.map((f) => (f.filter?.Name ?? '') + (f.selectedOption?.Value ?? '')).indexOf(filterName + optionValue);
    } else {
      index = this.selectedFilters.map((f) => f.filter?.Name).indexOf(filterName);
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
  private findFilterOptionFromValue(optionValue: string, filter: DataSourceToolbarFilter): DataModelFilterOption | undefined {
    const index = filter.Options?.map((opt) => opt.Value).indexOf(optionValue) ?? -1;
    return filter.Options && index > -1 ? filter.Options[index] : undefined;
  }

  /**
   * @ignore Used internally
   * Loops over the filters and adds any selected filters to the navigation state
   * as query parameters, and emits a navigationStateChanged event to let calling code know of the change
   *
   * If the datasource is local, will apply the filters here and emit a settingsChanged signal instead of a navigationStateChanged
   */
  private updateNavigateStateWithFilters(emit = true): void {
    this.settings.filters?.forEach((filter) => {
      if (filter.CurrentValue) {
        if (filter.Name) {
          this.settings.navigationState[filter.Name] = filter.CurrentValue;
        }
        if (filter?.Column) {
          // This is a local filter and we must filter over this column
          this.localFilterState.filterColumns[filter.Column] = filter.CurrentValue;
        }
      } else {
        if (filter.Name) {
          delete this.settings.navigationState[filter.Name];
        }
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
      this.navigationStateChanged.emit(this.settings.navigationState);
    }
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
        // First check keyword, '' is default and will return true
        searchResult = val.includes(this.localFilterState?.keywords?.toLocaleLowerCase());
        // Second check terms, allow for short circuiting
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
    if (this.isInitialLoad) {
      // We haven't yet loaded the data. Skip for now
      return;
    }
    this.internalDataSource.filter = 'Not Empty';
    this.settings.dataSource = {
      Data: this.internalDataSource.filteredData,
      totalCount: this.internalDataSource.filteredData.length,
    };
    this.settingsChanged.emit(this.settings);
  }

  public async openExportSidesheet(): Promise<void> {
    this.sidesheet.open(DataExportComponent, {
      title: await this.translate.get('#LDS#Heading Export Data').toPromise(),
      padding: '0px',
      width: calculateSidesheetWidth(1000),
      icon: 'export',
      data: this.settings,
    });
  }
}
