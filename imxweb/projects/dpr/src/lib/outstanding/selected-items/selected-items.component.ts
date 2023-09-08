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

import { Component, Inject, OnInit } from '@angular/core';
import { EUI_SIDESHEET_DATA } from '@elemental-ui/core';

import { CollectionLoadParameters, EntitySchema, IClientProperty } from 'imx-qbm-dbts';
import { DataSourceToolbarSettings } from 'qbm';
import { OutstandingObjectEntity } from '../outstanding-object-entity';

@Component({
  selector: 'imx-selected-items',
  templateUrl: './selected-items.component.html',
  styleUrls: ['./selected-items.component.scss']
})
export class SelectedItemsComponent implements OnInit {

  public sortedEntities: OutstandingObjectEntity[];

  public displayedColumns?: IClientProperty[];
  public dstSettings: DataSourceToolbarSettings;
  private searchedEntities: OutstandingObjectEntity[];

  private navigationState: CollectionLoadParameters = {};
  constructor(
    @Inject(EUI_SIDESHEET_DATA) public readonly data: { objects: OutstandingObjectEntity[]; schema: EntitySchema },
  ) {
    this.displayedColumns = [
      data.schema.Columns.Display
    ];
    this.sortedEntities = data.objects.sort(
      (a, b) => a.Display.value.localeCompare(b.Display.value));
    this.searchedEntities = [...this.sortedEntities];
  }

  public ngOnInit(): void {
    this.getData({ StartIndex: 0, PageSize: 20 });
  }

  public search(key: string): void {
    if (key === '') {
      this.searchedEntities = [...this.sortedEntities];
    } else {
      this.searchedEntities = this.sortedEntities.filter(elem =>
        elem.Display.value.toLocaleLowerCase().includes(key.toLocaleLowerCase()));
    }
    this.getData({ StartIndex: 0, search: key });
  }

  public getData(state: CollectionLoadParameters): void {
    this.navigationState = { ...this.navigationState, ...state };
    const data = this.searchedEntities
      .slice(this.navigationState.StartIndex, this.navigationState.StartIndex + this.navigationState.PageSize);

    this.dstSettings = {
      navigationState: this.navigationState,
      dataSource: {
        Data: data,
        totalCount: this.searchedEntities.length
      },
      entitySchema: this.data.schema,
      displayedColumns: this.displayedColumns
    };
  }

}
