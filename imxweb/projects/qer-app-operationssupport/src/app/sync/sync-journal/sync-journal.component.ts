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

import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { OverlayRef } from '@angular/cdk/overlay';
import { EuiDownloadDirective, EuiLoadingService } from '@elemental-ui/core';

import { OpsupportSyncJournal } from 'imx-api-dpr';
import { EntitySchema, IClientProperty, ValType } from 'imx-qbm-dbts';
import { DataSourceToolbarSettings, ElementalUiConfigService, ClientPropertyForTableColumns, SettingsService } from 'qbm';
import { OpsSyncJournalParameters, SyncService } from '../sync.service';
import { SyncSummaryService } from './sync-summary.service';

@Component({
  selector: 'imx-sync-journal',
  templateUrl: './sync-journal.component.html',
  styleUrls: ['./sync-journal.component.scss']
})
export class SyncJournalComponent implements OnInit {

  public caption = '';

  public dstSettings: DataSourceToolbarSettings;
  public readonly entitySchemaSyncInfo: EntitySchema;
  @ViewChild(EuiDownloadDirective) public directive: EuiDownloadDirective;

  private navigationState: OpsSyncJournalParameters;
  private readonly displayedColumns: ClientPropertyForTableColumns[];

  constructor(
    private activeRoute: ActivatedRoute,
    private syncShellService: SyncService,
    private syncSummaryService: SyncSummaryService,
    private readonly elementalUiConfigService: ElementalUiConfigService,
    private readonly settings: SettingsService,
    private busyService: EuiLoadingService) {

    this.entitySchemaSyncInfo = syncShellService.syncJournalSchema;
    this.displayedColumns = [
      this.entitySchemaSyncInfo.Columns.CreationTime,
      this.entitySchemaSyncInfo.Columns.ProjectionConfigDisplay,
      this.entitySchemaSyncInfo.Columns.ProjectionState,
      this.entitySchemaSyncInfo.Columns.ProjectionStartInfoDisplay,
      {
        ColumnName: 'actions',
        Type: ValType.String,
        afterAdditionals: true,
        untranslatedDisplay: '#LDS#Actions'
      }
    ];
  }

  public async ngOnInit(): Promise<void> {
    const filter = this.activeRoute.snapshot.queryParamMap.get('filter');
    const parameters = {
      shell: '',
      filter: filter ? JSON.parse(filter) : null
    };

    let overlayRef: OverlayRef;
    setTimeout(() => overlayRef = this.busyService.show());
    try {
      const uidSyncShell = this.activeRoute.snapshot.paramMap.get('uidSyncShell');
      if (uidSyncShell) {
        this.caption = `: ${await this.syncShellService.GetDisplayName(uidSyncShell)}`;
        parameters.shell = uidSyncShell;
      } else {
        this.caption = '';
      }
    } finally {
      setTimeout(() => this.busyService.hide(overlayRef));
    }
    await this.getData({
      StartIndex: 0, PageSize: this.settings.DefaultPageSize,
      shell: parameters.shell, filter: parameters.filter
    });
  }

  public async getData(navigationState: OpsSyncJournalParameters): Promise<void> {
    this.navigationState = navigationState;

    let overlayRef: OverlayRef;
    setTimeout(() => overlayRef = this.busyService.show());
    try {

      const applications = await this.syncShellService.getSyncJournal(navigationState);
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

  public async showReport(journalItem: OpsupportSyncJournal): Promise<void> {
    let overlayRef: OverlayRef;
    setTimeout(() => overlayRef = this.busyService.show());
    try {
      const blob = await this.syncSummaryService
        .Get({ journal: journalItem.UID_DPRJournal.value });

      let fileName = journalItem.UID_DPRJournal.Column.GetDisplayValue();
      if (blob.type.startsWith('application/pdf')) {
        fileName = `${fileName}.pdf`;
      }
      const csvUrl = URL.createObjectURL(blob);

      console.log(fileName);

      if (this.directive) {
        this.directive.downloadOptions = {
          ... this.elementalUiConfigService.Config.downloadOptions,
          url: csvUrl,
          fileName
        };
        this.directive.onClick();
      }

    } finally {
      setTimeout(() => this.busyService.hide(overlayRef));
    }
  }

  public refresh(): void {
    this.getData({ StartIndex: 0, PageSize: this.settings.DefaultPageSize });
  }
}
