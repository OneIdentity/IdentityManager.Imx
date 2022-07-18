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
import { AccountsReportsService } from './accounts-reports.service';
import { TsbTestBed } from '../test/tsb-test-bed.spec';
import { TsbApiService } from '../tsb-api-client.service';

describe('AccountsReportsService', () => {
  let service: AccountsReportsService;

  const mockTsbApiService = {
    typedClient: {
      PortalTargetsystemUnsAccount: {
        Get: jasmine.createSpy('Get').and.stub(),
      }
    }
  };

  TsbTestBed.configureTestingModule({
    imports: [],
    providers: [
      AccountsReportsService,
      {
        provide: TsbApiService,
        useValue: mockTsbApiService,
      },
    ],
  });

  beforeEach(() => {
    service = TestBed.inject(AccountsReportsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('accountsReport() should return report API URL', () => {
    const getReportUrl = spyOn(<any>service, 'getReportUrl').and.stub();

    service.accountsReport(30, 'test', 'accountstable');

    expect(getReportUrl).toHaveBeenCalledWith('targetsystem/uns/account/accountstable/test/report?historydays=30');
  });

  it('accountsOwnedByPersonReport() should return report API URL', () => {
    const getReportUrl = spyOn(<any>service, 'getReportUrl').and.stub();

    service.accountsOwnedByPersonReport(30, 'test');

    expect(getReportUrl).toHaveBeenCalledWith('targetsystem/uns/account/ownedby/test/report?historydays=30');
  });

  it('accountsOwnedByManagedReport() should return report API URL', () => {
    const getReportUrl = spyOn(<any>service, 'getReportUrl').and.stub();

    service.accountsOwnedByManagedReport(30, 'test');

    expect(getReportUrl).toHaveBeenCalledWith('targetsystem/uns/account/ownedbymanaged/test/report?historydays=30');
  });

  it('accountsByRootReport() should return report API URL', () => {
    const getReportUrl = spyOn(<any>service, 'getReportUrl').and.stub();

    service.accountsByRootReport(30, 'test');

    expect(getReportUrl).toHaveBeenCalledWith('targetsystem/uns/root/test/accounts/report?historydays=30');
  });

  it('accountsByContainerReport() should return report API URL', () => {
    const getReportUrl = spyOn(<any>service, 'getReportUrl').and.stub();

    service.accountsByContainerReport(30, 'test');

    expect(getReportUrl).toHaveBeenCalledWith('targetsystem/uns/container/test/accounts/report?historydays=30');
  });

  it('accountData() should call client method with correct parameters', () => {
    mockTsbApiService.typedClient.PortalTargetsystemUnsAccount.Get.calls.reset();

    service.accountData();

    expect(mockTsbApiService.typedClient.PortalTargetsystemUnsAccount.Get).toHaveBeenCalledWith({ PageSize: 20, StartIndex: 0 });
  });

  it('accountData(search) should call client method with correct parameters', () => {
    mockTsbApiService.typedClient.PortalTargetsystemUnsAccount.Get.calls.reset();

    service.accountData('test');

    expect(mockTsbApiService.typedClient.PortalTargetsystemUnsAccount.Get).toHaveBeenCalledWith({
      PageSize: 20,
      StartIndex: 0,
      search: 'test',
    });
  });
});
