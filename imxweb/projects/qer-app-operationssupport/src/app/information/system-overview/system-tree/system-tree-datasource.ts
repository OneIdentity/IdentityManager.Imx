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

import { CollectionViewer, SelectionChange } from '@angular/cdk/collections';
import { FlatTreeControl } from '@angular/cdk/tree';
import { Injectable } from '@angular/core';
import { BehaviorSubject, merge, Observable, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';

import { SystemTreeDatabase } from './system-tree-database';
import { SystemTreeNode } from './system-tree-node';

@Injectable()
export class SystemTreeDataSource {
  public dataChange = new BehaviorSubject<SystemTreeNode[]>([]);

  get data(): SystemTreeNode[] {
    return this.dataChange.value;
  }
  set data(value: SystemTreeNode[]) {
    this.treeControl.dataNodes = value;
    this.dataChange.next(value);
  }

  /**
   * @ignore
   * List of subscriptions.
   */
  private subscriptions: Subscription[] = [];

  constructor(private treeControl: FlatTreeControl<SystemTreeNode>, private database: SystemTreeDatabase) { }

  /**
   * @ignore Used internally.
   * Unsubscribes all listeners.
   */
  public disconnect(): void {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  public connect(collectionViewer: CollectionViewer): Observable<SystemTreeNode[]> {
    this.subscriptions.push(this.treeControl.expansionModel.changed.subscribe(change => {
      if ((change as SelectionChange<SystemTreeNode>).added || (change as SelectionChange<SystemTreeNode>).removed) {
        this.handleTreeControl(change as SelectionChange<SystemTreeNode>);
      }
    }));

    return merge(collectionViewer.viewChange, this.dataChange).pipe(map(() => this.data));
  }

  /** Handle expand/collapse behaviors */
  public handleTreeControl(change: SelectionChange<SystemTreeNode>): void {
    if (change.added && change.added.length > 0) {
      change.added.forEach(node => this.toggleNode(node, true));
    }
    if (change.removed && change.removed.length > 0) {
      change.removed
        .slice()
        .reverse()
        .forEach(node => this.toggleNode(node, false));
    }
  }

  /**
   * Toggle the node, remove from display list
   */
  public toggleNode(node: SystemTreeNode, expand: boolean): void {
    const children = this.database.getChildren(node.display);
    const index = this.data.indexOf(node);
    if (!children || index < 0) {
      // If no children, or cannot find the node, no op
      return;
    }

    if (expand) {
      const nodes = children.map(name => new SystemTreeNode(name, null, node.level + 1, this.database.isExpandable(name.Element.value)));
      this.data.splice(index + 1, 0, ...nodes);
    } else {
      let count = 0;
      // tslint:disable-next-line: no-empty
      for (let i = index + 1; i < this.data.length && this.data[i].level > node.level; i++, count++) { }
      this.data.splice(index + 1, count);
    }

    // notify the change
    this.dataChange.next(this.data);
  }
}
