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

import { Component, Input, Signal, computed } from '@angular/core';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { DataViewSource } from '../data-view-source';

/**
 * @example
 *  <imx-data-view-selection [dataSource]="dataSource"></imx-data-view-selection>
 */

@Component({
  selector: 'imx-data-view-selection',
  templateUrl: './data-view-selection.component.html',
  styleUrls: ['./data-view-selection.component.scss'],
})
export class DataViewSelectionComponent {
  /**
   * Input the dataViewSource service. It handles all the action and the data loading. This input property is required.
   */
  @Input({ required: true }) public dataSource: DataViewSource;
  /**
   * The value of the material slide toggle.
   */
  public showSelected: boolean = false;
  /**
   * Get the total selected number and update the showSelected value in every selection change.
   */
  public totalSelected: Signal<number> = computed(() => {
    this.dataSource.selectionChanged();
    if (this.dataSource.selection.selected.length == 0) {
      this.showSelected = false;
    }
    return this.dataSource.selection.selected.length || 0;
  });

  /**
   * Calls selection wrapper clear function.
   */
  public onClearSelection(): void {
    this.dataSource.nestedSelection = new Map();
    this.dataSource.selection.clear();
  }

  /**
   * Update showOnlySelected signal in every slide toggle change event.
   * @param $event The slide toggle change event object.
   */
  public onShowSelectionChanged($event: MatSlideToggleChange) {
    this.dataSource.showOnlySelected.set($event.checked);
  }
}
