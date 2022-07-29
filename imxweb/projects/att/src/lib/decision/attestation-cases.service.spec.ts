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
import { PortalAttestationApprove, PortalAttestationCase, PortalAttestationCaseHistory } from 'imx-api-att';
import { configureTestSuite } from 'ng-bullet';

import { AppConfigService, ElementalUiConfigService } from 'qbm';
import { ParameterDataService } from 'qer';

import { ApiService } from '../api.service';
import { AttestationCase } from './attestation-case';
import { AttestationCasesService } from './attestation-cases.service';

describe('AttestationCasesService', () => {
  let service: AttestationCasesService;

  function createAttestationCase(key?): AttestationCase {
    const value = '';
    return {
      DecisionLevel: {},
      UID_QERWorkingMethod: {},
      GetEntity: () => ({
        GetColumn: _ => ({
          GetValue: () => value,
          GetDisplayValue: () => value
        }),
        GetKeys: () => [key],
        GetSchema: () => <any>PortalAttestationApprove.GetEntitySchema()
      })
    } as AttestationCase;
  }

  const sessionServiceStub = new class {
    readonly mockCases = [createAttestationCase()];
    readonly typedClient = {
      PortalAttestationCaseHistory: {
        GetSchema: () => PortalAttestationCaseHistory.GetEntitySchema(),
      },
      PortalAttestationCase: {
        GetSchema: () => PortalAttestationCase.GetEntitySchema(),
      },
      PortalAttestationApprove: {
        GetSchema: () => PortalAttestationApprove.GetEntitySchema(),
        Get: jasmine.createSpy('Get').and.returnValue(Promise.resolve({ totalCount: this.mockCases.length, Data: this.mockCases }))
      }
    };
    readonly client = {
      portal_attestation_decide_post: jasmine.createSpy('portal_attestation_decide_post'),
      portal_attestation_directdecision_post: jasmine.createSpy('portal_attestation_directdecision_post'),
      portal_attestation_additional_post: jasmine.createSpy('portal_attestation_additional_post'),
      portal_attestation_insteadof_post: jasmine.createSpy('portal_attestation_insteadof_post'),
      portal_attestation_denydecision_post: jasmine.createSpy('portal_attestation_denydecision_post'),
      portal_attestation_revokedelegation_post: jasmine.createSpy('portal_attestation_revokedelegation_post'),
      portal_attestation_recalldecision_post: jasmine.createSpy('portal_attestation_recalldecision_post'),
      portal_attestation_persondecision_get: jasmine.createSpy('portal_attestation_persondecision_get').and.returnValue({ Entities: [] })
    };

    reset() {
      Object.keys(this.client).forEach(methodName =>
        this.client[methodName].calls.reset()
      );
      this.typedClient.PortalAttestationApprove.Get.calls.reset();
    }
  }();

  configureTestSuite(() => {
    TestBed.configureTestingModule({
      providers: [
        AttestationCasesService,
        {
          provide: ApiService,
          useValue: sessionServiceStub
        },
        {
          provide: ParameterDataService,
          useValue: {
            createContainer: jasmine.createSpy('createContainer')
          }
        },
        {
          provide: AppConfigService,
          useValue: {}
        },
        {
          provide: ElementalUiConfigService,
          useValue: { 
            Config: jasmine.createSpy('Config').and.returnValue({ downloadOptions: {} })
          }
        }
      ]
    });
    service = TestBed.inject(AttestationCasesService);
  });

  beforeEach(() => {
    sessionServiceStub.reset();
  });

  it('provides attestation cases', async () => {
    const caseCollection = await service.get();
    expect(caseCollection.Data.length).toEqual(sessionServiceStub.mockCases.length);
  });

  [
    { method: 'makeDecision', endpoint: 'portal_attestation_decide_post' },
    { method: 'directDecision', endpoint: 'portal_attestation_directdecision_post' },
    { method: 'addAdditional', endpoint: 'portal_attestation_additional_post' },
    { method: 'addInsteadOf', endpoint: 'portal_attestation_insteadof_post' },
    { method: 'revokeDelegation', endpoint: 'portal_attestation_revokedelegation_post' },
    { method: 'denyDecision', endpoint: 'portal_attestation_denydecision_post' },
    { method: 'recallDecision', endpoint: 'portal_attestation_recalldecision_post' }
  ].forEach(testcase =>
  it('has a ' + testcase.method + ' method', async () => {
    const key = 'some key';
    const input = { Reason: 'some reason' };
    await service[testcase.method](createAttestationCase(key), input);
    expect(sessionServiceStub.client[testcase.endpoint]).toHaveBeenCalledWith(key, input);
  }));

  it('provides approvers for a case', async () => {
    const key = 'some key';
    const approvers = await service.getApprovers(createAttestationCase(key));
    expect(sessionServiceStub.client.portal_attestation_persondecision_get).toHaveBeenCalledWith(key);
    expect(approvers).toBeDefined();
  });
});
