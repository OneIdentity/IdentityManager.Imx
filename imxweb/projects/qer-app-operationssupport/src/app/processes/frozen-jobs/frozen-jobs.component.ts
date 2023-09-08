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
import { ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { OverlayRef } from '@angular/cdk/overlay';
import { EuiLoadingService, EuiSidesheetConfig, EuiSidesheetService } from '@elemental-ui/core';
import { TranslateService } from '@ngx-translate/core';

import { OpsupportQueueFrozenjobs } from 'imx-api-qbm';
import { QueueJobsService } from '../jobs/queue-jobs.service';
import { FrozenJobsService, JobQueueParameters } from './frozen-jobs.service';
import { SnackBarService, MessageDialogComponent, DataSourceToolbarSettings, SettingsService } from 'qbm';
import { CollectionLoadParameters, DisplayColumns, EntitySchema, IClientProperty, ValType } from 'imx-qbm-dbts';
import { SingleFrozenJobComponent } from './single-frozen-job.component';

@Component({
  templateUrl: './frozen-jobs.component.html',
  styleUrls: ['./frozen-jobs.component.scss']
})
export class FrozenJobsComponent implements OnInit {
  public queueName = '';
  public selectable: any = { checkboxOnly: true, mode: 'multiple' };

  public dstSettings: DataSourceToolbarSettings;
  public readonly entitySchemaFrozenJobs: EntitySchema;
  public readonly DisplayColumns = DisplayColumns;
  public selectedJobs: OpsupportQueueFrozenjobs[] = [];
  public jobCount = 0;

  private navigationState: CollectionLoadParameters;
  private readonly displayedColumns: IClientProperty[];

  constructor(
    private readonly sideSheet: EuiSidesheetService,
    private route: ActivatedRoute,
    private dialogService: MatDialog,
    private snackbarService: SnackBarService,
    private jobService: QueueJobsService,
    private busyService: EuiLoadingService,
    private frozenJobs: FrozenJobsService,
    private settingsService: SettingsService,
    private translator: TranslateService
  ) {
    this.entitySchemaFrozenJobs = frozenJobs.EntitySchema;
    this.displayedColumns = [
      this.entitySchemaFrozenJobs.Columns.JobChainName,
      this.entitySchemaFrozenJobs.Columns.TaskName,
      {
        ColumnName: 'actions',
        Type: ValType.String
      }
    ];
  }

  public async ngOnInit(): Promise<void> {
    this.queueName = this.route.snapshot.paramMap.get('queueName');
    await this.getData({ StartIndex: 0, PageSize: this.settingsService.DefaultPageSize, queueName: this.queueName });
  }

  public onSearch(keywords: string): Promise<void> {
    return this.getData({ StartIndex: 0, search: keywords, queueName: this.queueName });
  }


  public async reactivate(item: OpsupportQueueFrozenjobs): Promise<void> {
    let overlayRef: OverlayRef;
    setTimeout(() => overlayRef = this.busyService.show());
    try {
      await this.jobService.Post([item.UID_Job.value]);
      this.snackbarService.open({ key: '#LDS#Process "{0}" is retrying.', parameters: [item.JobChainName.value] });
    } finally {
      setTimeout(() => this.busyService.hide(overlayRef));
      await this.refresh();
    }
  }

  public onSelectionChanged(jobs: OpsupportQueueFrozenjobs[]): void {
    this.selectedJobs = jobs;
  }

  public async viewDetails(job: OpsupportQueueFrozenjobs): Promise<void> {
    this.snackbarService.dismiss();
    const opts: EuiSidesheetConfig = {
      title: await this.translator.get('#LDS#Heading View Process Details').toPromise(),
      subTitle: job.JobChainName.Column.GetDisplayValue(),
      width: 'max(1000px, 80%)',
      icon: 'reboot',
      testId: 'frozen-jobs-process-details-sidesheet',
      data: {
        UID_Tree: job.UID_Tree.value,
        load: (startId:string) => {return this.jobService.getTreeData(startId)}
      },
    };
    this.sideSheet.open(SingleFrozenJobComponent, opts)
      // After the sidesheet closes, reload the current data to refresh any changes that might have been made
      .afterClosed().subscribe(() => this.refresh());
  }

  public async showMessage(item: OpsupportQueueFrozenjobs): Promise<void> {
    this.dialogService.open(MessageDialogComponent, {
      data: {
        ShowOk: true,
        Title: await this.translator.get('#LDS#Error message').toPromise(),
        Message: item.ErrorMessages.Column.GetDisplayValue()
      },
      panelClass: 'imx-messageDialog'
    });
  }

  public isFrozen(item: OpsupportQueueFrozenjobs): boolean {
    return item.Ready2EXE.value.toUpperCase() === 'FROZEN' || item.Ready2EXE.value.toUpperCase() === 'OVERLIMIT';
  }

  public async reactivateSelected(): Promise<void> {
    if (this.selectedJobs.length > 0) {
      let overlayRef: OverlayRef;
      setTimeout(() => overlayRef = this.busyService.show());
      try {
        await this.jobService.Post(this.selectedJobs.map((job: OpsupportQueueFrozenjobs) => job.UID_Job.value));
        this.snackbarService.open({ key: '#LDS#{0} processes are retrying.', parameters: [this.selectedJobs.length] });
      } finally {
        setTimeout(() => this.busyService.hide(overlayRef));
        await this.refresh();
      }
    }
  }

  public async refresh(): Promise<void> {
    this.selectedJobs = [];
    await this.getData({ StartIndex: 0, PageSize: this.settingsService.DefaultPageSize, queueName: this.queueName });
  }

  public async getData(navigationState: JobQueueParameters): Promise<void> {
    this.navigationState = navigationState;

    let overlayRef: OverlayRef;
    setTimeout(() => overlayRef = this.busyService.show());
    try {

      const journalEntries = await this.frozenJobs.Get(navigationState);
      this.jobCount = journalEntries.totalCount;

      this.dstSettings = {
        displayedColumns: this.displayedColumns,
        dataSource: journalEntries,
        entitySchema: this.entitySchemaFrozenJobs,
        navigationState: this.navigationState
      };

    } finally {
      setTimeout(() => this.busyService.hide(overlayRef));
    }
  }
}
