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

import { Component, Inject, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';

import { QueueTreeService } from './queue-tree.service';
import { OpsupportQueueTree, ReactivateJobMode } from 'imx-api-qbm';
import { ImxTranslationProviderService, SnackBarService, MessageDialogComponent } from 'qbm';
import { EuiLoadingService, EUI_SIDESHEET_DATA } from '@elemental-ui/core';
import { OverlayRef } from '@angular/cdk/overlay';

@Component({
  templateUrl: './single-frozen-job.component.html',
  styleUrls: ['./single-frozen-job.component.scss']
})
export class SingleFrozenJobComponent implements OnInit {
  public get BackTitle(): string { return this.backTitle; }
  public get Display(): string { return this.jobDisplay; }

  private jobDisplay: string;
  private backTitle = '';

  constructor(
    @Inject(EUI_SIDESHEET_DATA) public readonly data: { UID_Tree: string; },
    public queueService: QueueTreeService,
    private dialogService: MatDialog,
    private translate: TranslateService,
    private busyService: EuiLoadingService,
    private translationProvider: ImxTranslationProviderService,
    private snackbarService: SnackBarService
  ) {
    // TODO (TFS 805984): Use ngx-translate get and ldsReplace direct
    this.translationProvider.Translate({ key: '#LDS#Frozen process steps' }).subscribe((value: string) =>
      this.translationProvider.Translate({ key: '#LDS#Go back to {0}', parameters: [`"${value}"`] }).subscribe((composedValue: string) =>
        this.backTitle = composedValue)
    );
  }

  public ReactivateJobMode = ReactivateJobMode;

  public mode: ReactivateJobMode = -1;

  public async ngOnInit(): Promise<void> {
    return this.loadView(this.data.UID_Tree);
  }

  public async reactivate(): Promise<void> {
    const key = this.mode == ReactivateJobMode.Reactivate
      ? '#LDS#Process "{0}" is retrying.'
      : '#LDS#Your changes are being processed.';

    this.snackbarService.open({ key: key, parameters: [this.Display] });

    let overlayRef: OverlayRef;
    setTimeout(() => overlayRef = this.busyService.show());
    try {
      await this.queueService.Reactivate(this.mode);
      await this.loadView();
    } finally {
      setTimeout(() => this.busyService.hide(overlayRef));
      await this.loadView();
    }
  }

  public async loadView(startUid?: string): Promise<void> {
    if (startUid) {
      this.queueService.startUid = startUid;
    }
    let overlayRef: OverlayRef;
    setTimeout(() => overlayRef = this.busyService.show());
    try {
      const processTree = await this.queueService.LoadItems();
      const root = processTree.find((el: OpsupportQueueTree) => el.IsRootJob.value);
      if (root) {
        this.queueService.SetRoot(root);
        this.jobDisplay = root.JobChainName.Column.GetDisplayValue();
        this.queueService.ExpandAll();
      }
    } finally {
      setTimeout(() => this.busyService.hide(overlayRef));
    }
  }

  public timeAccessor(data: OpsupportQueueTree, index: number): string {
    const date = new Date(data.XDateUpdated.value);
    const opt: any = { month: 'long', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' };

    return index === 0 ? '' : new Intl.DateTimeFormat(this.translate.currentLang, opt).format(date);
  }

  public displayAccessor(data: OpsupportQueueTree, index: number): string {
    return index === 0 ? this.Display : data.UID_JobOrigin.Column.GetDisplayValue();
  }

  public hasProgress(item: OpsupportQueueTree): boolean {
    return item.IsRootJob.value;
  }

  public getTotalSteps(): number {
    return this.queueService.GetTotalSteps();
  }

  public getCompletedSteps(): number {
    return this.queueService.GetCompleteSteps();
  }

  public isFrozen(dataItem: OpsupportQueueTree): boolean {
    return dataItem.Ready2EXE.value.toUpperCase() === 'FROZEN' ||
      dataItem.Ready2EXE.value.toUpperCase() === 'OVERLIMIT';
  }

  public showMessage(dataItem: OpsupportQueueTree): void {
    this.dialogService.open(MessageDialogComponent, {
      data: {
        ShowOk: true,
        Title: dataItem.ErrorMessages.GetMetadata().GetDisplay(),
        Message: dataItem.ErrorMessages.Column.GetDisplayValue()
      },
      panelClass: 'imx-messageDialog'
    });
  }

  public getColumnDisplay(name: string): string {
    return this.queueService.QueueTreeEntitySchema.Columns[name].Display;
  }
}
