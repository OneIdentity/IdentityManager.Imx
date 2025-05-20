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

// eslint-disable-next-line max-classes-per-file
import { Component, ErrorHandler, Input, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { EuiLoadingService, EuiSelectOption } from '@elemental-ui/core';
import { TranslateService } from '@ngx-translate/core';

import { FormControl, UntypedFormControl, Validators } from '@angular/forms';
import { HistoryComparisonData } from '@imx-modules/imx-api-qbm';
import { IStateOverviewItem, ObjectHistoryEvent } from '@imx-modules/imx-qbm-dbts';
import { ObjectHistoryParameters, ObjectHistoryService } from './object-history.service';

import { DateAdapter } from '@angular/material/core';
import moment, { Moment } from 'moment-timezone';
import { Subscription } from 'rxjs';
import { ExtendedObjectHistoryEvent, TimelineDateTimeFilter } from '../timeline/timeline';
import { EventChangeType, EventChangeTypes, HistoryEventChangeType } from '../timeline/timeline.model';

// TODO: One class per file.
// eslint-disable-next-line max-classes-per-file
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

  public get timelineToDateMoment(): moment.Moment {
    return this.timelineTo.date !== 'Invalid date' ? moment(this.timelineTo.date) : this.momentToday;
  }

  public lookIcons: string[] = ['attributes', 'table'];
  public selectedLook: string = 'timeline';
  public viewModeValue: string;
  public historyData: ExtendedObjectHistoryEvent[] = [];
  public filteredHistoryData: ExtendedObjectHistoryEvent[] = [];
  public stateOverviewItems: IStateOverviewItem[] = [];
  public historyComparisonData: HistoryComparisonData[] = [];
  public viewModes: EuiSelectOption[] = [];
  public momentToday = moment();
  public compareDateFormControl = new UntypedFormControl(new Date(new Date().setHours(23, 59, 59, 999)), {
    nonNullable: true,
    validators: Validators.required,
  });
  public timelineFromDateFormControl: FormControl<Moment> = new FormControl();
  public timelineFromTimeFormControl: FormControl<Moment> = new FormControl();
  public timelineToDateFormControl: FormControl<Moment> = new FormControl();
  public timelineToTimeFormControl: FormControl<Moment> = new FormControl();
  public timelineFrom: TimelineDateTimeFilter = {
    date: 'Invalid date',
    time: 'Invalid date',
  };
  public timelineTo: TimelineDateTimeFilter = {
    date: 'Invalid date',
    time: 'Invalid date',
  };
  public viewModeControl: FormControl<string> = new FormControl(this.viewModeGrid, { nonNullable: true });
  public eventChangeTypes = EventChangeTypes;
  public selectedEventChangeTypes: EventChangeType[] = [];

  private subscriptions: Subscription[] = [];

  constructor(
    private translate: TranslateService,
    private activatedRoute: ActivatedRoute,
    private busyService: EuiLoadingService,
    private historyService: ObjectHistoryService,
    private dateAdapter: DateAdapter<any>,
    private readonly errorHandler: ErrorHandler,
  ) {}

  public async ngOnInit(): Promise<void> {
    this.setLocale(this.translate.currentLang);
    this.setTimeline();

    this.addViewMode(this.viewModeGrid, '#LDS#Events');
    this.addViewMode(this.viewModeStateOverview, '#LDS#State overview');
    this.addViewMode(this.viewModeStateComparison, '#LDS#State comparison');

    this.viewModeValue = this.viewModeGrid;
    await this.refresh(true);
  }

  public ngOnDestroy(): void {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }

  public setLocale(locale: string): void {
    moment.locale(locale);
    this.dateAdapter.setLocale(locale);
  }

  public setTimeline(): void {
    this.subscriptions.push(
      this.timelineFromDateFormControl.valueChanges.subscribe((date) => {
        this.timelineFrom.date = moment(date).format('YYYY-MM-DD');
        this.timelineFromTimeFormControl.setValue(date || moment().startOf('day'));
      }),
      this.timelineFromTimeFormControl.valueChanges.subscribe((time) => {
        this.timelineFrom.time = moment(time).format('HH:mm:ss');
        this.getFilteredHistoryData();
      }),
      this.timelineToDateFormControl.valueChanges.subscribe((date) => {
        this.timelineTo.date = moment(date).format('YYYY-MM-DD');
        this.timelineToTimeFormControl.setValue(date || moment().startOf('day'));
      }),
      this.timelineToTimeFormControl.valueChanges.subscribe((time) => {
        this.timelineTo.time = moment(time).format('HH:mm:ss');
        this.getFilteredHistoryData();
      }),
    );
  }

  private getFilteredHistoryData() {
    if (this.historyData && this.viewModeValue === this.viewModeGrid) this.filteredHistoryData = this.filterByTime(this.historyData);
  }

  public async onViewModeChange(): Promise<void> {
    this.selectedLook = this.viewModeValue === this.viewModeGrid ? 'timeline' : 'table';
    this.resetTimelineForm();
    await this.refresh(false);
  }

  public onLookSelectionChanged(event) {
    this.selectedLook = event.value;
  }

  public async refresh(fetchRemote: boolean): Promise<void> {
    if (this.busyService.overlayRefs.length === 0) {
      this.busyService.show();
    }

    try {
      this.historyData = [];
      this.stateOverviewItems = [];
      this.historyComparisonData = [];

      const table = (this.objectType || this.activatedRoute.snapshot.paramMap.get('table')) ?? '';
      const uid = (this.objectUid || this.activatedRoute.snapshot.paramMap.get('uid')) ?? '';

      if (this.viewModeValue === this.viewModeGrid) {
        const parameters: ObjectHistoryParameters = {
          table,
          uid,
        };
        const fetched = await this.historyService.get(parameters, fetchRemote);
        this.historyData = fetched.map((elem) => ({ ...elem, Time: '00:00:00' }));
        this.getFilteredHistoryData();
      } else if (this.viewModeValue === this.viewModeStateOverview) {
        const stateOverviewItems = await this.historyService.getStateOverviewItems(table, uid);
        if (stateOverviewItems) {
          this.stateOverviewItems = stateOverviewItems;
        }
      } else if (this.viewModeValue === this.viewModeStateComparison) {
        const date = this.compareDateFormControl.value;

        if (date) {
          this.historyComparisonData = await this.historyService.getHistoryComparisonData(table, uid, { CompareDate: date });
        }
      }
    } catch (error) {
      this.historyData = [];
      this.stateOverviewItems = [];
      this.historyComparisonData = [];
      this.errorHandler.handleError(error);
    } finally {
      this.busyService.hide();
    }
  }

  /**
   * Updates the selected change types and call getFilterHistoryData() function on user checkbox change event.
   * @param type Type of event change type.
   */
  public onFilterTypeChanged(type: EventChangeType): void {
    if (this.selectedEventChangeTypes.indexOf(type) === -1) {
      this.selectedEventChangeTypes.push(type);
    } else {
      this.selectedEventChangeTypes = this.selectedEventChangeTypes.filter((selectedType) => selectedType !== type);
    }
    this.getFilteredHistoryData();
  }

  /**
   * Checks the event change type is selected or not.
   */
  public getFilterTypeValue(type: EventChangeType): boolean {
    return this.selectedEventChangeTypes.indexOf(type) > -1;
  }

  private async addViewMode(value: string, displayKey: string): Promise<void> {
    this.viewModes.push({ display: this.translate.instant(displayKey), value });
  }

  private resetTimelineForm(): void {
    this.timelineFromDateFormControl.reset();
    this.timelineFromTimeFormControl.reset();
    this.timelineToDateFormControl.reset();
    this.timelineToTimeFormControl.reset();
  }

  /**
   * Handles from and to filtering and loads the result after filtering
   */
  private filterByTime(data: ObjectHistoryEvent[]): ExtendedObjectHistoryEvent[] {
    if (this.timelineFromString === 'Invalid date' && this.timelineToString === 'Invalid date') {
      return this.filterByType(data).map((elem) => ({ ...elem, Time: '00:00:00' }));
    }
    const isFromValid = this.timelineFromString !== 'Invalid date';
    const isToValid = this.timelineToString !== 'Invalid date';
    return this.filterByType(data)
      .filter((elem) => {
        const momentElemTime = moment(elem.ChangeTime);
        const fromValidation = momentElemTime.isAfter(moment(this.timelineFromString), 'second');
        const toValidation = momentElemTime.isBefore(moment(this.timelineToString), 'second');
        if (isFromValid && !isToValid) return fromValidation;
        if (!isFromValid && isToValid) return toValidation;
        return fromValidation && toValidation;
      })
      .map((elem) => ({ ...elem, Time: '00:00:00' }));
  }

  /**
   * Handles filtering events by change type.
   */
  private filterByType(data: ObjectHistoryEvent[]): ObjectHistoryEvent[] {
    return data.filter((elem) => {
      if (!!this.selectedEventChangeTypes.length) {
        return this.selectedEventChangeTypes.indexOf(HistoryEventChangeType[elem.ChangeTypeId || '']) > -1;
      } else {
        return true;
      }
    });
  }
}
