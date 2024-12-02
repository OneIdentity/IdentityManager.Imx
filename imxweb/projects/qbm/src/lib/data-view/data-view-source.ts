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

import { DataSource, SelectionChange } from '@angular/cdk/collections';
import { Injectable, OnDestroy, Signal, WritableSignal, computed, effect, signal } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { Sort, SortDirection } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { EuiSelectOption } from '@elemental-ui/core';
import {
  CollectionLoadParameters,
  DataModel,
  DataModelProperty,
  ExtendedTypedEntityCollection,
  FilterTreeData,
  FilterType,
  GroupInfoData,
  IClientProperty,
  TypedEntity,
  ValType,
} from '@imx-modules/imx-qbm-dbts';
import { debounce } from 'lodash';
import { Observable, Subscription } from 'rxjs';
import { ClassloggerService } from '../classlogger/classlogger.service';
import { ConfirmationService } from '../confirmation/confirmation.service';
import { FilterTreeParameter } from '../data-source-toolbar/data-model/filter-tree-parameter';
import { DataSourceItemStatus } from '../data-source-toolbar/data-source-item-status.interface';
import { DataSourceToolbarExportMethod } from '../data-source-toolbar/data-source-toolbar-export-method.interface';
import { DataSourceToolbarFilter } from '../data-source-toolbar/data-source-toolbar-filters.interface';
import { DSTViewConfig, DataSourceToolbarViewConfig } from '../data-source-toolbar/data-source-toolbar-view-config.interface';
import { FilterTreeSelectionParameter } from '../data-source-toolbar/filter-wizard/filter-tree-sidesheet/filter-tree-sidesheet.model';
import { SelectionModelWrapper } from '../data-source-toolbar/selection-model-wrapper';
import { CompletedActionStates, QueuedActionState } from '../processing-queue/processing-queue.interface';
import { ProcessingQueueService } from '../processing-queue/processing-queue.service';
import { SettingsService } from '../settings/settings-service';
import { SqlWizardApiService } from '../sqlwizard/sqlwizard-api.service';
import {
  DataViewInitParameters,
  ExecuteFunction,
  ExecuteGroupFunction,
  GroupInfoRow,
  HightlightEntityFunction,
  SelectedFilter,
  SelectedFilterType,
  SelectionChangeFunction,
  WritableEntitySchema,
} from './data-view.interface';

/**
 * Set injectbale providedIn to null to have multiple instances of the DataViewSource service for every component.
 */
@Injectable({
  providedIn: null,
})
export class DataViewSource<T extends TypedEntity = TypedEntity, ExtendedType = any> implements DataSource<T>, OnDestroy {
  /**
   * Collection of the generic type.
   */
  public collectionData: WritableSignal<ExtendedTypedEntityCollection<T, ExtendedType>> = signal({ totalCount: 0, Data: [] });
  public entitySchema: WritableSignal<WritableEntitySchema>;
  public dataModel: WritableSignal<DataModel | undefined> = signal(undefined);
  public execute: ExecuteFunction;
  public entitySubject: Signal<T[] | readonly T[]> = computed(() => {
    this.selectionChanged();
    return this.showOnlySelected() ? this.selection.selected : this.collectionData().Data;
  });
  public entitySubject$: Observable<T[] | readonly T[]> = toObservable(this.entitySubject);
  public get count(): number {
    return this.collectionData()?.Data.length | 0;
  }
  public totalCount: Signal<number> = computed(() => {
    return !!this.groupByColumn() ? this.groupData()?.TotalCount || 0 : this.collectionData()?.totalCount || 0;
  });
  public getAllSelectableEntities: Signal<T[]> = computed(() => this.entitySubject().filter((entity) => this.itemStatus.enabled(entity)));

  public get data(): T[] {
    return this.collectionData()?.Data;
  }
  public loading: WritableSignal<boolean> = signal(true);
  public isLimitReached: Signal<boolean> = computed(() => !!this.collectionData().IsLimitReached);

  // Selection
  public readonly selection = new SelectionModelWrapper<T>();
  public selectionChanged: WritableSignal<SelectionChange<T> | undefined> = signal(undefined);
  public selectionChangeFunction: SelectionChangeFunction | undefined;
  public showOnlySelected: WritableSignal<boolean> = signal(false);

  // Table settings
  public columnsToDisplay: WritableSignal<IClientProperty[]> = signal([]);
  public initialColumnsToDisplay: IClientProperty[] = [];
  public optionalColumns: WritableSignal<(IClientProperty | undefined)[]> = signal([]);
  public additionalColumns: WritableSignal<IClientProperty[]> = signal([]);
  public additionalListColumns: WritableSignal<IClientProperty[] | undefined> = signal(undefined);
  public pageSizeOptions: number[] = [];
  public sortId: WritableSignal<string | undefined> = signal(undefined);
  public sortDirection: WritableSignal<SortDirection> = signal('');

  // Filters & settings
  public state: WritableSignal<CollectionLoadParameters> = signal({});
  public predefinedFilters: WritableSignal<DataSourceToolbarFilter[]> = signal([]);
  public selectedFilters: WritableSignal<SelectedFilter[]> = signal([]);
  public exportFunction: DataSourceToolbarExportMethod;
  public viewConfig: WritableSignal<DataSourceToolbarViewConfig | undefined> = signal(undefined);
  public showFilters: WritableSignal<boolean> = signal(false);
  /**
   * Signal, that calculates the number of the currently visible selected entities.
   */
  public currentSelectedEntityCount: Signal<number> = computed(() => {
    this.selectionChanged();
    return this.entitySubject().filter((entity) => this.selection.isSelected(entity)).length;
  });
  /**
   * Signal, that calculates all the visible and selectable rows are selected.
   */
  public isAllSelected: Signal<boolean> = computed(() => this.currentSelectedEntityCount() == this.getAllSelectableEntities().length);
  /**
   * Row click event signal.
   */
  public highlightedEntity: WritableSignal<T | undefined> = signal(undefined, { equal: () => false });
  public highlightedExecute: HightlightEntityFunction | undefined;

  // If the item is defined, then use the queue to find if its in the queue or completed. Otherwise return true
  private itemNotInQueueOrCompleted = (item?: TypedEntity) =>
    item
      ? [...CompletedActionStates, QueuedActionState.NotInQueue].includes(
          this.queueService.pollAction(item.GetEntity().GetKeys().join(',')),
        )
      : true;
  /**
   * Row status functions - enabled if queue status is failed or not in queue
   */
  public itemStatus: DataSourceItemStatus = {
    status: (item?) => (item ? this.queueService.pollAction(item.GetEntity().GetKeys().join(',')) : QueuedActionState.NotInQueue),
    enabled: this.itemNotInQueueOrCompleted,
    // By default, enabled = rowEnabled
    rowEnabled: this.itemNotInQueueOrCompleted,
  };

  // Group
  public groupOptions: EuiSelectOption[] = [];
  public groupByColumn: WritableSignal<IClientProperty | null> = signal(null);
  public groupData: WritableSignal<GroupInfoData | undefined> = signal(undefined);
  public groupedDataSource: Signal<MatTableDataSource<GroupInfoRow>> = computed(
    () => new MatTableDataSource<GroupInfoRow>(this.groupData()?.Groups ?? []),
  );
  /**
   * Map of nested selection.
   */
  public nestedSelection: Map<number, any[]> = new Map();
  private groupExecute: ExecuteGroupFunction;

  // Filter tree
  public filterTree: FilterTreeParameter;
  public filterTreeData: WritableSignal<FilterTreeData> = signal({});
  public filterTreeSelection: WritableSignal<FilterTreeSelectionParameter | undefined> = signal(undefined);

  private abortController = new AbortController();
  private subscription: Subscription;

  constructor(
    public readonly settings: SettingsService,
    public readonly log: ClassloggerService,
    public readonly confirmService: ConfirmationService,
    public readonly sqlWizardApiService: SqlWizardApiService,
    private readonly queueService: ProcessingQueueService,
  ) {
    this.pageSizeOptions = this.settings.DefaultPageOptions;
    this.state.set({ PageSize: this.settings?.DefaultPageSize, StartIndex: 0 });
    this.log.debug(this, 'Creating data source');
    this.subscription = this.selection.changed.subscribe((change) => {
      this.selectionChanged.set(change);
      if (this.selectionChangeFunction) {
        this.selectionChangeFunction(this.selection.selected);
      }
      if (this.selection.selected.length === 0) {
        this.showOnlySelected.set(false);
      }
    });
    effect(
      () => {
        // Check when a new group is submitted whether a selected item is in the queue, deselect if so
        this.queueService._groups();
        this.selection.selected.forEach((item) => {
          if (!this.itemStatus.enabled(item)) {
            this.selection.unChecked(item);
          }
        });
      },
      { allowSignalWrites: true },
    );
    effect(
      () => {
        if (this.highlightedEntity() && this.highlightedExecute) {
          this.highlightedExecute(this.highlightedEntity());
          this.highlightedEntity.set(undefined);
        }
      },
      { allowSignalWrites: true },
    );
  }

  ngOnDestroy(): void {
    this.log.debug(this, 'Destroying data source');
    this.subscription?.unsubscribe();
  }

  /**
   * Connects the data table with the data source.
   * @returns Observable that emits a new value when the data changes.
   */
  public connect(): Observable<readonly T[]> {
    this.log.debug(this, 'Connect');
    return this.entitySubject$;
  }

  /**
   * Disconnects the data table from this data source.
   */
  public disconnect(): void {
    this.log.debug(this, 'Disconnect');
  }

  /**
   * Initialize the data source and call updateState function.
   * @param initParameters The initParameters object contains all the required values to setup the data source properly.
   */
  public async init(initParameters: DataViewInitParameters<T>): Promise<void> {
    this.loading.set(true);
    this.log.info(this, 'Initializing data source');
    this.execute = initParameters.execute;
    this.collectionData.set({ totalCount: 0, Data: [] });
    this.entitySchema = signal({ ...initParameters.schema, LocalColumns: initParameters.schema.Columns });
    this.initialColumnsToDisplay = initParameters.columnsToDisplay;
    if (initParameters.viewConfig) {
      this.viewConfig.set(initParameters.viewConfig);
    }
    this.dataModel.set(initParameters.dataModel);
    this.setupGroupOptions();
    if (initParameters.groupExecute) {
      this.groupExecute = initParameters.groupExecute;
    }
    if (initParameters.exportFunction) {
      this.exportFunction = initParameters.exportFunction;
    }
    if (!initParameters.localSource) {
      await this.initFilters(initParameters);
    }
    this.selectionChangeFunction = initParameters.selectionChange;
    this.highlightedExecute = initParameters.highlightEntity;
    this.initOptionalColumns();
    if (initParameters.dataModel?.DefaultConfigId && !initParameters.uniqueConfig) {
      const config = this.viewConfig()?.viewConfigs?.find((config) => config.Id == this.dataModel()?.DefaultConfigId);
      if (config) {
        await this.applyConfig(config);
        return;
      }
    }
    await this.updateState();
    this.columnsToDisplay.set(initParameters.columnsToDisplay);
    this.loading.set(false);
  }

  /**
   * Calls the required execute function to reload the data.
   */
  public async updateState(forceUpdate: boolean = false): Promise<void> {
    this.log.info(this, 'Updating data source');
    this.abortCall();
    if (!!this.groupByColumn() && !!this.groupExecute && !forceUpdate) {
      this.loading.set(true);
      const groupData = await this.groupExecute(this.groupByColumn()?.ColumnName || '', this.state(), this.abortController.signal);
      this.groupData.set(groupData);
      this.loading.set(false);
    } else if (this.execute) {
      this.loading.set(true);
      let collectionData = await this.execute(this.state(), this.abortController.signal);
      if (!!collectionData) {
        collectionData.Data.map((elem) => {
          if (elem.GetEntity) {
            elem.GetEntity()?.ApplySchema(this.entitySchema());
          }
        });
        this.collectionData.set(collectionData);
      } else {
        this.collectionData.set({ totalCount: 0, Data: [] });
      }
      this.loading.set(false);
    }
  }

  /**
   * Update the data state sorting.
   * @param sortState The current sort state.
   */
  public sortChange(sortState: Sort) {
    if (sortState.direction) {
      this.sortId.set(sortState.active);
      this.sortDirection.set(sortState.direction);
      this.state.update((state) => ({ ...state, OrderBy: `${sortState.active} ${sortState.direction}` }));
    } else {
      this.sortId.set(undefined);
      this.sortDirection.set('');
      this.state.update((state) => ({ ...state, OrderBy: undefined }));
    }
    this.log.debug(this, 'Sort change', sortState.active, sortState.direction);
    this.updateState();
  }

  /**
   * Abort the previous data loading.
   */
  public abortCall(): void {
    this.log.info(this, 'Aborting call');
    this.abortController.abort();
    this.abortController = new AbortController();
    this.abortController.signal;
  }

  /**
   * Reset filters, columns and page index to default and than reload the data after a confirm dialog confirmation.
   */
  public async resetView(): Promise<void> {
    if (
      await this.confirmService.confirmDelete(
        '#LDS#Heading Reset View',
        '#LDS#If you reset the view, the search, sorting, filters and additional columns will be reset. Are you sure you want to reset the view?',
      )
    ) {
      this.state.set({ PageSize: this.settings?.DefaultPageSize, StartIndex: 0 });
      this.columnsToDisplay.set(this.initialColumnsToDisplay);
      this.selectedFilters.set([]);
      this.predefinedFilters.update((predefinedFilters) => predefinedFilters.map((filter) => ({ ...filter, CurrentValue: undefined })));
      this.filterTreeSelection.set(undefined);
      this.sortId.set(undefined);
      this.sortDirection.set('');
      this.updateState();
    }
  }

  /**
   * Apply the selected to config and reload the data table.
   * @param config The selected view config.
   */
  public async applyConfig(config: DSTViewConfig): Promise<void> {
    let columnsToDisplay = this.initialColumnsToDisplay;
    let additionalColumns: IClientProperty[] = [];
    this.state.set({ PageSize: this.settings?.DefaultPageSize, StartIndex: 0 });
    this.predefinedFilters.update((predefinedFilters) => predefinedFilters.map((filter) => ({ ...filter, CurrentValue: undefined })));
    this.selection.clear();
    //Update additional columns
    if (!!config.AdditionalTableColumns?.length) {
      additionalColumns =
        (this.dataModel()
          ?.Properties?.filter((property) => config?.AdditionalTableColumns?.includes(property?.Property?.ColumnName || ''))
          .filter((property) => !this.initialColumnsToDisplay.some((column) => column.ColumnName === property?.Property?.ColumnName))
          .map((property) => property?.Property)
          .filter((property) => !!property) as IClientProperty[]) || [];
      columnsToDisplay = [...this.initialColumnsToDisplay, ...additionalColumns];
      this.state.update((state) => ({ ...state, withProperties: config?.AdditionalTableColumns?.join(',') }));
      this.updateEntitySchema(config?.AdditionalTableColumns || []);
    }
    // Update predefined filters
    if (config.AdditionalParameters) {
      this.state.update((state) => ({ ...state, ...config.AdditionalParameters }));
      this.predefinedFilters.update((filters) =>
        filters.map((filter) => {
          if (!!config?.AdditionalParameters?.[filter.Name || '']) {
            return { ...filter, CurrentValue: config?.AdditionalParameters?.[filter.Name || ''] };
          } else {
            return filter;
          }
        }),
      );
    } else {
      this.predefinedFilters.set([...(this.dataModel()?.Filters || [])]);
    }
    this.additionalListColumns.set(
      config.AdditionalListColumns?.map(
        (column) => this.dataModel()?.Properties?.find((property) => property.Property?.ColumnName === column)?.Property,
      ).filter(Boolean) as IClientProperty[],
    );
    // Update selected filters
    if (!!config.Filter?.length) {
      this.state.update((state) => ({ ...state, filter: config.Filter?.filter((filter) => filter.Type === FilterType.Expression) }));
      this.selectedFilters.set(
        config.Filter?.map((filter) => {
          let selectedFilter: SelectedFilter;
          if (filter.Type == FilterType.Search) {
            selectedFilter = { type: SelectedFilterType.Keyword, value: filter.Value1 };
          } else {
            selectedFilter = { type: SelectedFilterType.Custom, value: { Expression: filter.Expression } };
          }
          return selectedFilter;
        }) || [],
      );
      this.setKeywords(
        config.Filter?.filter((filter) => filter.Type === FilterType.Search)
          .map((filter) => filter.Value1)
          .join(' ') || '',
      );
    } else {
      this.selectedFilters.set([]);
    }
    // Update order
    if (!!config.OrderBy) {
      this.state.update((state) => ({ ...state, OrderBy: config.OrderBy }));
      const order = config.OrderBy.split(' ');
      this.sortId.set(order[0]);
      this.sortDirection.set((order[1].toLowerCase() as SortDirection) || 'asc');
    }
    // Update grouping
    if (!!config.GroupBy) {
      const selectedOption = this.groupOptions.find((option) => option.value === config.GroupBy);
      this.groupByColumn.set(selectedOption?.clientProperty);
    }
    await this.updateState();
    this.columnsToDisplay.set(columnsToDisplay);
    this.additionalColumns.set(additionalColumns);
  }

  /**
   * Updates the state signal search property with the selected keywords
   * @param keywords All the searched keywords seperate with a space.
   */
  public setKeywords(keywords: string): void {
    const alreadySearched = this.state()
      .search?.split(' ')
      .map((item) => item.trim())
      .every((searchItem) => this.selectedFilters().find((filter) => filter.value === searchItem));

    let exisitingKeywords: string[] = this.selectedFilters()
      .filter((item) => item.type === SelectedFilterType.Keyword)
      .map((item) => (item.value as string).trim());
    let newKeywords: string[] = keywords
      .split(' ')
      .map((item) => item.trim())
      .filter((item) => item?.length > 0 && !exisitingKeywords.includes(item));

    this.state.update((state) => ({ ...state, search: newKeywords.join(' '), StartIndex: undefined }));
    const noAction = alreadySearched && !keywords;
    if (noAction) {
      return;
    }
    this.updateState();
  }

  /**
   * Updates the entitySchem with the required LocalColumns, because in entitySchema the column object is readonly.
   * @param additionalColumnNames The array of the columns.
   */
  public updateEntitySchema(additionalColumnNames: string[]): void {
    this.entitySchema.update((entitySchema) => {
      additionalColumnNames.map((column) => (entitySchema.LocalColumns[column] = this.getClientProperty(column)));
      return entitySchema;
    });
  }

  /**
   * Used to prevent unintended multiple signal firing
   */
  public debouncedHighlightRow = debounce((entity: T, event?) => this.highlightRow(entity, event), 250);

  /**
   * Highlights (selects) the current row and emits an event.
   * @param entity The selected row.
   * @param event The mouse clicked event.
   */
  public highlightRow(entity: T, event?: MouseEvent): void {
    // Prevent emission for certain cases
    if (event) {
      // Make sure we aren't selecting text
      if (event.view?.getSelection()?.type === 'Range') {
        return;
      }

      // Prevent button clicks from propogating as row clicks, Walk up node chain until we hit table looking if we are a button
      let target: HTMLElement | null = event.target as HTMLElement;
      while (target) {
        if (target.tagName === 'BUTTON') {
          return;
        }
        if (target.tagName === 'TABLE') {
          break;
        }
        target = target.parentElement;
      }
    }

    // Emit a changed event (even if the same row was selected), to allow any listners to decide whether to act or not
    // Signal is allowed if there is no rowEnabled function, or if the function is allowing it and the highlightedExecute function is initialized.
    if (!!this.highlightedExecute && (!this.itemStatus.rowEnabled || this.itemStatus.rowEnabled(entity)))
      this.highlightedEntity.set(entity);
  }

  /**
   * Checks a column sortable or not via the data model IsSortable property.
   * @param column The selected column name.
   * @returns Column is sortable.
   */
  public isSortable(column: string | undefined): boolean {
    if (!column || this?.dataModel() == null || !!this.groupByColumn()) {
      return false;
    }
    const sortable = this?.dataModel()?.Properties?.find((prop: DataModelProperty) => prop.Property?.ColumnName === column);
    return sortable == null ? false : sortable?.IsSortable;
  }

  /**
   * Returns the column display property or the column name to the table column header.
   * @param columnName the selected column name.
   * @param entitySchema the selected WritableEntitySchema
   * @returns The displayed column header.
   */
  public GetColumnDisplay(columnName: string, entitySchema?: WritableEntitySchema): string {
    const column = entitySchema?.LocalColumns[columnName];
    if (column == null || column.Display == null) {
      return columnName;
    }

    return column.Display;
  }

  /**
   * Set option columns from the dataModel signal.
   */
  private initOptionalColumns(): void {
    this.optionalColumns.set(
      this.dataModel()
        ?.Properties?.filter((property) => property.IsAdditionalColumn)
        .map((property) => property.Property) || [],
    );
  }

  /**
   * Initialize the filter properties.
   * @param initParameters The initParameters object contains all the required values to setup the data source properly.
   */
  async initFilters(initParameters: DataViewInitParameters<T>): Promise<void> {
    if (!!initParameters.dataModel?.Filters?.length || initParameters.filterTree) {
      this.showFilters.set(true);
    } else {
      const column = await this.sqlWizardApiService.getFilterProperties(this.entitySchema().TypeName ?? '');
      if (!!column.length && !!this.sqlWizardApiService.implemented) {
        this.showFilters.set(true);
      }
    }
    this.predefinedFilters.set([...(initParameters.dataModel?.Filters || [])]);
    if (initParameters.filterTree) {
      this.filterTree = initParameters.filterTree;
      this.filterTreeData.set(await this.filterTree.filterMethode(''));
    }
  }

  /**
   * Get IClientProperty from the entitySchema/dataModel or created it with string type.
   * @param name column name
   * @returns IClientProperty
   */
  private getClientProperty(name: string): IClientProperty {
    let property: IClientProperty | undefined;
    if (this.entitySchema()) {
      const key =
        Object.keys(this.entitySchema().LocalColumns).find((elem) => elem.toLocaleLowerCase() === name.toLocaleLowerCase()) ?? name;
      property = key != null ? this.entitySchema().LocalColumns[key] : undefined;
    }
    if (property == null) {
      property = this.dataModel()?.Properties?.find(
        (elem) => elem?.Property?.ColumnName?.toLocaleLowerCase() === name?.toLocaleLowerCase(),
      )?.Property;
    }
    if (property == null) {
      property = { ColumnName: name, Type: ValType.String };
    }
    return property;
  }

  /**
   * Setup group options. Inherited from data model groupable properties.
   */
  private setupGroupOptions(): void {
    this.groupOptions =
      this.dataModel()
        ?.Properties?.filter((property) => property.IsGroupable)
        .map((property) => ({
          display: property.Property?.Display || '',
          value: property.Property?.ColumnName || '',
          clientProperty: property.Property,
        })) || [];
    this.dataModel()?.GroupInfo?.map((groupInfo) => {
      groupInfo.Options?.map((option) => {
        const property: IClientProperty = {
          Type: ValType.Text,
          ColumnName: option.Value,
        };
        this.groupOptions.push({ display: `${option.Display} - ${groupInfo.Display}`, value: option.Value, clientProperty: property });
      });
    });
  }
}
