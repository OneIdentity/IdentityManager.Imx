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

import { Component, Inject, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { EuiLoadingService, EuiSidesheetService, EUI_SIDESHEET_DATA } from '@elemental-ui/core';
import { OverlayRef } from '@angular/cdk/overlay';

import { IEntityColumn, TypedEntity, TypedEntityCollectionData } from 'imx-qbm-dbts';
import { HistoryOperationsData, OpsupportQueueJobaffects, ReactivateJobMode } from 'imx-api-qbm';
import { CdrFactoryService, ImxTranslationProviderService, SnackBarService } from 'qbm';
import { QueueTreeService } from './queue-tree.service';
import { ErrorMessageSidesheetComponent } from '../error-message-sidesheet/error-message-sidesheet.component';

@Component({
  templateUrl: './single-frozen-job.component.html',
  styleUrls: ['./single-frozen-job.component.scss'],
})
export class SingleFrozenJobComponent implements OnInit {
  public get BackTitle(): string {
    return this.backTitle;
  }
  public get Display(): string {
    return this.jobDisplay;
  }

  private jobDisplay: string;
  private backTitle = '';

  public affectedObjects: OpsupportQueueJobaffects[] = [];
  public operations: HistoryOperationsData;
  public genprocid: string;
  public busy = false;
  public busyReload = false;

  constructor(
    @Inject(EUI_SIDESHEET_DATA) public readonly data: {
      UID_Tree: string,
      disableRefresh: boolean,
      load: (startId: string) => Promise<TypedEntityCollectionData<TypedEntity>>
    },
    public queueService: QueueTreeService,
    private sidesheet: EuiSidesheetService,
    private translate: TranslateService,
    private busyService: EuiLoadingService,
    private translationProvider: ImxTranslationProviderService,
    private snackbarService: SnackBarService
  ) {
    // TODO (TFS 805984): Use ngx-translate get and ldsReplace direct
    this.translationProvider
      .Translate({ key: '#LDS#Frozen process steps' })
      .subscribe((value: string) =>
        this.translationProvider
          .Translate({ key: '#LDS#Go back to {0}', parameters: [`"${value}"`] })
          .subscribe((composedValue: string) => (this.backTitle = composedValue))
      );
    this.queueService.load = data.load;
  }

  public ReactivateJobMode = ReactivateJobMode;

  public mode: ReactivateJobMode = -1;

  public async ngOnInit(): Promise<void> {
    try {
      this.busy = true;
      await this.loadView(this.data.UID_Tree);
    }
    finally {
      this.busy = false;
    }
  }

  public async reactivate(): Promise<void> {
    const key = this.mode == ReactivateJobMode.Reactivate ? '#LDS#Process "{0}" is retrying.' : '#LDS#Your changes are being processed.';

    this.snackbarService.open({ key: key, parameters: [this.Display] });

    let overlayRef: OverlayRef;
    setTimeout(() => (overlayRef = this.busyService.show()));
    try {
      await this.queueService.Reactivate(this.mode);
      await this.loadView();
    } finally {
      setTimeout(() => this.busyService.hide(overlayRef));
    }
  }

  public async reloadView() {
    try {
      this.busyReload = true;
      await this.loadView();
    } finally {
      this.busyReload = false;
    }
  }

  public async loadView(startUid?: string): Promise<void> {
    if (startUid) {
      this.queueService.startUid = startUid;
    }

    const processTree = await this.queueService.LoadItems();
    const root = processTree.find((el: TypedEntity) => this.getColumn(el, 'IsRootJob').GetValue);
    if (root) {
      this.queueService.SetRoot(root);
      this.jobDisplay = this.getColumn(root, 'JobChainName').GetDisplayValue();
      this.queueService.ExpandAll();

      // load affected objects
      this.affectedObjects = await this.queueService.GetAffectedObjects(root.GetEntity().GetColumn("UID_Job").GetValue());
      this.genprocid = root.GetEntity().GetColumn("GenProcID").GetValue();
      this.operations = await this.queueService.GetChangeOperations(this.genprocid);
    }
    else {
      this.affectedObjects = [];
      this.operations = null;
      this.genprocid = null;
    }
  }

  public timeAccessor(data: TypedEntity, index: number): string {
    const date = new Date(this.getColumn(data, 'XDateUpdated')?.GetValue() ?? this.getColumn(data, 'XDateInserted')?.GetValue());
    const opt: any = { month: 'long', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' };

    return index === 0 ? '' : new Intl.DateTimeFormat(this.translate.currentLang, opt).format(date);
  }

  public displayAccessor(data: TypedEntity, index: number): string {
    return index === 0
      ? this.Display
      : this.getColumn(data, 'JobName')?.GetDisplayValue() ?? this.getColumn(data, 'UID_JobOrigin')?.GetDisplayValue();
  }

  public hasProgress(item: TypedEntity): boolean {
    return this.getColumn(item, 'IsRootJob').GetValue();
  }

  public getTotalSteps(): number {
    return this.queueService.GetTotalSteps();
  }

  public getCompletedSteps(): number {
    return this.queueService.GetCompleteSteps();
  }

  public isFrozen(dataItem: TypedEntity): boolean {
    return this.getColumn(dataItem, 'Ready2EXE')?.GetValue().toUpperCase() === 'FROZEN' || this.getColumn(dataItem, 'Ready2EXE')?.GetValue().toUpperCase() === 'OVERLIMIT' || this.getColumn(dataItem, 'WasError')?.GetValue();
  }

  public async showMessage(dataItem: TypedEntity): Promise<void> {
    await this.sidesheet
      .open(ErrorMessageSidesheetComponent, {
        title: await this.translate.get('#LDS#Heading View Error Message').toPromise(),
        padding: '0',
        width: 'max(50%,500px)',
        testId: 'error-message-sidesheet',
        data: this.getColumn(dataItem, 'ErrorMessages').GetDisplayValue(),
      })
      .afterClosed()
      .toPromise();
  }

  public getColumnDisplay(name: string): string {
    return this.queueService.QueueTreeEntitySchema.Columns[name].Display;
  }

  public getValue(entity: TypedEntity, name: string): any {
    return this.getColumn(entity, name).GetValue() ?? '';
  }

  public getColumn(entity: TypedEntity, name: string): IEntityColumn {
    return CdrFactoryService.tryGetColumn(entity.GetEntity(), name);
  }
}
