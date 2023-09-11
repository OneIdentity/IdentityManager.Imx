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

import {
  Component,
  Input,
  ContentChildren,
  QueryList,
  ViewChild,
  AfterContentInit,
  Output,
  EventEmitter,
  ContentChild,
  TemplateRef,
  ElementRef,
  OnDestroy
} from '@angular/core';
import { MatTable, MatColumnDef } from '@angular/material/table';
import { Subscription } from 'rxjs';

import { ImxDataSource } from './imx-data-source';
import { ImxMatColumnComponent } from './MatColumn';
import { ImxExpandableItem } from './imx-data-source';

@Component({
  selector: 'imx-tree-table',
  templateUrl: './treeTable.component.html',
  styles: [
    `
      .customWidthClass {
        flex: 0 0 50px;
      }
    `
  ]
})

/*
  Provides a combination of a tree and a table control Excample:
     column 1        column 2     column 3
   - Parent            value       value
     | child 0 1       value
     + child 0 2       value       value
     - child 0 3                   value
       | child 1 1     value       value
       | child 1 2     value
*/
export class ImxTreeTableComponent<T> implements AfterContentInit, OnDestroy {

  get columnsToDisplay(): string[] {
    return this.columnsToDisplayInternal;
  }

  public get ButtonClass(): string {
    const res = !this.rootOnly;
    return res ? 'k-icon k-i-collapse' : 'k-icon k-i-expand';
  }

  /** Different ways the client can add column definitions */
  @ContentChildren(MatColumnDef) public columnDefs: QueryList<MatColumnDef>;

  @ContentChildren(ImxMatColumnComponent) public simpleColumns: QueryList<ImxMatColumnComponent<T>>;
  @ContentChild('rootTemplate', { static: true }) public titleNodeTemplate: TemplateRef<ElementRef>;

  @Input() public dataSource: ImxDataSource<T>;

  @Input() public startExpanded = false;
  @Input() public rootText: string;

  /*
    A style the root should be rendered with
    Possible Values are
       'RootTemplate' : the template 'rootTemplate' should be used
       'String' : the 'rootText' should be displayed
       'FromColumns' : the columntemplate handle the root node as well
       'None' : no additional root node should be rendered
   */
  @Input() public rootType: 'RootTemplate' | 'String' | 'ColumnTemplate' | 'None' = 'None';

  @Output() public rowClicked = new EventEmitter<T>();
  private rootOnly = false;
  private columnsToDisplayInternal: string[] = [];
  @ViewChild(MatTable, { static: true }) private table: MatTable<T>;
  private readonly subscriptions: Subscription[] = [];

  public isExpansionDetailRow = (i: number, ob: ImxExpandableItem<T>) => {
    return ob.isRoot && this.rootType !== 'ColumnTemplate';
  }

  public async ngAfterContentInit(): Promise<void> {
    if (!this.dataSource.hasChildrenProvider) {
      throw new Error('The accessor "hasChildrenProvider" is undefined ');
    }

    await this.dataSource.LoadItems();

    // Register the simple columns to the table
    let index = 0;
    this.simpleColumns.forEach((simpleColumn: any) => {
      index = index + 1;

      simpleColumn.hasChildrenProvider = this.dataSource.hasChildrenProvider;

      simpleColumn.isFirstColumn = index === 1;

      this.columnsToDisplayInternal.push(simpleColumn.field);

      this.subscriptions.push(simpleColumn.itemExpanded.subscribe({
        next: (event: ImxExpandableItem<T>) => {
          this.handleExpandEvent(event, true);
        }
      }));

      this.subscriptions.push(simpleColumn.itemCollapsed.subscribe({
        next: (event: ImxExpandableItem<T>) => {
          this.handleExpandEvent(event, false);
        }
      }));
      this.table.addColumnDef(simpleColumn.columnDef);
    });
  }

  public ngOnDestroy(): void {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  public handleExpandEvent(data: ImxExpandableItem<T>, expand: boolean): void {
    if (data.level === 0) {
      this.rootOnly = !this.rootOnly;
      if (this.rootOnly) {
        this.dataSource.CollapseRoot();
      } else {
        this.dataSource.ExpandRoot();
      }
    }
    if (expand) {
      this.dataSource.LoadChildItems(data, false);
    } else {
      this.dataSource.RemoveChildItems(data);
    }
  }

  public RowIsClicked(element: ImxExpandableItem<T>): void {
    this.rowClicked.emit(element.data);
  }

  public buttonClicked(): void {
    this.rootOnly = !this.rootOnly;
    if (this.rootOnly) {
      this.dataSource.CollapseRoot();
    } else {
      this.dataSource.ExpandRoot();
    }
  }
}
