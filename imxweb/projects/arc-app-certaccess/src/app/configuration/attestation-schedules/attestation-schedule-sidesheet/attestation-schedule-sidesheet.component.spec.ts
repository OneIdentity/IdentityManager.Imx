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

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { EUI_SIDESHEET_DATA } from '@elemental-ui/core';
import { HELPER_ALERT_KEY_PREFIX, StorageService } from 'qbm';
import { RequestsService } from '../../requests.service';
import { RequestsConfigurationCommonMocks } from '../../test/requests-configuration-mocks';
import { RequestsConfigurationTestBed } from '../../test/requests-configuration-test-bed';
import { weeklyFrequencyOptions } from '../attestation-schedules.models';
import { AttestationScheduleSidesheetComponent } from './attestation-schedule-sidesheet.component';
import moment from 'moment-timezone';

describe('AttestationScheduleSidesheetComponent', () => {
  let component: AttestationScheduleSidesheetComponent;
  let fixture: ComponentFixture<AttestationScheduleSidesheetComponent>;

  let sidesheetCloseSpy: jasmine.Spy;

  RequestsConfigurationTestBed.configureTestingModule({
    declarations: [ AttestationScheduleSidesheetComponent ],
    imports: [ NoopAnimationsModule ],
    providers: [
      {
        provide: RequestsService,
        useValue: RequestsConfigurationCommonMocks.mockRequestsService
      },
      {
        provide: StorageService,
        useValue: RequestsConfigurationCommonMocks.mockStorageService
      },
      {
        provide: EUI_SIDESHEET_DATA,
        useValue: RequestsConfigurationCommonMocks.mockAttSchedule,
      },
    ]
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AttestationScheduleSidesheetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    sidesheetCloseSpy = spyOn<any>(component['sidesheet'], 'close');
    sidesheetCloseSpy.calls.reset();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('cancel() tests', () => {
    it('should make a call to close the sidesheet', () => {
      component.cancel();
      expect(sidesheetCloseSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('saveSchedule() tests', () => {
    let entityCommitSpy: jasmine.Spy;
    beforeEach(() => {
      entityCommitSpy = spyOn(component.data.GetEntity(), 'Commit');
    });
    it('should call `.commit()` on the entity', async () => {
      await component.saveSchedule();
      expect(entityCommitSpy).toHaveBeenCalled();
      expect(RequestsConfigurationCommonMocks.mockRequestsService.openSnackbar).toHaveBeenCalled();
    });
  });

  describe('onHelperDismissed() tests', () => {
    it('should make a call to store the dismissal of the helper alert for attestationScheduleDetails', () => {
      RequestsConfigurationCommonMocks.mockStorageService.storeHelperAlertDismissal.calls.reset();
      component.onHelperDismissed();
      const expectedHelperKey = `${HELPER_ALERT_KEY_PREFIX}_attestationScheduleDetails`;
      expect(RequestsConfigurationCommonMocks.mockStorageService.storeHelperAlertDismissal).toHaveBeenCalledWith(expectedHelperKey);
    });
  });

  describe('timeChanged() tests', () => {
    it('should set the selected time on the StartTime property in the correct format', () => {
      const time = moment().hour(7).minute(15).second(0).milliseconds(0);
      component.timeChanged(time);
      expect(component.data.StartTime.value).toEqual('07:15');
    });
  });

  describe('frequencySelected() tests', () => {
    it('should set the selected frequency on the FrequencySubType property', () => {
      component.frequencySelected({ display: '4', value: '4'});
      expect(component.data.FrequencySubType.value).toEqual('4');
    });
  });

  describe('setupFrequencyOptions() tests', () => {
    afterAll(() => {
      component.data = RequestsConfigurationCommonMocks.mockAttSchedule;
    });
    it('should set the select frequency options to the days of the week when the frequency type is week', () => {
      component.data = RequestsConfigurationCommonMocks.mockAttScheduleTypeWeek;
      component['setupFrequencyOptions']();
      expect(component.frequencySelectOptions).toEqual(weeklyFrequencyOptions);
    });
    it(`should generate and set the select frequency options
    up to 31 for the days of the month, when the frequency type is month`, () => {
      component.data = RequestsConfigurationCommonMocks.mockAttScheduleTypeMonth;
      component['setupFrequencyOptions']();
      expect(component.frequencySelectOptions).toEqual(RequestsConfigurationCommonMocks.expectedMonthFrequencySelectOptions);
    });
  });

  describe('mapTimeToControls() tests', () => {
    xit('should parse the value of the StartTime property and map it to the hour and minute form control value', () => {
      component.data.StartTime.value = '06:45'
      const expectedTime = moment().hour(6).minute(45).second(0).milliseconds(0);
      component['mapTimeToControls']();
      expect(component.startTimeControl.value).toEqual(expectedTime);
    });
    it(`should parse the value of the StartTime property and not initialise the form control value
    when the StartTime has the default value of 'LB:ST'`, () => {
      component.data.StartTime.value = 'LB:ST'
      component['mapTimeToControls']();
      expect(component.startTimeControl.value).toEqual(null);
    });
  });

  describe('mapDateToControl() tests', () => {
    it(`should parse the value of the DayOfYear property and map it to the relevant date (with current year)
    and set that as the value of the freqDayOfYear control`, () => {
      const expectedDate = new Date((new Date()).getUTCFullYear(), 11, 7);
      component.data.DayOfYear.value = '1207'
      component['mapDateToControl']();
      expect(component.freqDayOfYear.value).toEqual(expectedDate);
    });
  });
});
