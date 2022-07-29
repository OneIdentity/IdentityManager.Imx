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
import { DataIssuesService } from './data-issues.service';
import { ArcApiService } from '../../services/arc-api-client.service';
import { DataIssues } from './data-issues.models';
import { fakeAsync, flush } from '@angular/core/testing';
import { ApiService } from 'att';
import { QerApiService, QerPermissionsService } from 'qer';

describe('DataIssuesService', () => {
  let service: DataIssuesService;

  const mockQerApiService = {
    typedClient: {
      PortalAdminPerson: {
        Get: jasmine.createSpy('Get').and.returnValue(Promise.resolve({ totalCount: 10 }))
      },
      PortalPersonAll: {
        Get: jasmine.createSpy('Get').and.returnValue(Promise.resolve({ totalCount: 10 }))
      }
    }
  };

  const mockArcApiService = {
    typedClient: {
      PortalTargetsystemUnsAccount: {
        Get: jasmine.createSpy('Get').and.returnValue(Promise.resolve({ totalCount: 20 })),
      },
      PortalTargetsystemUnsGroup: {
        Get: jasmine.createSpy('Get').and.returnValue(Promise.resolve({ totalCount: 30 })),
      },
    },
  };

  const mockAttApiClient = {
    client: {
      portal_attestation_managerattestation_post: () => {
        return Promise.resolve();
      },
    },
  };

  ArcGovernanceTestBed.configureTestingModule({
    providers: [
      {
        provide: QerApiService,
        useValue: mockQerApiService,
      },
      {
        provide: ArcApiService,
        useValue: mockArcApiService,
      },
      {
        provide: ApiService,
        useValue: mockAttApiClient,
      },
      {
        provide: QerPermissionsService,
        useValue: {
          isPersonAdmin: jasmine.createSpy('isPersonAdmin').and.returnValue(Promise.resolve(true))
        }
      },
      DataIssuesService,
    ],
  });

  beforeEach(() => {
    service = TestBed.inject(DataIssuesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('startIdentitiesManagerWorkflow() should return a void promise', fakeAsync(() => {
    service.startIdentitiesManagerWorkflow().then((response) => {
      expect(response).toBeUndefined();
    });

    flush();
  }));

  it('checkIssues() should return a DataIssues object', fakeAsync(() => {
    let issues: DataIssues;

    service.checkIssues().subscribe((val) => {
      issues = val;
    });

    flush();

    expect(issues.count).toEqual(80);
  }));

  describe('getRequestableGroups()', () => {
    it('should return the totalCount of the data response', fakeAsync(() => {
      let result: number;
      service.getRequestableGroups().subscribe((val) => {
        result = val;
        flush();
        expect(result).toEqual(30);
      });
    }));
  });
});
