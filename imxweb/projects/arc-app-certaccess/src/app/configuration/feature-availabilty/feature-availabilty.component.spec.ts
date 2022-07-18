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
import { ArcGovernanceTestBed } from 'projects/arc-app-certaccess/src/test/arc-governance-test-bed';
import { FeatureAvailabiltyComponent } from './feature-availabilty.component';
import { FeatureAvailabilityCommonMocks } from './test/feature-availability-mocks';
import { HELPER_ALERT_KEY_PREFIX, StorageService } from 'qbm';
import { EuiLoadingService } from '@elemental-ui/core';
import { FeatureAvailabilityService } from './feature-availability.service';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('FeatureAvailabiltyComponent', () => {
  let component: FeatureAvailabiltyComponent;
  let fixture: ComponentFixture<FeatureAvailabiltyComponent>;

  ArcGovernanceTestBed.configureTestingModule({
    declarations: [ FeatureAvailabiltyComponent ],
    imports: [ NoopAnimationsModule ],
    providers: [
      {
        provide: StorageService,
        useValue: FeatureAvailabilityCommonMocks.mockStorageService
      },
      {
        provide: EuiLoadingService,
        useValue: FeatureAvailabilityCommonMocks.mockBusyService
      },
      {
        provide: FeatureAvailabilityService,
        useValue: FeatureAvailabilityCommonMocks.mockFeatureAvailabilityService
      }
    ]
  });


  beforeEach(() => {
    fixture = TestBed.createComponent(FeatureAvailabiltyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('setupForm() tests', () => {
    it('should correctly setup the form based on the featureSettings', async () => {
      component.setupForm();
      expect(component.formArray.controls.length).toEqual(2);
      expect(component.formArray.controls[0].value).toEqual(false);
      expect(component.formArray.controls[0].value).toEqual(false);
    });
  });

  describe('save() tests', () => {
    it('should call updateFeatureSettings for each value that was changed on the form', async () => {
      component.setupForm();
      component.formArray.controls.forEach((ctrl) => {
        ctrl.markAsDirty();
        ctrl.setValue(true);
      });
      await component.save();
      expect(FeatureAvailabilityCommonMocks.mockFeatureAvailabilityService.updateFeatureSettings)
      .toHaveBeenCalledWith(FeatureAvailabilityCommonMocks.expectedFeatureSettingUpdateData)

    });
  });

  describe('getFeatureDisplayName() tests', () => {
    it('should return an empty string when there is no match', () => {
      const result = component.getFeatureDisplayName('A test string with no match');
      expect(result).toEqual('');

    });
    it('should return the value between the "//" characters as a display name', () => {
    const result = component.getFeatureDisplayName('QER\\Attestation\\DisplayInSIM');
    expect(result).toEqual('Attestation');
    });
  });

  describe('onHelperDismissed() tests', () => {
    it('should make a call to store the dismissal of the helper alert', () => {
      FeatureAvailabilityCommonMocks.mockStorageService.storeHelperAlertDismissal.calls.reset();

      expect(component.showHelperAlert).toEqual(true);
      component.onHelperDismissed();
      const expectedHelperKey = `${HELPER_ALERT_KEY_PREFIX}_featureAvailability`;
      expect(FeatureAvailabilityCommonMocks.mockStorageService.storeHelperAlertDismissal).toHaveBeenCalledWith(expectedHelperKey);
      expect(component.showHelperAlert).toEqual(false);
    });
  });
});
