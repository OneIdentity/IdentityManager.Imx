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
import { FilterType, CompareOperator } from 'imx-qbm-dbts';
import { SubscriptionService } from '../../base/subscription.service';
import { NotificationIssueItem, NotificationIssueType } from './notification-issue-item';
import { IssueAction } from '../service-issues/service-issues.models';
import { imx_SessionService, TextContainer, LdsReplacePipe } from 'qbm';
import { TranslateService } from '@ngx-translate/core';

@Injectable()
export class NotificationsService extends SubscriptionService<NotificationIssueItem[]> {
  public isLoading: boolean;
  constructor(
    private session: imx_SessionService,
    private translate: TranslateService,
    private ldsreplace: LdsReplacePipe,
    private router: Router
  ) {
    super();
    this.itemsInternal = [];
  }

  // TODO PBI 278888 Laden irgendwie anzeigen
  public async updateItems(): Promise<void> {
    this.isLoading = true;
    try {
      await this.checkFrozenJobsLast24Hours();
      await this.checkJournal();
    } finally {
      this.isLoading = false;
    }
  }

  private async checkFrozenJobsLast24Hours(): Promise<void> {
    const frozenJobs = await this.session.TypedClient.OpsupportQueueFrozenjobs.Get({
      PageSize: -1,
    });
    const type = NotificationIssueType.FrozenJobsSinceYesterday;
    if (frozenJobs && frozenJobs.totalCount > 0) {
      await this.update(
        type,
        '#LDS#Failed processes',
        { key: '#LDS#{0} processes failed', parameters: [frozenJobs.totalCount] },
        'reboot',
        {
          caption: '#LDS#View',
          action: () => this.router.navigate(['/Jobs'], { queryParams: { failed: true } }),
        }
      );
    } else {
      this.remove(type);
    }
  }

  private async checkJournal(): Promise<void> {
    const stats = await this.session.Client.opsupport_journal_stat_get();
    const type = NotificationIssueType.SystemJournalSinceYesterday;
    if (stats && (stats.Errors > 0 || stats.Warnings > 0)) {
      await this.update(
        type,
        '#LDS#Database log',
        { key: '#LDS#{0} errors / {1} warnings since yesterday', parameters: [stats.Errors, stats.Warnings] },
        'reports',
        {
          caption: '#LDS#View',
          action: () => this.router.navigate(['/journal']),
        }
      );
    } else {
      this.remove(type);
    }
  }

  private async update(
    notificationType: NotificationIssueType,
    title: string,
    text: TextContainer,
    icon: string,
    action?: IssueAction
  ): Promise<void> {
    let issueItem: NotificationIssueItem = this.itemsInternal.find((item) => item.type === notificationType);

    if (issueItem == null) {
      issueItem = new NotificationIssueItem();
      issueItem.type = notificationType;
      issueItem.action = action;
      issueItem.icon = icon;
      this.itemsInternal.push(issueItem);
    }

    issueItem.title = await this.translate.get(title).toPromise();
    issueItem.action.caption = await this.translate.get(action.caption).toPromise();
    const tranlatedKey = await this.translate.get(text.key).toPromise();
    // workaround, weil er aus text.parameters[0], text.parameters[1] aus irgendeinem Grund "text.parameters[0], text.parameters[1]" macht
    issueItem.text = this.ldsreplace.transform(
      tranlatedKey,
      text.parameters?.length > 0 ? text.parameters[0] : '',
      text.parameters?.length > 1 ? text.parameters[1] : ''
    );
  }

  private remove(type: NotificationIssueType): void {
    this.itemsInternal
      .filter((item) => item.type === type)
      .map((item) => this.itemsInternal.indexOf(item))
      .filter((index) => index > -1)
      .forEach((index) => this.itemsInternal.splice(index, 1));
  }
}
