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

import { TestBed } from '@angular/core/testing';
import { ArcGovernanceTestBed } from '../../../test/arc-governance-test-bed';
import { ArcApiService } from '../../services/arc-api-client.service';
import { FeatureAvailabilityService } from './feature-availability.service';
import { FeatureAvailabilityCommonMocks } from './test/feature-availability-mocks';

describe('FeatureAvailabilityService', () => {
  let service: FeatureAvailabilityService;

  const mockArcApiService = {
    client: {
      portal_config_certaccess_get: jasmine.createSpy('portal_config_certaccess_get')
      .and.returnValue(Promise.resolve(FeatureAvailabilityCommonMocks.mockFeatureSettings)),
      portal_config_certaccess_post: jasmine.createSpy('portal_config_certaccess_post')
      .and.returnValue(Promise.resolve(FeatureAvailabilityCommonMocks.mockUpdatedFeatureSettings)),
    }
  }

  ArcGovernanceTestBed.configureTestingModule({
    providers: [
      FeatureAvailabilityService,
      {
        provide: ArcApiService,
        useValue: mockArcApiService
      }
    ]
  });

  beforeEach(() => {
    service = TestBed.inject(FeatureAvailabilityService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getFeatureSettings() tests', () => {
    it('should store and return the featureSettings', async () => {
      const result = await service.getFeatureSettings();
      expect(result).toEqual(FeatureAvailabilityCommonMocks.mockFeatureSettings);
      expect(service.featureSettings).toEqual(FeatureAvailabilityCommonMocks.mockFeatureSettings);
    });
  });

  describe('updateFeatureSettings() tests', () => {
    it('should store and return the featureSettings', async () => {
      const result = await service.updateFeatureSettings(FeatureAvailabilityCommonMocks.expectedFeatureSettingUpdateData);
      expect(result).toEqual(FeatureAvailabilityCommonMocks.mockUpdatedFeatureSettings);
      expect(service.featureSettings).toEqual(FeatureAvailabilityCommonMocks.mockUpdatedFeatureSettings);
    });
  });
});
