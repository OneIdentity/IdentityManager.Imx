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
 * Copyright 2025 One Identity LLC.
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
import {
  AfterContentInit,
  Component,
  Input,
  Signal,
  WritableSignal,
  computed,
  contentChildren,
  effect,
  signal,
  viewChild,
} from '@angular/core';
import { MatColumnDef, MatTable } from '@angular/material/table';
import { DisplayColumns, GroupInfoType, IEntity } from '@imx-modules/imx-qbm-dbts';
import { isEqual } from 'lodash';
import { ClassloggerService } from '../../classlogger/classlogger.service';
import { buildAdditionalElementsString } from '../../data-table/data-table-additional-info.model';
import { QueuedActionState } from '../../processing-queue/processing-queue.interface';
import { ImxTranslationProviderService } from '../../translation/imx-translation-provider.service';
import { DataViewSource } from '../data-view-source';
import { GroupInfoRow } from '../data-view.interface';
/**
 *
 * @example
 * Base example with default 'auto' mode.
 *
 *  <imx-data-view-auto-table [dataSource]="dataSource"></imx-data-view-auto-table>
 *
 * @example
 * The fallowing exmaple show how to use the 'manual mode, set selection option and use sorting on manual column.
 * To use sorting on manual column you need to add the 'matSort' directive to the imx-data-view-auto-table and add 'mat-sort-header' directive to the required th element.
 *
 *  <imx-data-view-auto-table
 *    [dataSource]="dataSource"
 *    [selectable]="true"
 *    mode="manual"
 *    matSort
 *    (matSortChange)="dataSource?.sortChange($event)"
 *    [matSortActive]="dataSource.sortId()"
 *    [matSortDirection]="dataSource.sortDirection()"
 *  >
 *    <ng-container [matColumnDef]="this.displayColumns.DISPLAY_PROPERTYNAME">
 *      <th mat-header-cell *matHeaderCellDef>{{ identitySchema?.Columns[this.displayColumns.DISPLAY_PROPERTYNAME]?.Display }}</th>
 *      <td mat-cell *matCellDef="let item">
 *        <div data-imx-identifier="identities-tabledata-display">{{ item.GetEntity().GetDisplay() }}</div>
 *        <div subtitle data-imx-identifier="identities-tabledata-description">{{ item.DefaultEmailAddress.Column.GetDisplayValue() }}</div>
 *        <imx-data-view-status [status]="dataSource.itemStatus.status(item)"/>
 *      </td>
 *    </ng-container>
 *    <ng-container [matColumnDef]="identitySchema.Columns.IsSecurityIncident.ColumnName">
 *      <th mat-header-cell *matHeaderCellDef mat-sort-header [disabled]="dataSource.showOnlySelected()">{{ identitySchema?.Columns.IsSecurityIncident?.Display }}</th>
 *      <td mat-cell *matCellDef="let item">
 *        <div *ngIf="item.IsSecurityIncident.value">
 *          <eui-badge color="red">{{ '#LDS#Security risk' | translate }}</eui-badge>
 *        </div>
 *      </td>
 *    </ng-container>
 *  </imx-data-view-auto-table>
 */
@Component({
  selector: 'imx-data-view-auto-table',
  templateUrl: './data-view-auto-table.component.html',
  styleUrls: ['./data-view-auto-table.component.scss'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
  standalone: false,
})
export class DataViewAutoTableComponent implements AfterContentInit {
  /**
   * Input the dataViewSource service. It handles all the action and the data loading. This input property is required.
   */
  @Input({ required: true }) public dataSource: DataViewSource;

  /**
   * Set the no data title.
   */
  @Input() public noDataText: string;
  /**
   * Set the icon type, which shown, when there is no data.
   */
  @Input() public noDataIcon = 'content-alert';
  /**
   * Indicates, if multiselect is enabled.
   */
  @Input() public selectable = false;
  /**
   * Indicates the selection type.
   */
  @Input() public singleSelection = false;

  /**
   * If set to 'auto' (= default) the data table will check the 'displayedColumns' input field and build a visual presentation.
   * If set to 'manual' the data table render all the material columns in the content of the data view auto table component. In manual mode the additional columns also available.
   */
  @Input() public mode: 'auto' | 'manual' = 'auto';

  /**
   * Add a refresh button to the grouped table, to reload the data in the nested table.
   */
  @Input() public refreshButton = false;

  /**
   * TODO: Refine if needed
   * If mode is 'auto', then specify the name of the column you want a queue status badge to appear under. If left blank, then no status badge will appear, even if item is in the processing queue.
   * This input has no effect on 'manual', as the injected ng-container should contain the reference to the imx-data-view-status component
   */
  // @Input() public queueStatusColumnName: string;
  public table = viewChild<MatTable<any>>('autoTable');
  public columnDefs = contentChildren<MatColumnDef>(MatColumnDef);

  /**
   * Array of the display columns.
   */
  public namesOfDisplayedColumns: WritableSignal<string[]> = signal([]);
  /**
   * Array of the grouped display columns.
   */
  public groupColumnsToDisplayWithExpand = ['Display', 'expand'];
  /**
   * Signal about grouping is applied.
   */
  public isGroupingApplied: Signal<boolean> = computed(() => !!this.dataSource.groupByColumn());

  public stateOptions = QueuedActionState;
  public groupInfoTypeEnum = GroupInfoType;
  public DisplayColumns = DisplayColumns;
  private cacheColumnDefs: readonly MatColumnDef[] = [];
  private contentInit: WritableSignal<boolean> = signal(false);

  constructor(
    public readonly translateProvider: ImxTranslationProviderService,
    public readonly groupedDataSource: DataViewSource,
    public readonly log: ClassloggerService,
  ) {
    effect(() => {
      if (
        this.dataSource.columnsToDisplay() &&
        this.columnDefs() &&
        this.table() &&
        this.dataSource.triggerRender() &&
        this.contentInit()
      ) {
        this.log.debug(this, 'Setting columns to display...');
        this.cacheColumnDefs.map((columnDef) => this.table()?.removeColumnDef(columnDef));
        this.columnDefs().forEach((columnDef) => {
          this.table()?.removeColumnDef(columnDef);
          this.table()?.addColumnDef(columnDef);
        });
        this.cacheColumnDefs = this.columnDefs();
        if (this.selectable) {
          this.namesOfDisplayedColumns.set(['select', ...this.dataSource?.columnsToDisplay()?.map((column) => column.ColumnName || '')]);
        } else {
          this.namesOfDisplayedColumns.set(this.dataSource?.columnsToDisplay()?.map((column) => column.ColumnName || ''));
        }
      }
    });
    effect(() => {
      if (this.isGroupingApplied()) {
        this.namesOfDisplayedColumns.set([]);
      }
    });
    effect(() => {
      if (this.dataSource.showOnlySelected()) {
        this.namesOfDisplayedColumns.set([]);
        this.dataSource.renderRows();
      }
    });
  }

  ngAfterContentInit(): void {
    this.contentInit.set(true);
  }

  /**
   * Select or clear all the currenlty visible rows.
   */
  public toggleAllRows(): void {
    if (this.dataSource.isAllSelected()) {
      this.dataSource.data.map((entity) => this.dataSource.selection.unChecked(entity));
      this.dataSource.nestedSelection = new Map();
      return;
    }

    this.dataSource.selection.select(this.dataSource.getAllSelectableEntities());
  }

  /**
   * Expand the selected row in grouped data table.
   * @param group the selected grouped row.
   */
  public expandGroup(group: GroupInfoRow): void {
    if (!!group.Count && group.Count > 0) {
      group.expanded = !group.expanded;
    }
  }

  public refreshGroup(group: GroupInfoRow): void {
    group.refreshTable = !group.refreshTable;
  }

  /**
   * Calls from the template when a selection is changing in the nested tables. Updates the nested selection and calls DataViewSource SelectionModelWrapper setSelection function.
   * @param selection The selected array.
   * @param tableIndex The nested table index.
   */
  public onNestedSelectionChange(selection: any[], tableIndex: number): void {
    if (this.singleSelection) {
      this.dataSource.nestedSelection = new Map();
    }
    this.dataSource.nestedSelection.set(tableIndex, selection);
    let nestedSelection: any[] = [];
    this.dataSource.nestedSelection.forEach((tableSelection) => {
      nestedSelection.push(...tableSelection);
    });
    this.dataSource.selection.setSelection(nestedSelection);
  }

  /**
   * Returns the selected nested table selection.
   * @param index The selected nested table index.
   */
  public getNestedSelection(index: number): any[] {
    return this.dataSource.nestedSelection.get(index) || [];
  }

  /**
   * Remove the selectedItem from the nested table selection.
   * @param selectedItem The selected item to remove.
   */
  public onRemoveSelection(selectedItem: any): void {
    this.dataSource.nestedSelection.forEach((value, key) => {
      const newValue = value.filter((item) => !isEqual(item, selectedItem));
      this.dataSource.nestedSelection.set(key, newValue);
    });
  }

  public onSingleSelectionChange(selectedItem: any) {
    this.dataSource.selection.setSelection([selectedItem]);
    this.onRemoveSelection(selectedItem);
  }

  public getSubtitleText(column: IEntity): string {
    return buildAdditionalElementsString(column, this.dataSource.additionalListColumns()!);
  }
}
