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

import { animate, state, style, transition, trigger } from '@angular/animations';
import { SelectionChange } from '@angular/cdk/collections';
import {
  Component,
  ViewChild,
  Input,
  Output,
  OnChanges,
  SimpleChanges,
  EventEmitter,
  ContentChildren,
  QueryList,
  OnDestroy,
  AfterViewInit,
  OnInit,
  ChangeDetectorRef,
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatTable, MatColumnDef, MatTableDataSource } from '@angular/material/table';
import { Subscription } from 'rxjs';

import { TypedEntity, IClientProperty, EntitySchema, CollectionLoadParameters, GroupInfo, GroupInfoData } from 'imx-qbm-dbts';
import { ImxTranslationProviderService } from '../translation/imx-translation-provider.service';
import { DataTableColumnComponent } from './data-table-column.component';
import { DataTableGenericColumnComponent } from './data-table-generic-column.component';
import { DataSourceToolbarComponent } from '../data-source-toolbar/data-source-toolbar.component';
import { DataSourceToolbarSettings } from '../data-source-toolbar/data-source-toolbar-settings';
import { DataTableGroupedData } from './data-table-groups.interface';
import { RowHighlight } from './data-table-row-highlight.interface';
import { GroupPaginatorInformation } from './group-paginator/group-paginator.component';
import { EuiLoadingService } from '@elemental-ui/core';
import { OverlayRef } from '@angular/cdk/overlay';
import { debounce } from 'lodash';

/**
 * A data table component with a detail view specialized on typed entities.
 * Collaborates with a DST (datasource toolbar).
 *
 * TODO: We don't us the 'T' in DataTableComponent<T>. Remove it.
 *
 * @example
 * A simple example of a data table, a DST and a paginator.
 *
 * <imx-data-source-toolbar #dst [settings]="mySettings"></imx-data-source-toolbar>
 * <imx-data-table
 *              [dst]="myDst"
 *              [detailViewTitle]="detailViewTitle"
 *              (highlightedEntityChanged)="onHighlightedEntityChanged($event)"
 *              [selectable]="true">
 * </imx-data-table>
 * <imx-data-source-paginator [dst]="myDst"></imx-data-source-paginator>
 */
@Component({
  selector: 'imx-data-table',
  templateUrl: './data-table.component.html',
  styleUrls: ['./data-table.component.scss'],
  animations: [
    trigger('groupExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})
export class DataTableComponent<T> implements OnInit, OnChanges, AfterViewInit, OnDestroy {
  public get numOfSelectedItems(): number {
    return this.dst.numOfSelectedItems;
  }

  public get numOfSelectableRows(): number {
    return this.dst?.numOfSelectableItems;
  }

  /**
   * @ignore Used internally in components template.
   * Represents the typed entity that is selected when the users clicks on a row.
   * Not to be confused with the 'selection' property.
   */
  public highlightedEntity: TypedEntity;

  /**
   * @ignore Used internally in components template.
   * The internal mat table datasource bound to the mat table.
   */
  public dataSource: MatTableDataSource<TypedEntity> = new MatTableDataSource<TypedEntity>([]);

  /**
   * @ignore Used internally in components template.
   * The internal mat table datasource bound to the mat table.
   */
  public groupedDataSource: MatTableDataSource<GroupInfo> = new MatTableDataSource<GroupInfo>([]);

  /**
   *  @ignore Used internally in components template.
   * Information for the group paginator (containing {@link GroupInfoData|Data table component} for the selected group and the navigation state)
   */
  public groupPaginatorInformation: GroupPaginatorInformation;

  /**
   * @ignore Used internally in components template.
   * The display column for the grouped by table
   */
  public groupDisplayedColumns: string[] = ['Display'];

  /**
   * @ignore Used internally in components template.
   * List that indicates which typed entity properties should be shown.
   */
  @ContentChildren(DataTableColumnComponent) public manualColumns: QueryList<DataTableColumnComponent<T>>;

  /**
   * @ignore Used internally in components template.
   * List of generic columns.
   */
  @ContentChildren(DataTableGenericColumnComponent) public manualGenericColumns: QueryList<DataTableGenericColumnComponent>;

  /**
   * @ignore Used internally in components template.
   * The internaly used mat table.
   */
  @ViewChild(MatTable, { static: true }) public table: MatTable<T>;

  /**
   * The datasource toolbar component.
   */
  @Input() public dst: DataSourceToolbarComponent;

  /**
   * List that indicates, which entity typed properties should be shown.
   */
  @Input() public displayedColumns: IClientProperty[] = [];

  public additional: IClientProperty[] = [];

  /**
   * The entity schema of the typed entity.
   */
  @Input() public entitySchema: EntitySchema;

  /**
   * If set to 'auto' (= default) the data table will check the 'displayedColumns' input field and build a visual presentation.
   * If set to 'manual' the data table will check the 'displayedColumns' input field, then read the
   * column templates (DataTableColumnComponent or DataTableGenericColumnComponent) and render those.
   */
  @Input() public mode: 'auto' | 'manual' = 'auto';

  @Input() public nested = false;

  /**
   * Optional input
   * Used to pass manual columns through to nested data-tables for group by functionality
   */
  @Input() public parentManualColumns?: QueryList<DataTableColumnComponent<T>>;

  @Input() public parentAdditionals?: IClientProperty[] = [];

  /**
   * Optional input
   * Used to pass manual generic columns through to nested data-tables for group by functionality
   */
  @Input() public parentManualGenericColumns?: QueryList<DataTableGenericColumnComponent>;

  /**
   * Indicates, if multiselect is enabled.
   */
  @Input() public selectable = false;

  @Input() public showSelectionInfo = true;

  /**
   * Shows/hides header for selecting all items on the page.
   */
  @Input() public showSelectAllOption = true;

  /**
   * The title of the detail view.
   */
  @Input() public detailViewTitle: string;

  /**
   * Indicates if the detail view should be visible.
   */
  @Input() public detailViewVisible = true;

  /**
   * Group by data used to work with the GroupBy options from the data source toolbar
   */
  @Input() public groupData: { [key: string]: DataTableGroupedData } = {};

  /**
   * This text will be displayed when there is no data on the datasource (and a search/filter is not applied)
   * Defaults to a generic message when not supplied
   */
  @Input() public noDataText = '#LDS#No data';

  /**
   * This icon will be displayed when there is no data on the datasource (and a search is not applied)
   * Defaults to the 'table' icon when not supplied
   */
  @Input() public noDataIcon = 'table';

  /**
   * This text will be displayed when a search or filter is applied but there is no data as a result
   * Defaults to a generic message when not supplied
   */
  @Input() public noMatchingDataText = '#LDS#There is no data matching your search.';

  /**
   * This icon will be displayed along with the 'noMatchingDataTranslationKey' text when a search or filter
   * is applied but there is no data as a result
   * Defaults to the 'search' icon when not supplied
   */
  @Input() public noMatchingDataIcon = 'search';

  /**
   * Determines if the selected items menu is visible or not.
   */
  @Input() public showSelectedItemsMenu = true;

  /**
   * Allows any nested groupedBy tables to know if there are filters applied
   * so they can display the correct no-data state
   */
  @Input() public groupedTableHasFiltersApplied?: boolean;

  /**
   * Provide a functional filter that returns a boolean to apply the background color from imx-data-table-row-conditional class
   * Example: filter: (row: AttestationCase) => {return row.hasHighlightProperty}
   */
  @Input() public highlightRowFilter?: RowHighlight;

  /**
   * Shows/hides grouped data table paginator.
   */
  @Input() public showGroupPaginator = true;

  /**
   * An emitted event that contains information on the group that was selected/interacted with
   */
  @Output() public groupDataChanged = new EventEmitter<string>();

  /**
   * Used to prevent unintended multiple signal firing
   */
  public debouncedHighlightRow = debounce((entity, event?) => this.highlightRow(entity, event), 250);
  /**
   * An emitted event that contains the highlighted typed entity after a user has selected a row in the table.
   */
  @Output() public highlightedEntityChanged = new EventEmitter<TypedEntity>();

  /**
   * An emitted event that contains a list of selected typed entities.
   */
  @Output() public selectionChanged = new EventEmitter<TypedEntity[]>();

  /**
   * Data  source toolbar settings.
   *
   * TODO: Check why this is public.
   */
  public settings: DataSourceToolbarSettings;

  /**
   * @ignore Used internally.
   * Returns true highlightedEntityChanged ouput is used.
   * Would be used for setting the hover-style.
   */
  public ishighlightedEntityChangedUsed: boolean;

  /**
   * @ignore Used internally.
   * returns whether a busy indicator should be shown or not
   *    */
  public isLoading: boolean = true;

  /**
   * @ignore Used internally.
   * Definitions of internally used mat columns.
   */
  private columnDefs: MatColumnDef[];

  /**
   * @ignore
   * List of subscriptions.
   */
  private subscriptions: Subscription[] = [];

  /**
   * @ignore
   * Keeps track of any previous applied grouping selection (groupBy)
   */
  private previousGroupingDisplay?: string;

  constructor(
    public translateProvider: ImxTranslationProviderService,
    public dialog: MatDialog,
    private readonly busyService: EuiLoadingService,
    private readonly changeDetectorRef: ChangeDetectorRef
  ) {}

  public get isGroupingApplied(): boolean {
    let result = false;
    if (this.settings && this.settings.groupData && this.settings.groupData.currentGrouping) {
      result = true;
    }
    return result;
  }

  /**
   * @ignore Used internally.
   * Does most of the initializing stuff.
   */
  public ngOnInit(): void {
    this.ishighlightedEntityChangedUsed = this.highlightedEntityChanged.observers.length > 0;
  }

  /**
   * @ignore Used internally.
   * Does most of the initializing stuff.
   */
  public ngAfterViewInit(): void {
    setTimeout(async () => {
      if (this.dst && this.dst.settings) {
        this.settings = this.dst.settings;
        await this.dstHasChanged();
      }
    });
  }

  /**
   * @ignore Used internally.
   *
   * Listens for changes of data table inputs e.g. checks it the datasource has changed.
   */
  public async ngOnChanges(changes: SimpleChanges): Promise<void> {
    if (changes['mode'] && changes['mode'].currentValue) {
      if (this.mode === 'auto') {
        if (this.dst.dataSourceChanged && this.columnDefs) {
          this.columnDefs.forEach((colDef) => this.table.removeColumnDef(colDef));
        }
      }
    }

    if (changes['dst'] && changes['dst'].currentValue) {
      this.subscriptions.push(
        this.dst.settingsChanged.subscribe(async (value: DataSourceToolbarSettings) => {
          if (this.dst.dataSourceHasChanged) {
            this.settings = value;
            await this.dstHasChanged();
          }
        })
      );

      this.subscriptions.push(
        this.dst.selectionChanged.subscribe((event: SelectionChange<TypedEntity>) => {
          if (event && event.source) {
            this.selectionChanged.emit(event.source.selected);
          }
        })
      );

      this.subscriptions.push(
        this.dst.shownColumnsSelectionChanged.subscribe(async (value) => {
          if (!!this.settings) {
            await this.dstHasChanged();
          }
        })
      );

      if (this.dst.busyService) {
        this.subscriptions.push(
          this.dst.busyService.busyStateChanged.subscribe((busy: boolean) => {
            this.isLoading = busy;
            this.changeDetectorRef.detectChanges();
          })
        );
      }
      this.isLoading = this.dst?.busyService?.isBusy ?? false;
    }
  }

  /**
   * @ignore Used internally.
   * Unsubscribes all listeners.
   */
  public ngOnDestroy(): void {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }

  public isSelectable(item: TypedEntity): boolean {
    return this.dst?.itemStatus?.enabled(item);
  }

  /**
   * Clears selection.
   */
  public clearSelection(): void {
    this.dst.clearSelection();
  }

  public numOfSelectedItemsOnPage(): number {
    return this.dst.numOfSelectedItemsOnPage();
  }

  /**
   * @ignore Used internally in components template.
   * Indicates if all rows on the current page are selected.
   */
  public allSelected(): boolean {
    return this.dst.allSelected();
  }

  /**
   * @ignore Used internally in components template.
   * Toggles the selection.
   */
  public toggleSelection(): void {
    this.dst.toggleSelection();
  }

  /**
   * @ignore Used internally in components template.
   * Gets the display values of displayed columns
   */
  public getNamesOfDisplayedColumns(): string[] {
    let displayedColumnNames = [];

    if (this.displayedColumns && this.displayedColumns.length > 0) {
      displayedColumnNames = this.displayedColumns.map((item) => item.ColumnName);
    }

    if (this.selectable) {
      displayedColumnNames.splice(0, 0, 'select');
    }

    return displayedColumnNames;
  }

  /**
   * @ignore Used internally in components template.
   * Highlights (selects) the current row and emits an event.
   */
  public highlightRow(entity: TypedEntity, event?: MouseEvent): void {
    if (entity !== this.highlightedEntity) {
      this.highlightedEntity = entity;
    }

    // Prevent emission for certain cases
    if (event) {
      // Make sure we aren't selecting text
      if (event.view.getSelection().type === 'Range') {
        return;
      }

      // Prevent button clicks from propogating as row clicks, Walk up node chain until we hit table looking if we are a button
      let target = event.target as HTMLElement;
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
    this.highlightedEntityChanged.emit(this.highlightedEntity);
  }

  public isHighlight(entity: TypedEntity): boolean {
    if (!this.highlightRowFilter) {
      // Value is null
      return false;
    }
    return this.highlightRowFilter.filter(entity);
  }

  /**
   * @ignore Used internally in components template.
   * Gets the display value for a specific column.
   */
  public getDisplayValue(entity: TypedEntity, column: IClientProperty): string {
    return entity.GetEntity().GetColumn(column.ColumnName).GetDisplayValue();
  }

  /**
   * @ignore Used internally in components template.
   * Selects a row.
   */
  public checked(row: TypedEntity): void {
    this.dst.checked(row);
  }

  /**
   * @ignore Used internally in components template.
   * Deselects a row.
   */
  public unChecked(row: TypedEntity): void {
    this.dst.unChecked(row);
  }

  /**
   * @ignore Used internally in components template.
   * Checks if a row is selected.
   */
  public isChecked(row: TypedEntity): boolean {
    return this.dst.isChecked(row);
  }

  /**
   * @ignore Used internally in components template
   * Manages state of group information whether expanded or not
   * Emits an event to allow data to be retrieved from calling code if no data is present
   */
  public onGroupExpanded(group: GroupInfo): void {
    if (group && group.Count > 0) {
      const groupingDisplay = group.Display[0].Display;
      if (!this.groupData[groupingDisplay]) {
        this.groupData[groupingDisplay] = {
          data: undefined,
          settings: undefined,
          navigationState: undefined,
        };
      }
      const groupData = this.groupData[groupingDisplay];
      if (!groupData.navigationState) {
        groupData.navigationState = {
          PageSize: 25,
          StartIndex: 0,
          filter: group.Filters,
          withProperties: this.dst?.settings?.navigationState?.withProperties,
        };
      }

      // Toggle if group is expanded in view or not
      groupData.isExpanded = !groupData.isExpanded;

      this.propagateNavigationSettingsToGroups(true);
      if (groupData.isExpanded) {
        this.groupDataChanged.emit(groupingDisplay);
      }
    }
  }

  /**
   * @ignore Used internally in components template
   * Manages selections within groups
   */
  public selectionInGroupChanged(items: TypedEntity[], groupKey: string): void {
    const groupingData = this.groupData[groupKey];

    setTimeout(() => {
      if (groupingData.selected) {
        groupingData.selected.forEach((selectedItem) => {
          if (!items.find((item) => this.getId(item) === this.getId(selectedItem))) {
            this.unChecked(selectedItem);
          }
        });
      }

      groupingData.selected = [];

      items.forEach((item) => {
        groupingData.selected.push(item);
        this.checked(item);
      });
    });
  }

  /**
   * @ignore Used internally in components template
   * Occurs when the navigation state has changes on one of the nested grouped by tables
   * e.g. users clicks on the next page button.
   *
   */
  public onNavigationStateChanged(groupKey: string, newState: CollectionLoadParameters): void {
    // Raise event to allow group data to be updated
    this.groupData[groupKey].navigationState = newState;
    this.groupDataChanged.emit(groupKey);
  }

  /**
   * @ignore Used internally in components template
   * Occurs when the navigation state for grouping has changed
   * e.g. users clicks on the next page button.
   *
   */
  public async overallGroupingStateChanged(newState: CollectionLoadParameters): Promise<void> {
    return this.updateGroupingState(this.settings?.groupData?.currentGrouping, newState);
  }

  /**
   * @ignore Used internally.
   * updated the navigation state for the current grouping and loads its content
   */
  private async updateGroupingState(currentGrouping: any, newState?: CollectionLoadParameters): Promise<void> {
    let busyIndicator: OverlayRef;
    setTimeout(() => (busyIndicator = this.busyService.show()));

    try {
      if (newState) {
        currentGrouping.navigationState = newState;
      }

      this.groupPaginatorInformation = {
        currentData: await currentGrouping.getData(currentGrouping.navigationState),
        navigationState: currentGrouping.navigationState,
      };

      this.groupedDataSource = new MatTableDataSource<GroupInfo>(this.groupPaginatorInformation.currentData.Groups);
    } finally {
      setTimeout(() => this.busyService.hide(busyIndicator));
    }
  }

  /**
   * @ignore Used internally.
   * Some settings of DST has changed. Check changes.
   */
  private async dstHasChanged(): Promise<void> {
    // TODO: hier die additional columns berücksichtigen?
    if (this.settings && this.settings.entitySchema) {
      this.entitySchema = this.settings.entitySchema;
      this.manualColumns.forEach((item: DataTableColumnComponent<any>) => {
        item.entitySchema = this.entitySchema;
      });
    }

    if (this.settings && this.settings.dataSource) {
      this.dataSource = new MatTableDataSource<TypedEntity>(this.settings.dataSource.Data);
    }

    const currentGrouping = this.settings?.groupData?.currentGrouping;

    // Detect if the currentGrouping has changed since last selection
    const groupByChanged = currentGrouping?.display !== this.previousGroupingDisplay;
    if (groupByChanged) {
      this.clearSelection();
    }

    // Keep a reference of what the current grouping is for next time
    this.previousGroupingDisplay = currentGrouping?.display;

    if (currentGrouping) {
      // Apply any search/filters from group container table to the inner grouped by data states
      this.propagateNavigationSettingsToGroups(false, groupByChanged);

      this.updateGroupingState(currentGrouping, { ...this.settings.navigationState, ...{ StartIndex: 0 } });
    }

    this.highlightedEntity = null;

    if (this.columnDefs) {
      this.columnDefs.forEach((colDef) => this.table.removeColumnDef(colDef));
    }

    if ((this.dst.dataSourceChanged || this.dst.shownColumnsSelectionChanged) ) {
      this.displayedColumns = [];
      this.additional = this.dst == null || this.dst.additionalColumns?.length === 0 ? this.parentAdditionals : this.dst.additionalColumns;
      // filter additionals for columns, that are already set in the DataSourceToolbarSettings
      this.additional = this.additional.filter((elem) =>
        this.settings?.displayedColumns?.every((disp) => disp.ColumnName !== elem.ColumnName)
      );
      if (this.manualColumns == null && this.manualGenericColumns == null) {
        return;
      }

      this.columnDefs = [];

      if (this.manualColumns && this.table) {
        let mcolumns = this.manualColumns;
        if (mcolumns.length === 0 && this.parentManualColumns) {
          mcolumns = this.parentManualColumns;
        }
        mcolumns.forEach((column) => {
          this.table.addColumnDef(column.columnDef);
          this.columnDefs.push(column.columnDef);
        });
      }

      if (this.manualGenericColumns && this.table) {
        let gcolumns = this.manualGenericColumns;
        if (gcolumns.length === 0 && this.parentManualGenericColumns) {
          gcolumns = this.parentManualGenericColumns;
        }
        gcolumns.forEach((column) => {
          this.table.addColumnDef(column.columnDef);
          this.columnDefs.push(column.columnDef);
        });
      }
    }

    if (this.dst && this.dst.shownClientProperties?.filter((elem) => elem != null)?.length > 0 && !this.nested) {
      this.displayedColumns = this.dst.shownClientProperties.filter((elem) => elem != null);
    } else {
      if (this.settings && this.settings.displayedColumns) {
        this.displayedColumns = this.settings.displayedColumns.concat(this.additional);
      }
    }

    if ((this.displayedColumns == null || this.displayedColumns.length === 0) && this.entitySchema) {
      this.displayedColumns = [];
      for (const key in this.entitySchema?.Columns) {
        if (this.entitySchema?.Columns?.hasOwnProperty(key)) {
          const element = this.entitySchema?.Columns[key];
          this.displayedColumns.push(element);
        }
      }
    }
  }

  private getId(typedEntity: TypedEntity): string {
    return typedEntity.GetEntity().GetKeys().join(',');
  }

  /**
   * @ignore Used internally.
   * Propagates the navigation settings from the grouped by table container down to any
   * nested group data tables
   * e.g The search and filter queries
   * Ensures that a search or filter at the top level is applied to all grouped data tables
   */
  private propagateNavigationSettingsToGroups(skipNavigationChange: boolean = false, groupByChanged: boolean = false): void {
    if (this.groupData) {
      Object.keys(this.groupData).forEach((key) => {
        const grouping = this.groupData[key];

        // If the currentGrouping has changed, then reset expanded state on all data entries
        if (groupByChanged) {
          grouping.isExpanded = false;
        }

        if (grouping.isExpanded || skipNavigationChange) {
          const preservedGroupingFilter = grouping.navigationState.filter;
          grouping.navigationState = JSON.parse(JSON.stringify(this.settings.navigationState));
          grouping.navigationState.filter = preservedGroupingFilter;
          grouping.navigationState.StartIndex = 0;
          grouping.navigationState.withProperties = this.settings.navigationState.withProperties;
          if (!skipNavigationChange) {
            this.onNavigationStateChanged(key, grouping.navigationState);
          }
        }
      });
    }
  }
}
