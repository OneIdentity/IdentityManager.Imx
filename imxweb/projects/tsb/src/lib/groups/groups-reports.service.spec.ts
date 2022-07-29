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
import { GroupsReportsService } from './groups-reports.service';
import { TsbTestBed } from './../test/tsb-test-bed.spec';
import { TsbApiService } from '../tsb-api-client.service';

describe('GroupssReportsService', () => {
  let service: GroupsReportsService;

  const mockTsbApiService = {
    typedClient: {
      PortalTargetsystemUnsGroup: {
        Get: jasmine.createSpy('Get').and.stub(),
      }
    }
  };

  TsbTestBed.configureTestingModule({
    imports: [],
    providers: [
      GroupsReportsService,
      {
        provide: TsbApiService,
        useValue: mockTsbApiService,
      },
    ],
  });

  beforeEach(() => {
    service = TestBed.inject(GroupsReportsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('groupsByGroupReport() should return report API URL', () => {
    const getReportUrl = spyOn(<any>service, 'getReportUrl').and.stub();

    service.groupsByGroupReport(30, 'test');

    expect(getReportUrl).toHaveBeenCalledWith('targetsystem/uns/group/test/report?historydays=30');
  });

  it('groupsByRootReport() should return report API URL', () => {
    const getReportUrl = spyOn(<any>service, 'getReportUrl').and.stub();

    service.groupsByRootReport(30, 'test');

    expect(getReportUrl).toHaveBeenCalledWith('targetsystem/uns/root/test/groups/report?historydays=30');
  });

  it('groupsByContainerReport() should return report API URL', () => {
    const getReportUrl = spyOn(<any>service, 'getReportUrl').and.stub();

    service.groupsByContainerReport(30, 'test');

    expect(getReportUrl).toHaveBeenCalledWith('targetsystem/uns/container/test/groups/report?historydays=30');
  });

  it('groupsOwnedByPersonReport() should return report API URL', () => {
    const getReportUrl = spyOn(<any>service, 'getReportUrl').and.stub();

    service.groupsOwnedByPersonReport(30, 'test');

    expect(getReportUrl).toHaveBeenCalledWith('targetsystem/uns/ownedby/test/report?historydays=30');
  });

  it('groupData() should call client method with correct parameters', () => {
    mockTsbApiService.typedClient.PortalTargetsystemUnsGroup.Get.calls.reset();

    service.groupData();

    expect(mockTsbApiService.typedClient.PortalTargetsystemUnsGroup.Get).toHaveBeenCalledWith({ PageSize: 20, StartIndex: 0 });
  });

  it('groupData(search) should call client method with correct parameters', () => {
    mockTsbApiService.typedClient.PortalTargetsystemUnsGroup.Get.calls.reset();

    service.groupData('test');

    expect(mockTsbApiService.typedClient.PortalTargetsystemUnsGroup.Get).toHaveBeenCalledWith({
      PageSize: 20,
      StartIndex: 0,
      search: 'test',
    });
  });
});
