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

import {
  ChangeDetectorRef,
  Component,
  computed,
  effect,
  EventEmitter,
  Input,
  OnInit,
  Output,
  QueryList,
  Signal,
  ViewChild,
  WritableSignal,
} from '@angular/core';
import { MatColumnDef, MatTable } from '@angular/material/table';
import { CollectionLoadParameters, DataModel, EntitySchema, FilterData, IClientProperty } from '@imx-modules/imx-qbm-dbts';
import { isEqual } from 'lodash';
import { DataSourceItemStatus } from '../../data-source-toolbar/data-source-item-status.interface';
import { DataViewSource } from '../data-view-source';
import { ExecuteFunction, HightlightEntityFunction } from '../data-view.interface';

@Component({
  selector: 'imx-data-view-nested-table',
  templateUrl: './data-view-nested-table.component.html',
  providers: [DataViewSource],
})
export class DataViewNestedTableComponent implements OnInit {
  /**
   * Required input property to use the same execute function as the parent component.
   */
  @Input({ required: true }) execute: ExecuteFunction;
  /**
   * Required input property to use the same schema as the parent component.
   */
  @Input({ required: true }) schema: EntitySchema;
  /**
   * Required input property to use the same table columns as the parent component.
   */
  @Input({ required: true }) columnsToDisplay: IClientProperty[];
  /**
   * Optional input property to use the same data model as the parent component.
   */
  @Input() dataModel?: DataModel;
  /**
   * Table specific filters.
   */
  @Input() filterData?: FilterData[];
  /**
   * Filter and search params inherited from the parent component.
   */
  @Input() params: CollectionLoadParameters;
  /**
   * Inherited table row selectable.
   */
  @Input() selectable: boolean;
  /**
   * Inherited table row selection type.
   */
  @Input() singleSelection: boolean;
  /**
   * Use selection setter/getter to update the data source selection if the user uncheck some rows in the show selected only table.
   */
  @Input() set selection(selection: any[]) {
    this._selection = selection;
    this.dataSource.selection.setSelection(selection);
  }
  get selection(): any[] {
    return this._selection;
  }
  /**
   * Inherited writableSignal to use on table row click action.
   */
  @Input() highlightedEntity: WritableSignal<any>;

  /**
   *
   */

  @Input() public highlightedExecute: HightlightEntityFunction | undefined;
  /**
   * Set the no data title.
   */
  @Input() public noDataText;
  /**
   * Set the icon type, which shown, when there is no data.
   */
  @Input() public noDataIcon = 'content-alert';
  /**
   * Inherited table mode from auto table component.
   */
  @Input() public mode: 'auto' | 'manual';
  @Input() columnDefs: QueryList<MatColumnDef>;
  @Input() additionalColumns: IClientProperty[] = [];
  /**
   * Inherited data tabal item status;
   */
  @Input() itemStatus: DataSourceItemStatus;
  /**
   * An event emitter on table selection change.
   */
  @Output() selectionChange: EventEmitter<any[]> = new EventEmitter();
  /**
   * Array of the display columns. Add selectable column if selectable input property is true.
   */
  public namesOfDisplayedColumns: Signal<string[]> = computed(() => {
    if (this.selectable) {
      return ['select', ...this.dataSource?.columnsToDisplay()?.map((column) => column.ColumnName || '')];
    }
    return this.dataSource?.columnsToDisplay()?.map((column) => column.ColumnName || '');
  });
  /**
   * Signal hide paginator from the user when the DataViewSource total count is lower the the lowest page size option.
   */
  public hidePaginator: Signal<boolean> = computed(() => this.dataSource.totalCount() < this.dataSource.pageSizeOptions[0]);

  @ViewChild(MatTable, { static: true }) table: MatTable<any>;
  private _selection: any[] = [];
  private cacheColumnDefs: string[] = [];

  constructor(
    public readonly dataSource: DataViewSource,
    public changeDetectionRef: ChangeDetectorRef,
  ) {
    // use effect to update the parent highlightedEntity with the current highlightedEntity.
    effect(
      () => {
        if (this.dataSource.highlightedEntity() && !!this.highlightedEntity) {
          this.highlightedEntity.set(this.dataSource.highlightedEntity());
        }
      },
      { allowSignalWrites: true },
    );
    effect(() => {
      if (this.dataSource.columnsToDisplay() && this.columnDefs && this.table) {
        this.columnDefs.forEach((columnDef) => {
          if (this.cacheColumnDefs.indexOf(columnDef.name) === -1) {
            this.table.addColumnDef(columnDef);
            this.cacheColumnDefs.push(columnDef.name);
          }
        });
      }
    });
  }

  ngOnInit(): void {
    // Update the DataViewSource state before call init.
    this.dataSource.itemStatus = this.itemStatus;
    this.dataSource.state.update((state) => ({
      ...this.params,
      ...state,
      filter: [...(this.filterData || []), ...(this.params.filter || [])],
      search: this.params?.search,
    }));
    this.dataSource.additionalColumns.set(this.additionalColumns);
    this.dataSource.init({
      execute: this.execute,
      schema: this.schema,
      columnsToDisplay: this.columnsToDisplay,
      dataModel: this.dataModel,
      selectionChange: (selection: any[]) => {
        this.onSelectionChange(selection);
      },
      highlightEntity: this.highlightedExecute,
    });
  }

  /**
   * Calls when a nested table selection is changed and emit the selectionChange Event.
   * @param selection All the currently selected items.
   */
  public onSelectionChange(selection: any[]): void {
    if (!isEqual(this.selection, selection)) {
      this.selectionChange.emit(selection);
    }
  }

  /**
   * Select or clear all the currenlty visible rows.
   */
  public toggleAllRows(): void {
    if (this.dataSource.isAllSelected()) {
      this.dataSource.selection.clear();
      return;
    }

    this.dataSource.selection.select(this.dataSource.getAllSelectableEntities());
  }

  public onSingleSelectionChange(selection: any): void {
    this.dataSource.selection.setSelection([selection]);
  }
}
