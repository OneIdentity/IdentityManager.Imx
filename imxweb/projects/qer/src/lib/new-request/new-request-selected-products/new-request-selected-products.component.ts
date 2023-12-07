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

import { LiveAnnouncer } from '@angular/cdk/a11y';
import { SelectionModel } from '@angular/cdk/collections';
import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { MatSort, Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { EUI_SIDESHEET_DATA, EuiSidesheetRef, EuiSidesheetService } from '@elemental-ui/core';
import { SelectedProductItem, SelectedProductSource, SelectedProductType } from './selected-product-item.interface';
import { SelectedProductItemColDef } from './selected-product-item-col-def.interface';

export interface SelectedSidesheetData {
  candidates: SelectedProductItem[];
  colDefs: SelectedProductItemColDef[];
}

@Component({
  selector: 'imx-new-request-selected-products',
  templateUrl: './new-request-selected-products.component.html',
  styleUrls: ['./new-request-selected-products.component.scss'],
})
export class NewRequestSelectedProductsComponent implements OnInit {
  public columnsToDisplay: string[] = ['select', 'product', 'productSource', 'description'];
  public SelectedProductType: SelectedProductType;
  public SelectedProductSource: SelectedProductSource;
  public dataSource: MatTableDataSource<SelectedProductItem>;
  public selection = new SelectionModel<any>(true, []);

  constructor(
    private sidesheetService: EuiSidesheetService,
    private sidesheetRef: EuiSidesheetRef,
    private readonly _liveAnnouncer: LiveAnnouncer,
    @Inject(EUI_SIDESHEET_DATA) public data?: SelectedSidesheetData
  ) {
    const initialData = this.convertDataSource(this.data?.candidates);
    this.dataSource = new MatTableDataSource(initialData);
    this.selection = new SelectionModel<any>(true, initialData);

    this.sidesheetRef.closeClicked().subscribe(() => this.sidesheetService.close(false));
  }

  public ngOnInit(): void {}

  @ViewChild(MatSort) sort: MatSort;

  public ngAfterViewInit() {
    this.dataSource.sort = this.sort;
  }

  public onUpdateSelection(): void {
    this.sidesheetService.close(this.selection.selected);
  }

  /** Whether the number of selected elements matches the total number of rows. */
  public isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  public toggleAllRows() {
    if (this.isAllSelected()) {
      this.selection.clear();
      return;
    }

    this.selection.select(...this.dataSource.data);
  }

  /** The label for the checkbox on the passed row */
  public checkboxLabel(row?: any): string {
    if (!row) {
      return `${this.isAllSelected() ? 'deselect' : 'select'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.position + 1}`;
  }

  public convertDataSource(candidates: SelectedProductItem[]): SelectedProductItem[] {
    return candidates.map((candidate) => {
      let productSource = '';
      if (candidate.type === 0) {
        productSource = candidate.item?.GetEntity()?.GetColumn('ServiceCategoryFullPath').GetDisplayValue();
      } else if (candidate.type === 1) {
        productSource = candidate.item?.GetEntity()?.GetColumn('FullPath').GetDisplayValue();
      } else if (candidate.type === 2) {
        productSource = candidate.item?.GetEntity().GetColumn('UID_ShoppingCartPattern').GetDisplayValue();
      }

      return {
        ...candidate,
        product: candidate.item.GetEntity()?.GetDisplay(),
        productSource,
        description: candidate.item.GetEntity()?.GetColumn('Description')?.GetDisplayValue(),
      };
    });
  }
}
