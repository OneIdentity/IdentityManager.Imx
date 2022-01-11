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
 * Copyright 2021 One Identity LLC.
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

import { Subject, BehaviorSubject } from 'rxjs';
import { EventEmitter } from '@angular/core';

import { CollectionLoadParameters, IEntity } from 'imx-qbm-dbts';
import { TreeNode } from './tree-node';
import { TreeNodeResultParameter } from './tree-node-result-parameter.interface';

/**
 * Data-provider for the data-tree.
 * When expanding a node in the tree, the data source of the tree will need to fetch children by using this class.
 */
export abstract class TreeDatabase {
  public readonly initialized = new Subject();
  public dataReloaded$ = new BehaviorSubject(undefined);

  /** set this parameter to true, if your implementation supports searching */
  public canSearch = false;

  public dataChanged: EventEmitter<IEntity[]> = new EventEmitter();

  public get hasData(): boolean {
    return this.rootNodes && this.rootNodes.length > 0;
  }

  public get topLevelEntities(): IEntity[] {
    return this.rootData;
  }

  public get hasEntitiesAvailable(): boolean {
    return this.rootData.length > 0;
  }

  protected identifierColumnName: string;
  protected hasChildrenColumnName = 'HasChildren';

  protected rootData: IEntity[] = [];
  protected rootNodes: TreeNode[];

  /** Initial data from database */
  public async initialize(navigationState: CollectionLoadParameters = {}): Promise<TreeNode[]> {
    // load the root entities
    const entities = await this.getData(true, navigationState);

    if (entities.totalCount === 0 || entities.entities.length === 0) {
      return [];
    }

    // Store the root entities so that the data can be accessed externally from this class
    this.rootData = entities.entities;
    this.rootNodes = this.createSortedNodes(entities.entities, 0);
    if (entities.canLoadMore) {
      this.rootNodes.push(new TreeNode(undefined, 'more', 'more', 0, false, false, true));
    }

    this.initialized.next();

    return this.rootNodes;
  }

  public updateNodeItem(item: IEntity): void {
    const roots = this.rootNodes?.find(node => TreeDatabase.getId(node.item) === TreeDatabase.getId(item));
    if (roots) {
      roots.item = item;
    }
  }

  /** return children for a given tree node including the information, if more elements are available on the server */
  public async getChildren(node: TreeNode, startIndex: number)
    : Promise<{ nodes: TreeNode[], canLoadMore: boolean }> {

    const entities = await this.getData(false, { parentKey: node.name, StartIndex: startIndex });

    const nodes = this.createSortedNodes(entities.entities, node.level + 1);
    return {
      nodes: entities.entities.map(entity => nodes.find(x => TreeDatabase.getId(x.item) === TreeDatabase.getId(entity))),
      canLoadMore: entities.canLoadMore
    };
  }

  /** abstract function, which have to be implemented  */
  public async getData(showLoading: boolean, parameter: CollectionLoadParameters = {})
    : Promise<TreeNodeResultParameter> {
    return undefined;
  }

  /** reloads data from the server */
  public reloadData(): void {
    // Notify any subscribers that the database needs to be reloaded
    if (this.dataReloaded$) {
      this.dataReloaded$.next(true);
    }
  }

  /** Sort the datamap for all nodes alphabetically and return the nodes for the data-tree */
  public createSortedNodes(entities: IEntity[], levelNumber: number): TreeNode[] {
    const sortedEntityMap = entities.sort((a, b) => a.GetDisplay().localeCompare(b.GetDisplay()));
    return sortedEntityMap.map(item => new TreeNode(item,
      this.identifierColumnName ? item.GetColumn(this.identifierColumnName).GetValue() : '',
      TreeDatabase.getId(item), levelNumber, item.GetColumn(this.hasChildrenColumnName).GetValue()));
  }

  /** gets an unique id by combining all id parts */
  public static getId(entity: IEntity): string {
    return entity.GetKeys() ? entity.GetKeys().join(',') : '';
  }

}
