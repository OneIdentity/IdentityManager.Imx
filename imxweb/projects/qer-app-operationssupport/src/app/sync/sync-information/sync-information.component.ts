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
import { Router } from '@angular/router';
import { EuiLoadingService } from '@elemental-ui/core';

import { OpsupportSyncShell } from 'imx-api-dpr';
import { EntitySchema, IClientProperty, ValType } from 'imx-qbm-dbts';
import { DataSourceToolbarSettings, ClientPropertyForTableColumns, SettingsService } from 'qbm';
import { OpsupportSyncShellParameters, SyncService } from '../sync.service';

@Component({
  selector: 'imx-sync-information',
  templateUrl: './sync-information.component.html',
  styleUrls: ['./sync-information.component.scss']
})
export class SyncInformationComponent implements OnInit {

  public dstSettings: DataSourceToolbarSettings;
  public readonly entitySchemaSyncInfo: EntitySchema;
  private navigationState: OpsupportSyncShellParameters;
  private readonly displayedColumns: ClientPropertyForTableColumns[];

  constructor(
    private dataSource: SyncService,
    private router: Router,
    private busyService: EuiLoadingService,
    private readonly settings: SettingsService
  ) {
    this.navigationState = { StartIndex: 0, PageSize: settings.DefaultPageSize };
    this.entitySchemaSyncInfo = dataSource.syncShellSchema;
    this.displayedColumns = [
      this.entitySchemaSyncInfo.Columns.DisplayName,
      this.entitySchemaSyncInfo.Columns.Description,
      this.entitySchemaSyncInfo.Columns.NextSyncDate,
      this.entitySchemaSyncInfo.Columns.CountJournalFailure,
      this.entitySchemaSyncInfo.Columns.LastSyncCountObjects,
      {
        ColumnName: 'actions',
        Type: ValType.String,
        afterAdditionals: true,
        untranslatedDisplay: '#LDS#Actions'
      }
    ];
  }

  public async ngOnInit(): Promise<void> {
    await this.refresh();
  }

  public async refresh(): Promise<void> {
    return this.getData({ withfrozenjobs: false });
  }

  public onSearch(keywords: string): Promise<void> {
    return this.getData({ StartIndex: 0, search: keywords, withfrozenjobs: false });
  }

  public async getData(navigationState: OpsupportSyncShellParameters): Promise<void> {
    this.navigationState = { ...this.navigationState, ...navigationState };

    let overlayRef: OverlayRef;
    setTimeout(() => overlayRef = this.busyService.show());
    try {

      const applications = await this.dataSource.getSyncShell(navigationState);
      this.dstSettings = {
        displayedColumns: this.displayedColumns,
        dataSource: applications,
        entitySchema: this.entitySchemaSyncInfo,
        navigationState: this.navigationState
      };

    } finally {
      setTimeout(() => this.busyService.hide(overlayRef));
    }
  }

  public viewDetails(syncShell: OpsupportSyncShell): void {
    this.router.navigate(['/SyncJournal/' + syncShell.UID_DPRShell.value]);
  }

}
