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
import { IdentitiesReportsService } from './identities-reports.service';
import { IdentitesTestBed } from './test/identities-test-bed.spec'
import { QerApiService } from '../qer-api-client.service';

describe('IdentitiesReportsService', () => {
  let service: IdentitiesReportsService;

  const mockQerApiService = {
    typedClient: {
      PortalTargetsystemUnsAccount: {
        Get: jasmine.createSpy('Get').and.stub(),
      },
      PortalTargetsystemUnsSystem: {
        Get: jasmine.createSpy('Get').and.stub(),
      },
      PortalTargetsystemUnsContainer: {
        Get: jasmine.createSpy('Get').and.stub(),
      },
      PortalTargetsystemUnsGroup: {
        Get: jasmine.createSpy('Get').and.stub(),
      },
    },
    client: {
      portal_candidates_Person_get: jasmine.createSpy('portal_candidates_Person_get').and.stub(),
    },
  };

  IdentitesTestBed.configureTestingModule({
    imports: [],
    providers: [
      IdentitiesReportsService,
      {
        provide: QerApiService,
        useValue: mockQerApiService,
      },
    ],
  });

  beforeEach(() => {
    service = TestBed.inject(IdentitiesReportsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('personsReport() should return report API URL', () => {
    const getReportUrl = spyOn(<any>service, 'getReportUrl').and.stub();

    service.personsReport(30, 'test');

    expect(getReportUrl).toHaveBeenCalledWith('targetsystem/uns/person/test/report?historydays=30');
  });

  it('personsManagedReport() should return report API URL', () => {
    const getReportUrl = spyOn(<any>service, 'getReportUrl').and.stub();

    service.personsManagedReport(30, 'test');

    expect(getReportUrl).toHaveBeenCalledWith('targetsystem/uns/person/test/managed/report?historydays=30');
  });

  it('personData() should call client method with correct parameters', () => {
    mockQerApiService.client.portal_candidates_Person_get.calls.reset();

    service.personData();

    expect(mockQerApiService.client.portal_candidates_Person_get).toHaveBeenCalledWith({ PageSize: 20, StartIndex: 0 });
  });

  it('personData(search) should call client method with correct parameters', () => {
    mockQerApiService.client.portal_candidates_Person_get.calls.reset();

    service.personData('test');

    expect(mockQerApiService.client.portal_candidates_Person_get).toHaveBeenCalledWith({ PageSize: 20, StartIndex: 0, search: 'test' });
  });
});
