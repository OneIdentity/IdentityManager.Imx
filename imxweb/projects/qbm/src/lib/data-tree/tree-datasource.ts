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
import { BehaviorSubject, Observable, merge, Subscription } from 'rxjs';
import { concatMap, map } from 'rxjs/operators';

import { TreeNode, TreeNodeInfo } from './tree-node';
import { TreeDatabase } from './tree-database';
import { IEntity } from 'imx-qbm-dbts';
import * as _ from 'lodash';

/** Datasource for the data-tree */
export class TreeDatasource {
  public dataChange = new BehaviorSubject<TreeNode[]>([]);
  public emptyNodeCaption: string;

  public get data(): TreeNode[] {
    return this.dataChange.value;
  }

  /**
   * @ignore
   * List of subscriptions.
   */
  private subscriptions: Subscription[] = [];

  constructor(private treeControl: FlatTreeControl<TreeNode>, private dataService: TreeDatabase) {}

  public init(value: TreeNode[]): void {
    this.treeControl.dataNodes = value;
    this.dataChange.next(value);
  }

  /**
   * @ignore Used internally.
   * Used by the CdkTree.  Called when it is destroyed
   */
  public disconnect(): void {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }

  /**
   * @ignore Used internally.
   * Used by the CdkTree. Called when it connects to the data source.
   */
  public connect(collectionViewer: CollectionViewer): Observable<TreeNode[]> {
    this.subscriptions.push(
      this.treeControl.expansionModel.changed
        .pipe(concatMap(async (change) => this.handleTreeControl(change)))
        .subscribe((treeDataHasChanged: boolean) => {
          if (treeDataHasChanged) {
            this.dataChange.next(this.data);
          }
        })
    );

    return merge(collectionViewer.viewChange, this.dataChange).pipe(map(() => this.data));
  }

  /** Handle expand/collapse behaviors */
  public async handleTreeControl(change: SelectionChange<TreeNode>): Promise<boolean> {
    if (change.added && change.added.length > 0) {
      return (await Promise.all(change.added.filter((node) => node.expandable).map((node) => this.toggleNode(node, true)))).some(
        (result) => result === true
      );
    }

    if (change.removed && change.removed.length > 0) {
      return (
        await Promise.all(
          change.removed
            .filter((node) => node.expandable)
            .slice()
            .reverse()
            .map((node) => this.toggleNode(node, false))
        )
      ).some((result) => result === true);
    }
  }

  /** Loads more elements and adds them to the tree */
  public async loadMore(node: TreeNode, ParentKey: string, startIndex: number): Promise<void> {
    node.isLoading = true;
    try {
      const newData = await this.dataService.getData(false, { ParentKey, StartIndex: startIndex });
      const nodes = this.dataService.createSortedNodes(newData.entities, node.level);

      if (nodes.length === 0) {
        return;
      }

      if (newData.canLoadMore) {
        nodes.push(new TreeNode(undefined, ParentKey + 'more', 'more', node.level, false, false, true));
      }

      if (!ParentKey) {
        // root nodes
        this.data.splice(-1, 1, ...nodes);
      } else {
        // child nodes
        const index = this.data.indexOf(node);
        this.data.splice(index, 1, ...nodes);
      }

      this.dataChange.next(this.data);
    } finally {
      node.isLoading = false;
    }
  }

  /** add an empty tree node at the top of the tree */
  public addEmpyNodeToTop(): TreeNode {
    if (this.data?.length === 0 || this.data[0].identifier !== 'newObject') {
      const emptyNode = new TreeNode(null, 'newObject', this.emptyNodeCaption, 0, false);
      this.data.splice(0, 0, ...[emptyNode]);

      this.dataChange.next(this.data);

      return emptyNode;
    } else {
      return this.data[0];
    }
  }

  /**
   * Adds a node to the tree, that contains the new entity
   * @param parent the parent node, the new child should be added to
   * @param childEntity a child entity, that should be added to to tree
   */
  public addChildNode(parent: TreeNode, childEntity: IEntity): void {
    const childNode = this.dataService.createNode(childEntity, parent.level + 1);
    const index = this.data.indexOf(parent);
    this.data.splice(index + 1, 0, ...[childNode]);
    this.dataChange.next(this.data);
  }

  /**
   * Updates a node with new information
   * @param node node, that should be updated
   * @param newNodeInfo new node information
   */
  public updateNode(node: TreeNode, newNodeInfo: TreeNodeInfo) {
    const index = this.data.findIndex((elem) => TreeDatabase.getId(elem.item) === TreeDatabase.getId(node.item));

    const treenode = { ...node, ...newNodeInfo };
    // create a new node to replace the old one, because otherwise the tree will not rerender it
    this.data.splice(index, 1, ...[TreeNode.createNodeFromInfo(treenode)]);
    this.dataChange.next(this.data);
  }

  /**
   * removes a node from the tree
   * @param node node to be removed
   */
  public removeNode(node: TreeNode, withChildren: boolean) {
    const index = this.data.findIndex((elem) => TreeDatabase.getId(elem.item) === TreeDatabase.getId(node.item));
    let count = 1;
    if (withChildren) {
      for (let i = index + 1; i < this.data.length && this.data[i].level > node.level; i++) {
        count++;
      }
    }
    this.data.splice(index, count);
    this.dataChange.next(this.data);
  }

  /** removes the top most tree node */
  public removeNodeFromTop(): boolean {
    if (this.data?.length > 0 && this.data[0].identifier === 'newObject') {
      this.data.splice(0, 1);
      this.dataChange.next(this.data);
      return true;
    }
    return false;
  }

  /** Toggle the node, loads children or removes them */
  private async toggleNode(node: TreeNode, expand: boolean): Promise<boolean> {
    const index = this.data.indexOf(node);
    if (index < 0) {
      // If cannot find the node, no op
      return false;
    }

    node.isLoading = true;
    if (expand) {
      const children = await this.dataService.getChildren(node, 0);
      if (!children) {
        // If no children no op
        node.isLoading = false;
        return false;
      }
      if (children.canLoadMore) {
        children.nodes.push(new TreeNode(undefined, node.identifier + 'more', 'more', node.level + 1, false, false, true));
      }
      this.data.splice(index + 1, 0, ...children.nodes);
    } else {
      // find all index of nodes having to collapse
      let count = 0;
      for (let i = index + 1; i < this.data.length && this.data[i].level > node.level; i++) {
        count++;
      }
      this.data.splice(index + 1, count);
    }

    node.isLoading = false;
    return true;
  }
}
