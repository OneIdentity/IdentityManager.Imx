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
import { configureTestSuite } from 'ng-bullet';

import { ParameterDataService } from 'qer';
import { PortalAttestationCase } from 'imx-api-att';
import { ApiService } from '../api.service';
import { AttestationHistoryCase } from './attestation-history-case';
import { AttestationHistoryService } from './attestation-history.service';

describe('AttestationHistoryService', () => {
  let service: AttestationHistoryService;

  function createColumn(startvalue) {
    const value = startvalue ?? '';
    return {
      GetValue: () => value,
      GetDisplayValue: () => value
    };
  }

  function createAttestationHistoryCase(columns = { }): AttestationHistoryCase {
    return {
      GetEntity: () => ({
        GetColumn: name => createColumn(columns[name]),
        GetKeys: () => ['key'],
        GetSchema: () => <any>PortalAttestationCase.GetEntitySchema()
      })
    } as AttestationHistoryCase;
  }

  const sessionServiceStub = new class {
    readonly userUid = 'some user id';
    readonly mockCases = [
      createAttestationHistoryCase(),
      createAttestationHistoryCase({ IsClosed: 1, name: this.userUid }),
      createAttestationHistoryCase({ IsClosed: 0, name: this.userUid }),
      createAttestationHistoryCase({ IsClosed: 0 })
    ];
    readonly typedClient = {
      PortalAttestationCase: {
        Get: jasmine.createSpy('Get').and.callFake(parameters => Promise.resolve({
          totalCount: this.mockCases.length,
          Data: parameters?.filter?.length ?
            this.mockCases.filter(item => item.GetEntity().GetColumn(parameters.filter[0].ColumnName).GetValue() === parameters.filter[0].Value1)
            : this.mockCases
        }))
      }
    };
    readonly client = {
      portal_attestation_revokedelegation_post: jasmine.createSpy('portal_attestation_denydecision_post'),
      portal_attestation_recalldecision_post: jasmine.createSpy('portal_attestation_recalldecision_post')
    };

    reset() {
      Object.keys(this.client).forEach(methodName =>
        this.client[methodName].calls.reset()
      );
      this.typedClient.PortalAttestationCase.Get.calls.reset();
    }
  }();

  configureTestSuite(() => {
    TestBed.configureTestingModule({
      providers: [
        AttestationHistoryService,
        {
          provide: ApiService,
          useValue: sessionServiceStub
        },
        {
          provide: ParameterDataService,
          useValue: {
            createContainer: jasmine.createSpy('createContainer')
          }
        }
      ]
    });
    service = TestBed.inject(AttestationHistoryService);
  });

  beforeEach(() => {
    sessionServiceStub.reset();
  });

  it('provides attestation cases', async () => {
    const caseCollection = await service.getAttestations();
    expect(caseCollection.Data.length).toEqual(sessionServiceStub.mockCases.length);
  });
});
