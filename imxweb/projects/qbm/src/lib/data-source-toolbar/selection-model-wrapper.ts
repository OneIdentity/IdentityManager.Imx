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

import { SelectionChange, SelectionModel } from '@angular/cdk/collections';
import { Subject } from 'rxjs';

import { TypedEntity } from '@imx-modules/imx-qbm-dbts';

export class SelectionModelWrapper<T extends TypedEntity = TypedEntity> {
  public get changed(): Subject<SelectionChange<T>> {
    return this.selection.changed;
  }

  public get selected(): ReadonlyArray<T> {
    return this.selection.selected;
  }

  public get numOfSelectableItems(): number {
    return this.selectableItems.filter((v) => v).length;
  }

  /**
   * Selection model that handles multiple selection in the data source view.
   */
  private selection = new SelectionModel<T>(true, []);

  /**
   * Selection cache dictionary used by the data source view to get the check/uncheck state of an item if mutiselect is enabled.
   */
  private selectionCache: { [id: string]: boolean } = {};

  /**
   * Keeps track of if individual items are selectable.
   */
  private selectableItems: boolean[] = [];

  public itemIsSelectable(index: number): boolean {
    return this.selectableItems.length > index && this.selectableItems[index];
  }

  /**
   * Clears selection.
   */
  public clear(): void {
    this.selection.clear();
    this.selectionCache = {};
  }

  /**
   * Checks if an item is selected.
   */
  public isSelected(item: T): boolean {
    return this.selectionCache[this.getId(item)];
  }

  /**
   * Toggles selection state.
   */
  public toggle(item: T): void {
    if (this.isSelected(item)) {
      this.unChecked(item);
    } else {
      this.checked(item);
    }
  }

  /**
   * Selects an item.
   */
  public checked(item: T): void {
    this.selection.select(item);

    const found = this.selection.selected.find((x) => this.getId(x) === this.getId(item));
    if (found) {
      this.selectionCache[this.getId(item)] = true;
    }
  }

  /**
   * Deselects an item.
   */
  public unChecked(item: T): void {
    const found = this.selection.selected.find((x) => this.getId(x) === this.getId(item));
    if (found) {
      this.selectionCache[this.getId(item)] = false;
      this.selection.deselect(found);
    }
  }

  public select(items: T[]): void {
    this.selection.select(...items);
    items.forEach((item) => (this.selectionCache[this.getId(item)] = true));
  }

  public setSelection(items: any[]): void {
    this.selection.setSelection(...(items as T[]));
    this.selectionCache = {};
    items.forEach((item) => (this.selectionCache[this.getId(item as T)] = true));
  }

  private getId(item: T): string {
    return item.GetEntity().GetKeys().join(',');
  }
}
