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

import { Component, OnInit } from '@angular/core';
import { OverlayRef } from '@angular/cdk/overlay';
import { EuiLoadingService } from '@elemental-ui/core';

import { DataSourceToolbarSettings } from 'qbm';
import { DisplayColumns, EntitySchema, IClientProperty } from 'imx-qbm-dbts';
import { UnresolvedRefsService } from './unresolved-refs.service';

@Component({
  selector: 'imx-unresolved-refs-gridview',
  templateUrl: './unresolved-refs.component.html',
  styleUrls: ['./unresolved-refs.component.scss']
})
export class UnresolvedRefsComponent implements OnInit {

  public dstSettings: DataSourceToolbarSettings;
  public readonly entitySchemaRefs: EntitySchema;
  public readonly DisplayColumns = DisplayColumns;
  private readonly displayedColumns: IClientProperty[];

  constructor(
    private unresolvedRefsService: UnresolvedRefsService,
    private busyService: EuiLoadingService,
  ) {
    this.entitySchemaRefs = unresolvedRefsService.schema;
    this.displayedColumns = [
      this.entitySchemaRefs.Columns.DisplayName,
      this.entitySchemaRefs.Columns.OwnerObject,
      this.entitySchemaRefs.Columns.ShellDisplay,
      this.entitySchemaRefs.Columns.SystemDisplay,
      this.entitySchemaRefs.Columns.Data
    ];
  }

  public async ngOnInit(): Promise<void> {
    await this.getData();
  }

  public async refresh(): Promise<void> {
    await this.getData();
  }

  public async getData(): Promise<void> {

    let overlayRef: OverlayRef;
    setTimeout(() => overlayRef = this.busyService.show());
    try {

      const journalEntries = await this.unresolvedRefsService.get();
      this.dstSettings = {
        displayedColumns: this.displayedColumns,
        dataSource: journalEntries,
        entitySchema: this.entitySchemaRefs,
        navigationState: {}
      };

    } finally {
      setTimeout(() => this.busyService.hide(overlayRef));
    }
  }
}
