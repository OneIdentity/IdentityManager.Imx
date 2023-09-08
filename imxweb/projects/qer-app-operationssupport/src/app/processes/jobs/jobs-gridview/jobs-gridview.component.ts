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

import { Component, Input, OnInit } from '@angular/core';
import { OverlayRef } from '@angular/cdk/overlay';
import { EuiLoadingService, EuiSidesheetConfig, EuiSidesheetService } from '@elemental-ui/core';

import { OpsupportQueueJobs, ReactivateJobMode } from 'imx-api-qbm';
import { OpsupportQueueJobsParameters, QueueJobsService } from '../queue-jobs.service';
import { SnackBarService, TextContainer, DataSourceToolbarSettings, DataSourceToolbarFilter, SettingsService, ClientPropertyForTableColumns } from 'qbm';
import { CollectionLoadParameters, CompareOperator, DataModel, EntitySchema, FilterType, ValType } from 'imx-qbm-dbts';
import { SingleFrozenJobComponent } from '../../frozen-jobs/single-frozen-job.component';
import { TranslateService } from '@ngx-translate/core';


@Component({
  selector: 'imx-jobs-gridview',
  templateUrl: './jobs-gridview.component.html',
  styleUrls: ['./jobs-gridview.component.scss'],
})
export class JobsGridviewComponent implements OnInit {
  public dstSettings: DataSourceToolbarSettings;
  public readonly entitySchemaJobs: EntitySchema;
  public selectedJobs: OpsupportQueueJobs[] = [];

  public readonly itemStatus = {
    enabled: (item: OpsupportQueueJobs): boolean => {
      return this.isFrozen(item);
    },
  };

  @Input() public preselectFailed = false;
  @Input() public proccessId: string;
  @Input() public withActions: boolean = true;
  @Input() public noData: string;

  private navigationState: CollectionLoadParameters;
  private readonly displayedColumns: ClientPropertyForTableColumns[];
  private filters: DataSourceToolbarFilter[];
  private dataModel: DataModel;

  constructor(
    private snackBarService: SnackBarService,
    private readonly sideSheet: EuiSidesheetService,
    private busyService: EuiLoadingService,
    private readonly translator: TranslateService,
    private jobService: QueueJobsService,
    settings: SettingsService
  ) {
    this.entitySchemaJobs = jobService.EntitySchema;
    this.displayedColumns = [
      this.entitySchemaJobs.Columns.JobChainName,
      this.entitySchemaJobs.Columns.CombinedStatus,
      this.entitySchemaJobs.Columns.XDateInserted,
      {
        ColumnName: 'actions',
        Type: ValType.String,
        afterAdditionals: true,
        untranslatedDisplay: '#LDS#Retry',
      },
    ];

    this.navigationState = {
      StartIndex: 0,
      PageSize: settings.DefaultPageSize,
      filter: [
        {
          ColumnName: 'IsRootJob',
          Type: FilterType.Compare,
          CompareOp: CompareOperator.Equal,
          Value1: true,
        },
      ],
    };
  }

  public async ngOnChanges() {
    if (this.proccessId) {
      this.navigationState.genprocid = this.proccessId;
    }
    this.getData(this.navigationState);
  }

  public async ngOnInit(): Promise<void> {
    let overlayRef: OverlayRef;
    setTimeout(() => (overlayRef = this.busyService.show()));
    try {
      this.filters = await this.jobService.getFilters();
      this.dataModel = await this.jobService.getDataModel();
    } finally {
      setTimeout(() => this.busyService.hide(overlayRef));
    }
    if (this.preselectFailed) {
      const indexActive = this.filters.findIndex((elem) => elem.Name === 'state');
      if (indexActive > -1) {
        this.filters[indexActive].InitialValue = 'failed';
        this.navigationState.state = 'failed';
      }
    }
    if (this.proccessId) {
      this.navigationState.genprocid = this.proccessId;
    }
    this.getData(this.navigationState);
  }

  public onSearch(keywords: string): Promise<void> {
    return this.getData({ StartIndex: 0, search: keywords });
  }

  public isFrozen(job: OpsupportQueueJobs): boolean {
    return (
      job.CombinedStatus && (job.CombinedStatus.value.toUpperCase() === 'FROZEN' || job.CombinedStatus.value.toUpperCase() === 'OVERLIMIT')
    );
  }

  public itemsAreSelected(): boolean {
    return this.selectedJobs.length > 0;
  }

  public async viewDetails(job: OpsupportQueueJobs): Promise<void> {
    const opts: EuiSidesheetConfig = {
      title: await this.translator.get('#LDS#Heading Process Overview').toPromise(),
      subTitle: job.JobChainName.Column.GetDisplayValue() + ' ' + job.XDateInserted.Column.GetDisplayValue(),
      width: 'max(1000px, 80%)',
      icon: 'reboot',
      testId: 'job-details-sidesheet',
      data: {
        UID_Tree: job.UID_Tree.value,
        load: (startId: string) => {
          return this.jobService.getTreeData(startId);
        },
      },
    };

    this.sideSheet
      .open(SingleFrozenJobComponent, opts)
      // After the sidesheet closes, reload the current data to refresh any changes that might have been made
      .afterClosed()
      .subscribe(() => this.getData(this.navigationState));
  }

  public retryJob(job: OpsupportQueueJobs): void {
    this.retryJobs([job], ReactivateJobMode.Reactivate, { key: '#LDS#Process "{0}" is retrying.', parameters: [job.TaskName.value] });
  }

  public retrySelectedJobs(): void {
    if (this.itemsAreSelected()) {
      this.retryJobs(this.selectedJobs, ReactivateJobMode.Reactivate, {
        key: '#LDS#{0} processes are retrying.',
        parameters: [this.selectedJobs.length],
      });
    }
  }

  public continueSelectedJobs(asSuccess: boolean): void {
    const mode = asSuccess ? ReactivateJobMode.ContinueSuccess : ReactivateJobMode.ContinueError;
    this.retryJobs(this.selectedJobs, mode, { key: '#LDS#Your changes are being processed.', parameters: [this.selectedJobs.length] });
  }

  public onSelectionChanged(jobs: OpsupportQueueJobs[]): void {
    this.selectedJobs = jobs;
  }

  public refresh(): void {
    if (this.proccessId) {
      this.navigationState.genprocid = this.proccessId;
    }
    this.getData({ StartIndex: 0, genprocid: this.proccessId });
  }

  public async getData(navigationState: OpsupportQueueJobsParameters): Promise<void> {
    this.navigationState = {
      ...navigationState,
      ...{
        filter: [
          {
            ColumnName: 'IsRootJob',
            Type: FilterType.Compare,
            CompareOp: CompareOperator.Equal,
            Value1: true,
          },
        ],
      },
    };

    let overlayRef: OverlayRef;
    setTimeout(() => (overlayRef = this.busyService.show()));
    try {
      const queuedJobs = await this.jobService.Get(this.navigationState);

      this.dstSettings = {
        displayedColumns: this.displayedColumns,
        dataSource: queuedJobs,
        entitySchema: this.entitySchemaJobs,
        navigationState: this.navigationState,
        filters: this.filters,
        dataModel: this.dataModel,
      };
    } finally {
      setTimeout(() => this.busyService.hide(overlayRef));
    }
  }

  private async retryJobs(jobs: OpsupportQueueJobs[], mode: ReactivateJobMode, message: TextContainer): Promise<void> {
    let overlayRef: OverlayRef;
    setTimeout(() => (overlayRef = this.busyService.show()));
    let success = false;

    try {
      await this.jobService.Retry(
        mode,
        jobs.map((job: OpsupportQueueJobs) => job.UID_Job.value)
      );
      success = true;
    } finally {
      setTimeout(() => this.busyService.hide(overlayRef));
    }
    if (success) {
      await this.getData(this.navigationState);
      this.snackBarService.open(message);
      if (this.itemsAreSelected()) {
        this.selectedJobs = [];
      }
    }
  }
}
