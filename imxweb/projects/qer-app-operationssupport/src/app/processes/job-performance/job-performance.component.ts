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
import { MatSelectChange } from '@angular/material/select';

import { JobPerformanceQueuesService } from './job-performance-queues.service';
import { ClassloggerService, DataSourceToolbarSettings, SettingsService } from 'qbm';
import { JobPerformanceService, JobPerformanceParameters } from './job-performance.service';
import { CollectionLoadParameters, EntitySchema, IClientProperty } from 'imx-qbm-dbts';


@Component({
  templateUrl: './job-performance.component.html',
  styleUrls: ['./job-performance.component.scss']
})
export class JobPerformanceComponent implements OnInit {
  public get Queues(): string[] {
    return this.queues;
  }

  public queueName: string;

  public dstSettings: DataSourceToolbarSettings;
  public readonly entitySchemaJobPerformance: EntitySchema;
  private navigationState: CollectionLoadParameters;
  private readonly displayedColumns: IClientProperty[];

  private queues: string[];

  constructor(
    private jobPerformanceQueues: JobPerformanceQueuesService,
    private jobPerformance: JobPerformanceService,
    private logger: ClassloggerService,
    private readonly settingsService: SettingsService,
    private busyService: EuiLoadingService
  ) {
    this.entitySchemaJobPerformance = jobPerformance.EntitySchema;
    this.displayedColumns = [
      this.entitySchemaJobPerformance.Columns.TaskName,
      this.entitySchemaJobPerformance.Columns.ComponentClass,
      this.entitySchemaJobPerformance.Columns.CountPerMinute,
    ];
  }

  public async ngOnInit(): Promise<void> {
    await this.refresh();
  }

  public onSearch(keywords: string): Promise<void> {
    return this.getData({ StartIndex: 0, search: keywords, queue: this.queueName });
  }

  public selectionChange(selection: MatSelectChange): void {
    this.queueName = selection.value;
    this.refresh();
  }

  public async refresh(): Promise<void> {
    await this.UpdateQueueNames();
    this.logger.debug(this, 'selectedQueue', this.queueName);
    await this.getData({ StartIndex: 0, PageSize: this.settingsService.DefaultPageSize, queue: this.queueName });
  }

  public async getData(navigationState: JobPerformanceParameters): Promise<void> {

    this.navigationState = navigationState;

    let overlayRef: OverlayRef;
    setTimeout(() => overlayRef = this.busyService.show());
    try {

      const jobPeformances = await this.jobPerformance.Get(navigationState);
      this.dstSettings = {
        displayedColumns: this.displayedColumns,
        dataSource: jobPeformances,
        entitySchema: this.entitySchemaJobPerformance,
        navigationState: this.navigationState
      };

    } finally {
      setTimeout(() => this.busyService.hide(overlayRef));
    }
  }


  private async UpdateQueueNames(): Promise<void> {
    let overlayRef: OverlayRef;
    setTimeout(() => overlayRef = this.busyService.show());
    try {
      this.queues = await this.jobPerformanceQueues.GetItems();
      if (!this.queueName && this.queues.length > 0) {
        this.queueName = this.queues[0];
      }
    } finally {
      setTimeout(() => this.busyService.hide(overlayRef));
    }
  }
}
