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
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

import { FilterType, CompareOperator } from 'imx-qbm-dbts';
import { imx_SessionService, AppConfigService, TextContainer, LdsReplacePipe } from 'qbm';
import { IssueAction } from './service-issues.models';
import { SubscriptionService } from '../../base/subscription.service';
import { ServiceIssueType, ServiceIssueItem } from './service-issue-item';
import { SystemStatusService } from '../system-status/system-status.service';
import { UnresolvedRefsService } from '../../unresolved-refs/unresolved-refs.service';
import { SyncService } from '../../sync/sync.service';

@Injectable()
export class ServiceIssuesService extends SubscriptionService<ServiceIssueItem[]> {
  public isLoading = false;
  private jobDisabled = false;
  private dbDisabled = false;

  constructor(
    private router: Router,
    private sessionService: imx_SessionService,
    private translater: TranslateService,
    private statusService: SystemStatusService,
    private ldsPipe: LdsReplacePipe,
    private syncJournalService: SyncService,
    private unresolvedRefsService: UnresolvedRefsService,
    private configService: AppConfigService
  ) {
    super();
    this.itemsInternal = [];
  }

  // ToDo PBI 278888 Laden Status anzeigen
  public async updateItems(): Promise<void> {
    this.isLoading = true;
    try {
      await this.checkFrozenJobs();
      await this.checkSystemStatus();
      await this.checkInactiveServers();
      await this.checkUnresolvedRefs();
      await this.checkSyncIssues();
    } finally {
      this.isLoading = false;
    }
  }

  private async checkFrozenJobs(): Promise<void> {
    const result = await this.sessionService.TypedClient.OpsupportQueueFrozenjobsbyqueue.Get();
    if (result == null || result.Data == null) {
      return;
    }

    if (result.Data.length <= 0) {
      this.remove(ServiceIssueType.FrozenJobs);
      return;
    }

    const queuesWithFrozenJobs: string[] = [];

    for (const queue of result.Data) {
      queuesWithFrozenJobs.push(queue.QueueName.value);
      await this.update(
        ServiceIssueType.FrozenJobs,
        '#LDS#Process issues',
        {
          key: '#LDS#{0} processes in queue "{1}" are frozen or overflown',
          parameters: [queue.Count.value, queue.QueueName.value],
        },
        'task',
        'warningBubble issueBubble',
        {
          caption: '#LDS#View',
          action: () => this.goToQueue(queue.QueueName.value),
        },
        queue.QueueName.value
      );

      this.remove(ServiceIssueType.FrozenJobs, queuesWithFrozenJobs);
    }
  }

  private async checkSystemStatus(): Promise<void> {
    const result = await this.statusService.get();

    this.jobDisabled = result.IsJobServiceDisabled;
    this.dbDisabled = result.IsDbSchedulerDisabled;

    if (result == null) {
      return;
    }

    if (result.IsCompilationRequired) {
      await this.update(
        ServiceIssueType.CompilationRequired,
        '#LDS#Compilation',
        { key: '#LDS#Database must be compiled' },
        'database',
        'errorBubble issueBubble'
      );
    } else {
      this.remove(ServiceIssueType.CompilationRequired);
    }
    if (result.IsJobServiceDisabled) {
      await this.update(
        ServiceIssueType.JobServiceDisabled,
        '#LDS#Job queue is paused',
        { key: '#LDS#Job queue is not running' },
        'database',
        'warningBubble issueBubble',
        {
          caption: '#LDS#Button Start',
          action: async () => this.changeStatus(false, this.dbDisabled),
        }
      );
    } else {
      this.remove(ServiceIssueType.JobServiceDisabled);
    }
    if (result.IsDbSchedulerDisabled) {
      await this.update(
        ServiceIssueType.DbSchedulerDisabled,
        '#LDS#DBQueue is paused',
        { key: '#LDS#DBQueue is not running' },
        'database',
        'warningBubble issueBubble',
        {
          caption: '#LDS#Button Start',
          action: async () => this.changeStatus(this.jobDisabled, false),
        }
      );
    } else {
      this.remove(ServiceIssueType.DbSchedulerDisabled);
    }
    if (result.IsInMaintenanceMode) {
      await this.update(
        ServiceIssueType.MaintenanceMode,
        '#LDS#Maintenance',
        { key: '#LDS#Database runs in maintenance mode' },
        'database',
        'errorBubble issueBubble'
      );
    } else {
      this.remove(ServiceIssueType.MaintenanceMode);
    }
  }

  private async checkInactiveServers(): Promise<void> {
    const result = await this.sessionService.TypedClient.OpsupportJobservers.Get({
      nofetchjob: true,
    });

    if (result == null) {
      return;
    }

    if (result.totalCount <= 0) {
      this.remove(ServiceIssueType.InactiveServers);
      return;
    }

    await this.update(
      ServiceIssueType.InactiveServers,
      '#LDS#Inactive job servers',
      { key: '#LDS#At least one job server has not fetched any processes for more than 10 minutes.' },
      'database',
      'warningBubble issueBubble',
      {
        caption: '#LDS#View',
        action: () => this.router.navigate(['/ServicesInactive']),
      }
    );
  }

  private async checkSyncIssues(): Promise<void> {
    const filter = [
      {
        ColumnName: this.syncJournalService.syncJournalSchema.Columns.ProjectionState.ColumnName,
        Type: FilterType.Compare,
        CompareOp: CompareOperator.Equal,
        Value1: 'Error',
      },
    ];

    const result = await this.syncJournalService.getSyncJournal({ PageSize: -1, filter });

    if (result == null) {
      return;
    }

    if (result.totalCount <= 0) {
      this.remove(ServiceIssueType.SyncIssues);
      return;
    }

    await this.update(
      ServiceIssueType.SyncIssues,
      '#LDS#Synchronization issues',
      { key: '#LDS#At least one synchronization project has synchronization issues.' },
      'database',
      'warningBubble issueBubble',
      {
        caption: '#LDS#View',
        action: () =>
          this.router.navigate(['/SyncJournal/'], {
            queryParams: { filter: JSON.stringify(filter) },
          }),
      }
    );
  }

  private async checkUnresolvedRefs(): Promise<void> {
    const result = await this.unresolvedRefsService.get();

    if (result == null) {
      return;
    }
    return this.updateUnresolvedRefs(result.totalCount);
  }

  private async updateUnresolvedRefs(totalCount: number): Promise<void> {
    if (totalCount <= this.configService.Config.DatastoreIssueTreshold) {
      this.remove(ServiceIssueType.UnresolvedRefs);
      return;
    }

    await this.update(
      ServiceIssueType.UnresolvedRefs,
      '#LDS#Unresolved references',
      {
        key: '#LDS#{0} objects with unresolved references',
        parameters: [totalCount],
      },
      'unlink',
      'warningBubble issueBubble',
      {
        caption: '#LDS#View',
        action: () => this.router.navigate(['/unresolvedRefs']),
      }
    );
  }

  private async changeStatus(jobService: boolean, dbService: boolean): Promise<void> {
    await this.statusService.set(jobService, dbService);
    await this.updateItems();
  }

  private goToQueue(queue: string): void {
    this.router.navigate(['/jobserver/' + queue]);
  }

  private async update(
    serviceType: ServiceIssueType,
    title: string,
    text: TextContainer,
    icon: string,
    severityClass: string,
    action?: IssueAction,
    id?: string
  ): Promise<void> {
    let issueItem: ServiceIssueItem;

    if (serviceType === ServiceIssueType.FrozenJobs) {
      issueItem = this.itemsInternal.find((item) => item.id === id);
    } else {
      issueItem = this.itemsInternal.find((item) => item.type === serviceType);
    }

    if (issueItem == null) {
      issueItem = new ServiceIssueItem();
      issueItem.type = serviceType;
      issueItem.action = action;
      issueItem.icon = icon;
      issueItem.severityClass = severityClass;
      issueItem.id = id;
      this.itemsInternal.push(issueItem);
    }

    issueItem.title = await this.translater.get(title).toPromise();
    const tranlatedKey = await this.translater.get(text.key).toPromise();
    // workaround, weil er aus text.parameters[0], text.parameters[1] aus irgendeinem Grund "text.parameters[0], text.parameters[1]" macht
    issueItem.text = this.ldsPipe.transform(
      tranlatedKey,
      text.parameters?.length > 0 ? text.parameters[0] : '',
      text.parameters?.length > 1 ? text.parameters[1] : ''
    );
    if (action) {
      issueItem.action.caption = await this.translater.get(action.caption).toPromise();
    }
  }

  private remove(serviceType: ServiceIssueType, excludes?: string[]): void {
    const issueItems = this.itemsInternal.filter((item) => {
      if (excludes && excludes.some((id) => item.id === id)) {
        return false;
      }
      return item.type === serviceType;
    });

    for (const issueItem of issueItems) {
      const index = this.itemsInternal.indexOf(issueItem);

      if (index > -1) {
        this.itemsInternal.splice(index, 1);
      }
    }
  }
}
