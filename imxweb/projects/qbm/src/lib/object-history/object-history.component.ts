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
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { EuiLoadingService } from '@elemental-ui/core';
import { TranslateService } from '@ngx-translate/core';

import { UntypedFormControl } from '@angular/forms';
import { HistoryComparisonData } from 'imx-api-qbm';
import { IStateOverviewItem, ObjectHistoryEvent } from 'imx-qbm-dbts';
import { ObjectHistoryParameters, ObjectHistoryService } from './object-history.service';

import { DateAdapter } from '@angular/material/core';
import moment from 'moment-timezone';
import { Subscription } from 'rxjs';
import { TimelineDateTimeFilter } from '../timeline/timeline';

class ViewMode {
  public value: string;
  public display: string;
}

// TODO: One class per file.
// tslint:disable-next-line: max-classes-per-file
@Component({
  selector: 'imx-object-history',
  templateUrl: './object-history.component.html',
  styleUrls: ['./object-history.component.scss'],
})
export class ObjectHistoryComponent implements OnInit, OnDestroy {
  @Input() public looks: string[] = ['timeline', 'table'];
  @Input() public objectType: string;
  @Input() public objectUid: string;
  @Input() public showTitle = true;

  public get viewModeGrid(): string {
    return 'Grid';
  }

  public get viewModeStateOverview(): string {
    return 'State Overview';
  }

  public get viewModeStateComparison(): string {
    return 'State Comparison';
  }

  public get timelineFromString(): string {
    if (this.timelineFrom.date === 'Invalid date' || this.timelineFrom.time === 'Invalid date') return this.timelineFrom.date;
    return this.timelineFrom.date + ' ' + this.timelineFrom.time;
  }

  public get timelineToString(): string {
    if (this.timelineTo.date === 'Invalid date' || this.timelineTo.time === 'Invalid date') return this.timelineTo.date;
    return this.timelineTo.date + ' ' + this.timelineTo.time;
  }

  public lookIcons: string[] = ['attributes', 'table'];
  public selectedLook: string = 'timeline';
  public viewModeValue: string;
  public historyData: ObjectHistoryEvent[] = [];
  public stateOverviewItems: IStateOverviewItem[] = [];
  public historyComparisonData: HistoryComparisonData[] = [];
  public viewModes: ViewMode[] = [];
  public compareDateFormControl = new UntypedFormControl();
  public timelineFromDateFormControl = new UntypedFormControl();
  public timelineFromTimeFormControl = new UntypedFormControl();
  public timelineToDateFormControl = new UntypedFormControl();
  public timelineToTimeFormControl = new UntypedFormControl();
  public timelineFrom: TimelineDateTimeFilter = {
    date: 'Invalid date',
    time: 'Invalid date'
  };
  public timelineTo: TimelineDateTimeFilter = {
    date: 'Invalid date',
    time: 'Invalid date'
  };
  public momentToday = moment();

  private subscriptions: Subscription[] = [];

  constructor(
    private translate: TranslateService,
    private activatedRoute: ActivatedRoute,
    private busyService: EuiLoadingService,
    private historyService: ObjectHistoryService,
    private dateAdapter: DateAdapter<any>
  ) {}

  public async ngOnInit(): Promise<void> {
    this.setLocale(this.translate.currentLang);
    this.setTimeline();

    this.addViewMode(this.viewModeGrid, '#LDS#Events');
    this.addViewMode(this.viewModeStateOverview, '#LDS#State overview');
    this.addViewMode(this.viewModeStateComparison, '#LDS#State comparison');

    this.viewModeValue = this.viewModeGrid;
    this.compareDateFormControl.setValue(new Date(new Date().setHours(23, 59, 59, 999)));
    await this.refresh(true);
  }

  public setLocale(locale: string): void {
    moment.locale(locale);
    this.dateAdapter.setLocale(locale);
  }

  public setTimeline(): void {
    this.subscriptions.push(
      this.timelineFromDateFormControl.valueChanges.subscribe(date => this.timelineFrom.date = moment(date).format('YYYY-MM-DD')),
      this.timelineFromTimeFormControl.valueChanges.subscribe(time => this.timelineFrom.time = moment(time).format('HH:mm:ss')),
      this.timelineToDateFormControl.valueChanges.subscribe(date => this.timelineTo.date = moment(date).format('YYYY-MM-DD')),
      this.timelineToTimeFormControl.valueChanges.subscribe(time => this.timelineTo.time = moment(time).format('HH:mm:ss')),
    );
  }

  public async onViewModeChange(): Promise<void> {
    this.selectedLook = this.viewModeValue === this.viewModeGrid ? 'timeline' : 'table';
    await this.refresh(false);
  }

  public onLookSelectionChanged(event) {
    this.selectedLook = event.value;

    if (this.selectedLook === 'table') {
      this.timelineFromDateFormControl.reset();
      this.timelineFromTimeFormControl.reset();
      this.timelineToDateFormControl.reset();
      this.timelineToTimeFormControl.reset();
    }
  }

  public async refresh(fetchRemote: boolean): Promise<void> {
    let overlayRef: OverlayRef;
    setTimeout(() => (overlayRef = this.busyService.show()));

    try {
      this.historyData = [];
      this.stateOverviewItems = [];
      this.historyComparisonData = [];

      const table = this.objectType || this.activatedRoute.snapshot.paramMap.get('table');
      const uid = this.objectUid || this.activatedRoute.snapshot.paramMap.get('uid');

      if (this.viewModeValue === this.viewModeGrid) {
        const parameters: ObjectHistoryParameters = {
          table,
          uid,
        };
        this.historyData = (await this.historyService.get(parameters, fetchRemote));
      } else if (this.viewModeValue === this.viewModeStateOverview) {
        const stateOverviewItems = await this.historyService.getStateOverviewItems(table, uid);
        if (stateOverviewItems) {
          this.stateOverviewItems = stateOverviewItems;
        }
      } else if (this.viewModeValue === this.viewModeStateComparison) {
        const date = this.compareDateFormControl.value;

        if (date) {
          this.historyComparisonData = await this.historyService.getHistoryComparisonData(table, uid, { CompareDate: date });
        } else {
          this.historyComparisonData = await this.historyService.getHistoryComparisonData(table, uid);
        }
      }
    } catch {
      this.historyData = [];
      this.stateOverviewItems = [];
      this.historyComparisonData = [];
    } finally {
      setTimeout(() => this.busyService.hide(overlayRef));
    }
  }

  private async addViewMode(value: string, displayKey: string): Promise<void> {
    const viewMode = new ViewMode();
    viewMode.value = value;
    viewMode.display = await this.translate.get(displayKey).toPromise();
    this.viewModes.push(viewMode);
  }

  public ngOnDestroy(): void {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }
}
