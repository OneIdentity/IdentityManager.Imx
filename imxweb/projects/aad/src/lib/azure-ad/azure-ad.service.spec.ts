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
import { EuiLoadingService } from '@elemental-ui/core';
import { AadCommonTestData } from '../../test/aad-common-test-mocks';
import { AadTestBed } from '../../test/aad-test-bed';
import { ApiService } from '../api.service';
import { AzureAdService } from './azure-ad.service';

describe('AzureAdServiceService', () => {
  let service: AzureAdService;

  const mockAadApiService = {
    typedClient: {
      PortalTargetsystemAaduserSubsku: {
        Get: jasmine.createSpy('Get').and.returnValue(Promise.resolve({ Data: [{}]})),
        GetSchema: jasmine.createSpy('GetSchema').and.returnValue(AadCommonTestData.aadUserSchema)
      },
      PortalTargetsystemAaduserDeniedserviceplans: {
        Get: jasmine.createSpy('Get').and.returnValue(Promise.resolve({ Data: [{}]})),
        GetSchema: jasmine.createSpy('GetSchema').and.returnValue(AadCommonTestData.aadUserDeniedPlansSchema)
      },
      PortalTargetsystemAadgroupSubsku: {
        Get: jasmine.createSpy('Get').and.returnValue(Promise.resolve({ Data: [{}]})),
        GetSchema: jasmine.createSpy('GetSchema').and.returnValue(AadCommonTestData.aadGroupSubSchema)
      },
      PortalTargetsystemAadgroupDeniedserviceplans: {
        Get: jasmine.createSpy('Get').and.returnValue(Promise.resolve({ Data: [{}]})),
        GetSchema: jasmine.createSpy('GetSchema').and.returnValue(AadCommonTestData.aadGroupDeniedPlansSchema)
      },
    }
  };

  const mockBusyService = { show: jasmine.createSpy('show'), hide: jasmine.createSpy('hide') };

  AadTestBed.configureTestingModule({
    providers: [
      {
        provide: ApiService,
        useValue: mockAadApiService
      },
      {
        provide: EuiLoadingService,
        useValue: mockBusyService
      }
    ]
  });

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AzureAdService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
