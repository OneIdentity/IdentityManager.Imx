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
import { ReportsService } from './reports.service';
import { ArcGovernanceTestBed } from '../../test/arc-governance-test-bed';
import { ArcApiService } from '../services/arc-api-client.service';

describe('ReportsService', () => {
  let service: ReportsService;

  const mockArcApiService = {
    typedClient: {
      PortalTargetsystemUnsSystem: {
        Get: jasmine.createSpy('Get').and.stub(),
      },
      PortalTargetsystemUnsContainer: {
        Get: jasmine.createSpy('Get').and.stub(),
      }
    }
  };

  ArcGovernanceTestBed.configureTestingModule({
    imports: [],
    providers: [
      ReportsService,
      {
        provide: ArcApiService,
        useValue: mockArcApiService,
      },
    ],
  });

  beforeEach(() => {
    service = TestBed.inject(ReportsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('authorityData() should call client method with correct parameters', () => {
    mockArcApiService.typedClient.PortalTargetsystemUnsSystem.Get.calls.reset();

    service.authorityData();

    expect(mockArcApiService.typedClient.PortalTargetsystemUnsSystem.Get).toHaveBeenCalledWith({ PageSize: 20, StartIndex: 0, ParentKey: '' });
  });

  it('authorityData(search) should call client method with correct parameters', () => {
    mockArcApiService.typedClient.PortalTargetsystemUnsSystem.Get.calls.reset();

    service.authorityData('test');

    expect(mockArcApiService.typedClient.PortalTargetsystemUnsSystem.Get).toHaveBeenCalledWith({
      PageSize: 20,
      StartIndex: 0,
      ParentKey: '',
      search: 'test',
    });
  });

  it('containerData() should call client method with correct parameters', () => {
    mockArcApiService.typedClient.PortalTargetsystemUnsContainer.Get.calls.reset();

    service.containerData();

    expect(mockArcApiService.typedClient.PortalTargetsystemUnsContainer.Get).toHaveBeenCalledWith({ PageSize: 20, StartIndex: 0, ParentKey: '' });
  });

  it('containerData(search) should call client method with correct parameters', () => {
    mockArcApiService.typedClient.PortalTargetsystemUnsContainer.Get.calls.reset();

    service.containerData('test');

    expect(mockArcApiService.typedClient.PortalTargetsystemUnsContainer.Get).toHaveBeenCalledWith({
      PageSize: 20,
      StartIndex: 0,
      ParentKey: '',
      search: 'test',
    });
  });
});
