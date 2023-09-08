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

import { DataSource } from '@angular/cdk/table';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';

export abstract class ImxDataSource<T> extends DataSource<T> {
  public itemCount: number;
  public data: T[];
  public expandableData: ImxExpandableItem<T>[];

  public hasChildrenProvider: ((data: T) => boolean);

  public itemsProvider: (() => Promise<T[]>);
  public childItemsProvider: ((item: T) => Promise<T[]>);

  private rootItem: ImxExpandableItem<T>;

  private shownItems: ImxExpandableItem<T>[];
  private _dataSubject: BehaviorSubject<any[]>;
  private readonly subscriptions: Subscription[] = [];

  constructor() {
    super();
    this._dataSubject = new BehaviorSubject<any[]>([]);
  }

  public LoadItems(): Promise<T[]> {
    if (!this.itemsProvider) {
      throw new Error('The accessor "itemsProvider" is undefined ');
    }
    const items = this.itemsProvider();
    items.then(elements => {
      const rows = this.getRows(elements, null,  1 );
      this.data = elements;
      this.expandableData = rows;
      this.itemCount = elements.length;
    });
    return items;
  }

  public LoadChildItems(parent: ImxExpandableItem<T>, expand: boolean) {
    if (!this.childItemsProvider) {
      throw new Error('The accessor "childItemsprovider" is undefined');
    }
    if (parent.isRoot) {
      return;
    }

    const items = this.childItemsProvider(parent.data);
    items.then(elements => {
      const newRows = this.getRows(elements, parent, parent.level + 1);
      const newRowSet: ImxExpandableItem<T>[] = [];
      this.shownItems.forEach(element => {
        if (element !== parent) {
          newRowSet.push(element);
        } else {
          newRowSet.push(element);
          newRows.forEach(ele => {
            newRowSet.push(ele);
            if (expand) {
              ele.isExpanded = true;
              this.LoadChildItems(ele, true);
            }
          });
        }
      });
      this.shownItems = newRowSet;
      this._dataSubject.next(newRowSet);
    });
  }

  public RemoveChildItems(parent: ImxExpandableItem<T>) {
    const newRowSet: ImxExpandableItem<T>[] = [];

    this.shownItems.forEach(element => {
      if (!this.ElementHasParent(element, parent)) {
        newRowSet.push(element);
      }
    });

    this.shownItems = newRowSet;
    this._dataSubject.next(newRowSet);
  }

  public ExpandRoot(): any {
    const root = this.shownItems.find(el => el.isRoot);
    root.isExpanded = true;
    this.shownItems.push(new ImxExpandableItem<T>(root.data, root, 1));
    this._dataSubject.next(this.shownItems);
  }

  public CollapseRoot(): any {
    const root = this.shownItems.find(el => el.isRoot);
    root.isExpanded = false;
    this.shownItems = [root];
    this._dataSubject.next(this.shownItems);
  }

  public ExpandAll(): void {
    this.shownItems.forEach(el => {
      if (!el.isExpanded) {
        el.isExpanded = true;
        this.LoadChildItems(el, true);
      }
    });
  }

  public ElementHasParent(element: ImxExpandableItem<T>, parent: ImxExpandableItem<T>): boolean {
    if (element.parent === parent) { return true; }

    const newElemen = element.parent;
    return newElemen && newElemen != null ? this.ElementHasParent(newElemen, parent) : false;
  }

  public getRows(items: T[], parent: ImxExpandableItem<T>, level: number): ImxExpandableItem<T>[] {
    const ret: ImxExpandableItem<T>[] = [];
    items.forEach(element => {
      ret.push(new ImxExpandableItem(element, parent, level));
    });
    return ret;
  }

  public disconnect(): void {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  public connect(): Observable<any> {
    this.subscriptions.push(this._dataSubject.subscribe(
      (res: any) => {
        this.data = res;
      }
    ));
    return this._dataSubject;
  }

  public SetRoot(specialElement: T) {
    if (!specialElement) { return; }
    this.shownItems = [];
    this.rootItem = new ImxExpandableItem<T>(specialElement, null, 0);
    this.rootItem.isRoot = true;
    this.shownItems.push(this.rootItem);
    const root = this.expandableData.find(el => el.data === specialElement);
    this.shownItems.push(root);
    this._dataSubject.next(this.shownItems);
  }
}

export class ImxExpandableItem<T> {

  public isExpanded = false;
  public isRoot = false;
  constructor(public data: T, public parent: ImxExpandableItem<T>, public level: number) { }
}
