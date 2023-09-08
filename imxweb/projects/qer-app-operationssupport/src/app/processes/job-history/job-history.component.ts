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

import { OverlayRef } from '@angular/cdk/overlay';
import { Component, OnInit } from '@angular/core';
import { EuiLoadingService, EuiSidesheetConfig, EuiSidesheetService } from '@elemental-ui/core';
import { TranslateService } from '@ngx-translate/core';
import { OpsupportQueueJobhistory } from 'imx-api-qbm';
import { CollectionLoadParameters, DataModel, DisplayColumns, EntitySchema, IClientProperty, ValType } from 'imx-qbm-dbts';
import { DataSourceToolbarSettings, SettingsService } from 'qbm';
import { JobHistoryService } from './job-history.service';
import { ErrorMessageSidesheetComponent } from '../error-message-sidesheet/error-message-sidesheet.component';
import { SingleFrozenJobComponent } from '../frozen-jobs/single-frozen-job.component';

@Component({
  selector: 'imx-job-history',
  templateUrl: './job-history.component.html',
  styleUrls: ['./job-history.component.scss'],
})
export class JobHistoryComponent implements OnInit {
  public dstSettings: DataSourceToolbarSettings;
  public readonly entitySchema: EntitySchema;
  public readonly DisplayColumns = DisplayColumns;

  private navigationState: CollectionLoadParameters;
  private readonly displayedColumns: IClientProperty[];
  private dataModel: DataModel;

  constructor(
    private readonly jobHistory: JobHistoryService,
    private readonly settingsService: SettingsService,
    private busyService: EuiLoadingService,
    private readonly translate: TranslateService,
    private readonly sidesheet: EuiSidesheetService
  ) {
    this.entitySchema = jobHistory.EntitySchema;
    this.displayedColumns = [
      this.entitySchema.Columns[DisplayColumns.DISPLAY_PROPERTYNAME],
      { ColumnName: 'icon', Type: ValType.String },
      this.entitySchema.Columns.XDateInserted,
      this.entitySchema.Columns.GenProcID,
      this.entitySchema.Columns.ErrorMessages,
    ];
  }

  public async ngOnInit(): Promise<void> {
    let overlayRef: OverlayRef;
    setTimeout(() => (overlayRef = this.busyService.show()));
    try {
      this.dataModel = await this.jobHistory.getDataModel();
      await this.getData({ StartIndex: 0, PageSize: this.settingsService.DefaultPageSize });
    } finally {
      setTimeout(() => this.busyService.hide(overlayRef));
    }
  }

  public onSearch(keywords: string): Promise<void> {
    return this.getData({ StartIndex: 0, search: keywords });
  }

  public async getData(navigationState: CollectionLoadParameters): Promise<void> {
    this.navigationState = { ...navigationState, ...{ OrderBy: 'XDateInserted desc' } };

    let overlayRef: OverlayRef;
    setTimeout(() => (overlayRef = this.busyService.show()));
    try {
      const jobPeformances = await this.jobHistory.get(this.navigationState);
      this.dstSettings = {
        displayedColumns: this.displayedColumns,
        dataSource: jobPeformances,
        entitySchema: this.entitySchema,
        navigationState: this.navigationState,
        filters: this.dataModel.Filters,
      };
    } finally {
      setTimeout(() => this.busyService.hide(overlayRef));
    }
  }

  public getDateTimeString(date: string): string {
    return new Date(date).toLocaleString(this.translate.currentLang);
  }

  public async showMessage(event: Event, item: OpsupportQueueJobhistory): Promise<void> {
    event.stopPropagation();
    await this.sidesheet
      .open(ErrorMessageSidesheetComponent, {
        title: await this.translate.get('#LDS#Heading View Message').toPromise(),
        subTitle: item.GetEntity().GetDisplay(),
        padding: '0',
        width: 'max(60%,600px)',
        testId: 'error-message-sidesheet',
        data: item.ErrorMessages.value,
      })
      .afterClosed()
      .toPromise();
  }

  public async viewDetails(job: OpsupportQueueJobhistory): Promise<void> {
    const opts: EuiSidesheetConfig = {
      title: await this.translate.get('#LDS#Heading View Process Details').toPromise(),
      padding: '1em',
      width: 'max(800px,80%)',
      icon: 'reboot',
      data: {
        UID_Tree: job.UID_Tree.value,
        disableRefresh: true,
        load: (startId: string) => {
          return this.jobHistory.get({ filter: [{ ColumnName: 'UID_Tree', Value1: startId }] });
        },
      },
    };
    this.sidesheet.open(SingleFrozenJobComponent, opts);
  }
}
