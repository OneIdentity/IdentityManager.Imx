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
 * Copyright 2021 One Identity LLC.
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
import { OverlayRef } from '@angular/cdk/overlay';
import { TranslateService } from '@ngx-translate/core';
import { EuiLoadingService } from '@elemental-ui/core';

import { LdsReplacePipe } from 'qbm';
import { FilterData, FilterType, CompareOperator } from 'imx-qbm-dbts';
import { FilterTileComponent, TextContainer } from 'qbm';
import { SyncService } from '../../sync/sync.service';
import { OpsupportQueueJobsParameters, QueueJobsService } from './queue-jobs.service';
import { FilterDescription } from './FilterDescription';

@Component({
  templateUrl: './jobs.component.html',
  styleUrls: ['./jobs.component.scss']
})
export class JobsComponent implements OnInit {
  public parameterForGrid: OpsupportQueueJobsParameters;
  public numberOfJobs = 0;

  public selectedFilter = '';
  public filters: FilterDescription[];

  private lastChecked: FilterTileComponent;

  constructor(
    private busyService: EuiLoadingService,
    private syncShellService: SyncService,
    private jobService: QueueJobsService,
    private activeRoute: ActivatedRoute,
    private translationProvider: TranslateService,
    private ldsPipe: LdsReplacePipe
  ) { }

  public async ngOnInit(): Promise<void> {
    this.initFilters();
    const filter = this.activeRoute.snapshot.queryParamMap.get('filter');
    if (filter) {
      const filterdata: FilterData[] = JSON.parse(filter);
      if (filterdata) {
        this.selectedFilter = 'true';
        this.update({ frozen: true, filter: filterdata });
      }
    } else {
      this.update({ frozen: false });
    }

    let overlayRef: OverlayRef;
    setTimeout(() => overlayRef = this.busyService.show());
    try {
      this.numberOfJobs = (await this.jobService.Get(
        {
          ...this.parameterForGrid,
          ...{ PageSize: -1 }
        })).totalCount;
    } finally {
      setTimeout(() => this.busyService.hide(overlayRef));
    }
  }

  public handleCheckClick(filterTile: FilterTileComponent): void {
    if (this.lastChecked) {
      this.lastChecked.isChecked = false;
    } // den letzen Filter entfernen

    this.lastChecked = filterTile.isChecked ? filterTile : undefined; // wenn der Filter deaktiviert wurde, ist der letzte wieder leer
    this.selectedFilter = this.lastChecked ? this.lastChecked.value : '';

    if (filterTile.groupName !== 'synchFilter') {
      // Fall abhandeln, dass wir keinen sync- Filter haben (sondern 24hours)
      this.update({
        frozen: filterTile.isChecked,
        filter: filterTile.isChecked
          ? [
            {
              ColumnName: 'StartAt',
              Type: FilterType.Compare,
              CompareOp: CompareOperator.GreaterOrEqual,
              Value1: new Date(Date.now() - 24 * 60 * 60 * 1000)
            }
          ]
          : []
      });
    } else {
      this.update({
        frozen: filterTile.isChecked,
        dprshell: this.lastChecked ? this.lastChecked.value : ''
      });
    }
  }

  public async refresh(): Promise<void> {
    await this.initFilters();
    this.update(this.parameterForGrid);
  }

  private async initFilters(): Promise<void> {
    this.filters = [];

    let overlayRef: OverlayRef;
    setTimeout(() => overlayRef = this.busyService.show());
    try {
      await this.addFilter({ key: '#LDS#All jobs frozen in the past {0} hours', parameters: [24] }, 'true');
      const syncShellFilters = (await this.syncShellService.getSyncShell({ withfrozenjobs: true })).Data;
      if (syncShellFilters) {
        for (const syncShell of syncShellFilters) {
          await this.addFilter(
            { key: '#LDS#Frozen processes in "{0}"', parameters: [syncShell.DisplayName.value] },
            syncShell.UID_DPRShell.value,
            'synchFilter'
          );
        }
      }
    } finally {
      setTimeout(() => this.busyService.hide(overlayRef));
    }
  }

  private async addFilter(caption: TextContainer, value: string, groupname?: string): Promise<void> {
    const filter = new FilterDescription();
    filter.caption = this.ldsPipe.transform(await this.translationProvider.get(caption.key).toPromise(), caption.parameters);
    filter.value = value;
    filter.groupname = groupname;
    this.filters.push(filter);
  }

  private update(parameters?: OpsupportQueueJobsParameters): void {
    if (parameters) {
      if (parameters.filter == null) {
        parameters.filter = [];
      }
      if (parameters.filter.every(item => item.ColumnName !== 'IsRootJob')) {
        parameters.filter.push({
          ColumnName: 'IsRootJob',
          Type: FilterType.Compare,
          CompareOp: CompareOperator.Equal,
          Value1: true
        });
      }

    }
    this.parameterForGrid = { ...parameters };
  }
}
