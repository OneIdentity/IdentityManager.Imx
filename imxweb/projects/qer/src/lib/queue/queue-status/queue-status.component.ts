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

import { CommonModule } from '@angular/common';
import { Component, effect, HostListener } from '@angular/core';
import { MatBadgeModule } from '@angular/material/badge';
import { MatCommonModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { EuiCoreModule, EuiMaterialModule, EuiSidesheetService } from '@elemental-ui/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import {
  calculateSidesheetWidth,
  HELP_CONTEXTUAL,
  HelpContextualComponent,
  HelpContextualModule,
  HelpContextualService,
  LdsReplaceModule,
  LdsReplacePipe,
  ProcessingQueueService,
  SnackBarService,
} from 'qbm';
import { QueueSidesheetComponent } from '../queue-sidesheet/queue-sidesheet.component';

@Component({
  selector: 'imx-queue-status',
  standalone: true,
  imports: [
    CommonModule,
    EuiCoreModule,
    EuiMaterialModule,
    MatBadgeModule,
    MatCommonModule,
    MatIconModule,
    LdsReplaceModule,
    TranslateModule,
    HelpContextualModule,
  ],
  templateUrl: './queue-status.component.html',
  styleUrls: ['./queue-status.component.scss'],
})
export class QueueStatusComponent {
  public totalCount: number;
  public errorCount: number;
  public hasTasks: boolean;
  public hasErrors: boolean;
  // Set to true as the queue is initialized finished, also prevents a snackbar from popping on init
  public isFinished = true;

  constructor(
    private queueService: ProcessingQueueService,
    private snackbar: SnackBarService,
    private sidesheetService: EuiSidesheetService,
    private translateService: TranslateService,
    private ldsReplace: LdsReplacePipe,
    private helpContextualService: HelpContextualService,
  ) {
    effect(() => {
      this.totalCount = this.queueService.totalCount();
      this.errorCount = this.queueService.errorCount();
      this.hasTasks = this.totalCount > 0;
      this.hasErrors = this.errorCount > 0;
      const prevState = structuredClone(this.isFinished);
      this.isFinished = this.queueService.isAllGroupsCompleted();
      if (this.isFinished && prevState != this.isFinished) {
        // We have finished a queue, notify
        this.snackbar.open({
          key: this.hasErrors
            ? '#LDS#Background processes were completed with errors.'
            : '#LDS#Background processes were completed without errors.',
        });
      }
    });
  }

  // This may be removed at a later point - we cannot do more than the default behavior due to security concerns
  // The default browser popup will appear if the queue is not finished
  @HostListener('window:beforeunload', ['$event'])
  private warnOnPageLeave($event: any): void {
    if (!this.isFinished) {
      $event.preventDefault();
    }
  }

  public openSidesheet(): void {
    this.helpContextualService.setHelpContextId(HELP_CONTEXTUAL.ProcessingQueue);

    this.sidesheetService.open(QueueSidesheetComponent, {
      title: this.ldsReplace.transform(this.translateService.instant('#LDS#Heading View Background Processes ({0})'), this.totalCount),
      headerComponent: HelpContextualComponent,
      icon: 'job-queue',
      width: calculateSidesheetWidth(550, 0.4),
      padding: '0',
    });
  }
}
