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

import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { OverlayRef } from '@angular/cdk/overlay';
import { EuiLoadingService } from '@elemental-ui/core';

import { JobServersParameters, JobServersService } from './job-servers.service';
import { DataSourceToolbarSettings, SettingsService } from 'qbm';

@Component({
  selector: 'imx-job-servers-gridview',
  templateUrl: './job-servers-gridview.component.html',
  styleUrls: ['./job-servers-gridview.component.scss'],
})
export class JobServersGridviewComponent implements OnInit {
  public dstSettings: DataSourceToolbarSettings;

  @Input() public withRefresh = false;

  @Output() public readonly jobServersChecked = new EventEmitter<boolean>();

  private navigationState: JobServersParameters;

  constructor(
    private gridDataService: JobServersService,
    private busyService: EuiLoadingService,
    private readonly settingsService: SettingsService
  ) { }

  public async ngOnInit(): Promise<void> {
    await this.refresh();
  }

  public onSearch(keywords: string): Promise<void> {
    return this.getData({PageSize: this.settingsService.DefaultPageSize, StartIndex: 0, search: keywords });
  }

  public navigationStateChanged(navigationState: JobServersParameters): Promise<void> {
    return this.getData({ ...this.navigationState, ...navigationState });
  }

  public async refresh(withconnection: boolean = false): Promise<void> {
    await this.getData({PageSize: this.settingsService.DefaultPageSize, StartIndex: 0, withconnection });
  }

  private async getData(navigationState: JobServersParameters): Promise<void> {
    this.navigationState = { ...this.navigationState, ...navigationState };

    const entitySchema = this.gridDataService.OpsupportJobserversSchema;

    const displayedColumns = [];
    displayedColumns.push(entitySchema.Columns.Ident_Server);
    if (this.navigationState.withconnection) {
      displayedColumns.push(entitySchema.Columns.Connection);
    }
    displayedColumns.push(entitySchema.Columns.LastJobFetchTime);
    displayedColumns.push(entitySchema.Columns.ServerWebUrl);
    displayedColumns.push(entitySchema.Columns.PhysicalServerName);
    displayedColumns.push(entitySchema.Columns.IPV4);

    let overlayRef: OverlayRef;
    setTimeout(() => overlayRef = this.busyService.show());
    try {
      this.dstSettings = {
        displayedColumns,
        dataSource: await this.gridDataService.get(this.navigationState),
        entitySchema,
        navigationState: this.navigationState
      };

      this.jobServersChecked.emit(this.navigationState.withconnection);
    } finally {
      setTimeout(() => this.busyService.hide(overlayRef));
    }
  }
}
