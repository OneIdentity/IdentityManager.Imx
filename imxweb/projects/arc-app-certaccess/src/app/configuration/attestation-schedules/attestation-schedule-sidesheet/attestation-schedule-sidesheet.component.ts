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
import { FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { DateAdapter } from '@angular/material/core';
import { EuiSelectOption, EuiSidesheetService, EUI_SIDESHEET_DATA } from '@elemental-ui/core';
import moment from 'moment-timezone';

import { PortalAttestationSchedules } from 'imx-api-arc';
import {
  BaseCdr,
  ClassloggerService,
  ColumnDependentReference,
  HELPER_ALERT_KEY_PREFIX,
  ImxTranslationProviderService,
  StorageService,
  TabControlHelper
} from 'qbm';
import { ACTION_DISMISS, RequestsService } from '../../requests.service';
import { weeklyFrequencyOptions } from '../attestation-schedules.models';

const helperAlertKey = `${HELPER_ALERT_KEY_PREFIX}_attestationScheduleDetails`;

@Component({
  selector: 'imx-attestation-schedule-sidesheet',
  templateUrl: './attestation-schedule-sidesheet.component.html',
  styleUrls: ['./attestation-schedule-sidesheet.component.scss'],
})
export class AttestationScheduleSidesheetComponent implements OnInit {

  public readonly detailsFormGroup: FormGroup;
  public cdrList: ColumnDependentReference[] = [];
  public startTimeControl = new FormControl();
  public frequencySubTypeControl = new FormControl();
  public freqDayOfYear = new FormControl();
  public frequencySelectOptions: EuiSelectOption[] = [];
  public showInfoIcon = false;

  constructor(
    formBuilder: FormBuilder,
    public requestsService: RequestsService,
    @Inject(EUI_SIDESHEET_DATA) public data: PortalAttestationSchedules,
    private readonly storageService: StorageService,
    private readonly logger: ClassloggerService,
    private readonly sidesheet: EuiSidesheetService,
    dateAdapter: DateAdapter<any>,
    translate: ImxTranslationProviderService
  ) {
    this.detailsFormGroup = new FormGroup({ formArray: formBuilder.array([]) });
    dateAdapter.setLocale(translate.Culture);
    moment.locale(translate.Culture);
  }

  get showHelperAlert(): boolean {
    return !this.storageService.isHelperAlertDismissed(helperAlertKey);
  }

  get formArray(): FormArray {
    return this.detailsFormGroup.get('formArray') as FormArray;
  }

  public async ngOnInit(): Promise<void> {
    this.setup();

    this.freqDayOfYear.valueChanges.subscribe(() => {
      const dateObj = this.freqDayOfYear.value;
      let month = dateObj.getUTCMonth() + 1; // months from 1-12
      if (month?.toString()?.length === 1) {
        month = `0${month}`;
      }
      let day = dateObj.getDate();
      if (day?.toString()?.length === 1) {
        day = `0${day}`;
      }
      const newFormat = `${month}${day}`;
      this.data.DayOfYear.value = newFormat;
    });
  }


  public cancel(): void {
    this.sidesheet.close();
  }

  public async saveSchedule(): Promise<void> {
    if (this.detailsFormGroup.valid) {
      this.requestsService.handleOpenLoader();
      this.logger.debug(this, `Saving schedule changes`);
      try {
        await this.data.GetEntity().Commit(true);
        this.requestsService.openSnackbar('#LDS#Your changes have been successfully saved.', ACTION_DISMISS);
      } finally {
        this.requestsService.handleCloseLoader();
      }
    }
  }

  public onHelperDismissed(): void {
    this.storageService.storeHelperAlertDismissal(helperAlertKey);
  }

  public timeChanged(value: moment.Moment): void {
    const time = value.format('HH:mm');
    this.startTimeControl.markAsDirty();
    this.data.StartTime.value = time;
    this.showInfoIcon = false;
  }

  public frequencySelected(selected?: EuiSelectOption): void {
    if (selected && selected.value) {
      this.data.FrequencySubType.value = selected.value;
    }
  }

  private async setup(): Promise<void> {
    /**
     * Resolve an issue where the mat-tab navigation arrows could appear on first load
     */
    setTimeout(() => {
      TabControlHelper.triggerResizeEvent();
    });

    this.cdrList = [
      new BaseCdr(this.data.UID_DialogTimeZone.Column)
    ];

    this.setupFrequencyOptions();
    this.mapTimeToControls();
    this.mapDateToControl();

    this.frequencySubTypeControl.setValue(this.data?.FrequencySubType?.value);
    this.formArray.push(this.startTimeControl);
    this.formArray.push(this.frequencySubTypeControl);
  }

  private setupFrequencyOptions(): void {
    this.frequencySelectOptions = [];
    const key = this.data.FrequencyType.value;
    if (key === 'Week') {
      this.frequencySelectOptions = weeklyFrequencyOptions;
    } else {
      for (let index = 1; index < 32; index++) {
        const value = index.toString();
        this.frequencySelectOptions.push({ display: value, value });
      }
    }
  }

  private mapTimeToControls(): void {
    const hourPart = this.data.StartTime.value.split(':').shift();
    const minPart = this.data.StartTime.value.split(':').pop();
    // Time with these values are not set
    if (hourPart !== 'LB' && minPart !== 'ST') {
      // Only initialise timeControl if there is an actual value set
      // TODO: Reactive - hour(), minute() do not accept strings
      // const time = moment().hour(hourPart).minute(minPart).second(0).milliseconds(0);
      // this.startTimeControl.setValue(time);
    }
    else {
      this.showInfoIcon = true;
    }
  }

  private mapDateToControl(): void {
    if (this.data.DayOfYear?.value) {
      const month = parseInt(this.data.DayOfYear.value.substr(0, 2), 10);
      const day = parseInt(this.data.DayOfYear.value.substr(2, 2), 10);
      const year = (new Date()).getUTCFullYear();
      const date = new Date(year, (month - 1), day);
      this.freqDayOfYear.setValue(date);
      this.formArray.push(this.freqDayOfYear);
    }
  }
}
