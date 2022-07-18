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
 * Copyright 2022 One Identity LLC.
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

import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { EuiLoadingService } from '@elemental-ui/core';

import { IEntity } from 'imx-qbm-dbts';
import { DataTreeComponent } from '../../data-tree/data-tree.component';
import { TreeDatabase } from '../../data-tree/tree-database';
import { FilterTreeParameter } from '../data-model/filter-tree-parameter';
import { FilterTreeDatabase } from './filter-tree-database';
import { FilterTreeEntityWrapperService } from './filter-tree-entity-wrapper.service';

@Component({
  selector: 'imx-filter-tree',
  templateUrl: './filter-tree.component.html',
  styleUrls: ['./filter-tree.component.scss']
})
export class FilterTreeComponent implements OnInit {

  public database: TreeDatabase;
  public currentlySelectedFilter: IEntity[];

  @ViewChild('tree') private tree: DataTreeComponent;

  constructor(
    private busyService: EuiLoadingService,
    @Inject(MAT_DIALOG_DATA) public readonly data: { filterTreeParameter: FilterTreeParameter, preselection: IEntity[], type:string },
    public dialogRef: MatDialogRef<FilterTreeComponent>,
    private readonly entityWrapper: FilterTreeEntityWrapperService) {
  }

  public async ngOnInit(): Promise<void> {
    if (this.data?.filterTreeParameter) {
      this.database = new FilterTreeDatabase(this.entityWrapper, this.data.filterTreeParameter.filterMethode, this.busyService);
    } else {
      this.database = undefined;
    }
    if (this.data?.preselection) {
      this.currentlySelectedFilter = this.data.preselection;
    }
  }

  public clearValue(): void {
    this.tree?.clearSelection();
    this.currentlySelectedFilter = [];
  }

  public onCheckedNodesChanged(): void {
    if (!this.data.filterTreeParameter.multiSelect) { return; }
    this.currentlySelectedFilter = this.tree.selectedEntities;
  }

  public onNodeSelected(entity: IEntity): void {
    if (this.data.filterTreeParameter.multiSelect) { return; }
    this.currentlySelectedFilter = entity ? [entity] : [];
    this.submitValues();
  }

  public submitValues(): void {
    this.dialogRef.close(this.currentlySelectedFilter);
  }
}
