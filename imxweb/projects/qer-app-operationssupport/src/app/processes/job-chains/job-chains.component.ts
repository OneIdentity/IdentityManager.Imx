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

import { OverlayRef } from '@angular/cdk/overlay';
import { Component, OnInit } from '@angular/core';
import { EuiLoadingService } from '@elemental-ui/core';

import { DisplayColumns, EntitySchema, IClientProperty } from 'imx-qbm-dbts';
import { DataSourceToolbarSettings } from 'qbm';
import { JobChainsService } from './job-chains.service';

@Component({
  templateUrl: './job-chains.component.html',
  styleUrls: ['./job-chains.component.scss']
})
export class JobChainsComponent implements OnInit {

  public dstSettings: DataSourceToolbarSettings;
  public readonly entitySchemaJobChains: EntitySchema;
  public readonly DisplayColumns = DisplayColumns;
  private readonly displayedColumns: IClientProperty[];

  constructor(
    private jobChains: JobChainsService,
    private busyService: EuiLoadingService) {
    this.entitySchemaJobChains = jobChains.EntitySchema;
    this.displayedColumns = [
      this.entitySchemaJobChains.Columns.JobChainName,
      this.entitySchemaJobChains.Columns.Count
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

      const jobChainList = await this.jobChains.Get();
      this.dstSettings = {
        displayedColumns: this.displayedColumns,
        dataSource: jobChainList,
        entitySchema: this.entitySchemaJobChains,
        navigationState: {}
      };

    } finally {
      setTimeout(() => this.busyService.hide(overlayRef));
    }
  }
}
