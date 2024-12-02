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

import { CollectionViewer, SelectionChange } from '@angular/cdk/collections';
import { FlatTreeControl } from '@angular/cdk/tree';
import { CollectionLoadParameters } from '@imx-modules/imx-qbm-dbts';
import { BehaviorSubject, Observable, Subscription, merge } from 'rxjs';
import { concatMap, map } from 'rxjs/operators';
import { DataSourceToolbarSettings } from '../data-source-toolbar/data-source-toolbar-settings';

export class DynamicDataApiControls<T> {
  setup: () => Promise<{ rootNode: T; dstSettings?: DataSourceToolbarSettings; totalCount?: number }>;
  getChildren: (node: T, onlyCheck?: boolean) => Promise<T[]>;
  loadMore?: (root: T) => Promise<T[]>;
  search?: (params: CollectionLoadParameters) => Promise<{ searchNodes: T[]; totalCount?: number; rootNode?: T }>;
  abortSearch?: () => void;
  searchLoadMore?: (params: CollectionLoadParameters) => Promise<T[]>;
  changeSelection?: (data: T[], selectedNode: T) => T[];
}

export class DynamicDataSource<T> {
  public dataChange = new BehaviorSubject<T[]>([]);
  public initializingData: boolean;
  public dstSettings: DataSourceToolbarSettings | undefined;
  public selectedNode: T;

  private totalCount: number;
  private currentCount: number;
  private rootNode: T;
  private cachedData: {
    data: T[];
    totalCount: number;
    currentCount: number;
  } | null;
  private subscriptions$: Subscription[] = [];

  public get data(): T[] {
    return this.dataChange.value;
  }

  public get hasData(): boolean {
    return this.data.length > 0;
  }

  public get canLoadMore(): boolean {
    return this.currentCount < this.totalCount;
  }

  public get isRootNodeOpen(): boolean {
    return this._treeControl.isExpanded(this.rootNode);
  }

  public get isSearch(): boolean {
    return !!this.dstSettings?.navigationState?.search?.length;
  }

  constructor(
    private _treeControl: FlatTreeControl<T>,
    private _apiControls: DynamicDataApiControls<T>,
  ) {}

  public async setup(expandRoot?: boolean): Promise<void> {
    this.initializingData = true;
    try {
      const response = await this._apiControls.setup();
      this.totalCount = response?.totalCount ?? 0;
      this.rootNode = response.rootNode;
      this.dstSettings = response?.dstSettings;
      this.init();
      if (expandRoot) {
        this._treeControl.expand(this.rootNode);
        await this.toggleNode(this.rootNode, true);
        this.nextData(this.data);
      }
    } finally {
      this.currentCount = this.data.length - 1; // Minus 1 to account for rootnode
    }
  }

  public init(): void {
    this._treeControl.dataNodes = [this.rootNode];
    this.dataChange.next([this.rootNode]);
  }

  public async loadMore(): Promise<void> {
    let nodes: T[] = [];
    if (this.isSearch) {
      if (this.dstSettings) {
        this.dstSettings.navigationState.StartIndex = this.data.length;
      }
      if (this._apiControls.search) {
        nodes = (await this._apiControls.search(this.dstSettings?.navigationState ?? {})).searchNodes;
      }
      if (this._apiControls.changeSelection) {
        nodes = this._apiControls.changeSelection(nodes, this.selectedNode);
      }
      this.data.push(...nodes);
    } else {
      if (this._apiControls.loadMore) {
        nodes = await this._apiControls.loadMore(this.rootNode);
      }
      if (this._apiControls.changeSelection) {
        nodes = this._apiControls.changeSelection(nodes, this.selectedNode);
      }
      const index = this.findEndOfChildren(this.rootNode);

      this.data.splice(index + 1, 0, ...nodes);
    }
    this.currentCount += nodes.length;
    this.dataChange.next(this.data);
  }

  public async onSearch(): Promise<void> {
    if (!this._apiControls.search || !this._apiControls.changeSelection) {
      throw Error('No remote search functionality has been defined.');
    }

    this.initializingData = true;
    if (this.dstSettings) {
      this.dstSettings.navigationState.StartIndex = 0;
    }
    // If we don't have cached data, and we are searching, cache
    if (!this.cachedData && this.isSearch) {
      this.cachedData = {
        data: this.data.slice(),
        totalCount: this.totalCount,
        currentCount: this.currentCount,
      };
    }
    if (!this.isSearch && !!this.cachedData) {
      // If we are not searching, and there is cached data, load cache and remove old data
      this.totalCount = this.cachedData.totalCount;
      this.currentCount = this.cachedData.currentCount;
      this.rootNode = this.cachedData.data?.[0];
      this.nextData(this.cachedData.data);
      if (this._apiControls.abortSearch) this._apiControls?.abortSearch();
      this.cachedData = null;
    } else {
      // Proceed with normal search
      const response = await this._apiControls.search(this.dstSettings?.navigationState ?? {});
      if (!response) {
        // Here the search was aborted, so we return nothing
        return;
      }
      this.totalCount = response?.totalCount ?? 0;
      const nodes = this._apiControls.changeSelection
        ? this._apiControls.changeSelection(response?.searchNodes ?? [], this.selectedNode)
        : [];
      this.currentCount = nodes.length;
      if (nodes.length > 0) {
        this.rootNode = response?.rootNode || this.rootNode;
        this.nextData([this.rootNode, ...nodes]);
        this._treeControl.expand(this.rootNode);
      } else {
        this.nextData(nodes);
      }
    }
  }

  /**
   * Emits data and turns off the loading spinner
   * @param data that will be emitted as the next data state
   */
  private nextData(data: T[]): void {
    this.dataChange.next(data);
    this.initializingData = false;
  }

  public connect(collectionViewer: CollectionViewer): Observable<T[]> {
    this.subscriptions$.push(
      this._treeControl.expansionModel.changed
        .pipe(concatMap(async (change) => this.handleTreeControl(change)))
        .subscribe((treeDataHasChanged: boolean) => {
          if (treeDataHasChanged) {
            this.dataChange.next(this.data);
          }
        }),
    );

    return merge(collectionViewer.viewChange, this.dataChange).pipe(
      map(() => {
        return this.data;
      }),
    );
  }

  public disconnect(collectionViewer: CollectionViewer): void {
    this.subscriptions$.forEach((sub) => sub.unsubscribe());
  }

  /** Handle expand/collapse behaviors */
  public async handleTreeControl(change: SelectionChange<T>): Promise<boolean> {
    if (change.added && change.added.length > 0) {
      return (await Promise.all(change.added.map((node) => this.toggleNode(node, true)))).some((val) => val);
    } else if (change.removed && change.removed.length > 0) {
      return (
        await Promise.all(
          change.removed
            .slice()
            .reverse()
            .map((node) => this.toggleNode(node, false)),
        )
      ).some((val) => val);
    }
    return false;
  }

  /**
   * Toggle the node, remove from display list
   */
  public async toggleNode(node: T, expand: boolean): Promise<boolean> {
    const index = this.data.indexOf(node);
    if (index < 0 || this._treeControl.isExpanded(node) !== expand) {
      // We either can't find the node, or are trying to entering recursive behavior
      return false;
    }

    if (expand) {
      const children = await this._apiControls.getChildren(node);
      const descendants = (await Promise.all(children.map((node) => this.recursivelyGetChildren(node)))).reduce((a, b) => a.concat(b), []);
      this.data.splice(index + 1, 0, ...descendants);
    } else {
      const count = this.findEndOfChildren(node, index);
      this.data.splice(index + 1, count);
    }
    return true;
  }

  private async recursivelyGetChildren(node: T): Promise<T[]> {
    const descendants = [node];
    if (!this._treeControl.isExpanded(node)) {
      return descendants;
    }
    const children = await this._apiControls.getChildren(node, true);
    for await (const child of children) {
      const theseChildren = await this.recursivelyGetChildren(child);
      descendants.push(...theseChildren);
    }
    return descendants;
  }

  private findEndOfChildren(node: T, index?: number): number {
    if (!index) {
      index = this.data.indexOf(node);
    }
    const afterCollapsed: T[] = this.data.slice(index + 1, this.data.length);
    let count = 0;
    const nodeLevel = this._treeControl.getLevel(node);
    for (count; count < afterCollapsed.length; count++) {
      const tmpNode = afterCollapsed[count];
      if (this._treeControl.getLevel(tmpNode) <= nodeLevel) {
        break;
      }
    }
    return count;
  }

  public setSelection(node: T): void {
    const nodes = this._apiControls.changeSelection ? this._apiControls.changeSelection(this.data, node) : [];
    this.dataChange.next(nodes);
    if (this.cachedData) {
      this.cachedData.data = this._apiControls.changeSelection ? this._apiControls.changeSelection(this.cachedData.data, node) : [];
    }
    this.selectedNode = node;
  }
}
