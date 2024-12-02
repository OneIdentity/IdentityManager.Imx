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
 * Copyright 2024 One Identity LLC.
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

import { CommonModule, DatePipe } from '@angular/common';
import { Component, computed, effect, signal, Signal } from '@angular/core';
import { MatCommonModule } from '@angular/material/core';
import { EuiCoreModule, EuiMaterialModule, EuiSidesheetRef } from '@elemental-ui/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import {
  Action,
  ActionGroup,
  ConfirmationService,
  DateModule,
  LdsReplaceModule,
  LdsReplacePipe,
  ProcessingQueueService,
  QueuedActionState,
} from 'qbm';

@Component({
  selector: 'imx-queue-sidesheet',
  standalone: true,
  imports: [CommonModule, EuiCoreModule, EuiMaterialModule, MatCommonModule, LdsReplaceModule, TranslateModule, DateModule, DatePipe],
  templateUrl: './queue-sidesheet.component.html',
  styleUrls: ['./queue-sidesheet.component.scss'],
})
export class QueueSidesheetComponent {
  public stateOptions = QueuedActionState;
  public totalCount: number;
  public hasActions: boolean;
  public hasErrors: boolean;
  public hasCompletedGroups: boolean;
  public isShowErrorsOnly = signal(false);
  public displayedTaskGroups: Signal<ActionGroup[]> = computed(() => {
    return this.isShowErrorsOnly()
      ? this.queueService._groups().filter((group) => group.erroredActions().length > 0)
      : this.queueService._groups();
  });
  constructor(
    private queueService: ProcessingQueueService,
    private confirmationService: ConfirmationService,
    private translate: TranslateService,
    private ldsReplace: LdsReplacePipe,
    private sidesheetRef: EuiSidesheetRef,
  ) {
    effect(() => {
      this.totalCount = this.queueService.totalCount();
      this.hasActions = this.totalCount > 0;
      const text = this.queueService.isAllGroupsCompleted() ? '#LDS#Heading View Background Processes ({0})' : '#LDS#Heading View Background Processes ({0})';
      this.sidesheetRef.componentInstance!.title = this.ldsReplace.transform(this.translate.instant(text), this.totalCount);
      this.hasErrors = this.queueService.errorCount() > 0;
      this.hasCompletedGroups = this.queueService.hasCompletedGroups();
    });
  }

  public toggleErrorTasks(): void {
    this.isShowErrorsOnly.update((val) => !val);
  }

  public async removeCompletedGroups(): Promise<void> {
    const confirmed = await this.confirmationService.confirm({
      Title: this.translate.instant('#LDS#Heading Remove Completed Processes'),
      Message: this.translate.instant('#LDS#Are you sure you want to remove all completed processes (with and without errors)?'),
    });
    if (confirmed) {
      this.queueService.removeCompletedGroups();
    }
  }

  public retryTask(task: Action): void {
    this.queueService.onRetryAction(task);
  }

  public retryGroup(group: ActionGroup): void {
    this.queueService.onRetryGroup(group);
  }

  public async showError(taskName: string, error: string): Promise<void> {
    await this.confirmationService.showMessageBox(taskName, error, '', async () => {});
  }
}
