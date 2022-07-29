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

import { PortalItshopApproveRequests } from 'imx-api-qer';
import { ApprovalsService } from './approvals.service';
import { QerApiService } from '../qer-api-client.service';
import { ItshopRequestService } from '../itshop/itshop-request.service';

describe('ApprovalsService', () => {

  let service: ApprovalsService;

  const mockApplications = [{
    GetEntity: () => ({
      GetColumn: () => ({ GetValue: () => ({}) }),
      GetKeys: () => []
    })
  }];

  const sessionTestHelper = new class {
    readonly serviceStub = {
      client: {
        portal_itshop_additional_post: jasmine.createSpy('portal_itshop_additional_post'),
        portal_itshop_insteadof_post: jasmine.createSpy('portal_itshop_insteadof_post'),
        portal_itshop_denydecision_post: jasmine.createSpy('portal_itshop_denydecision_post'),
        portal_itshop_escalate_post: jasmine.createSpy('portal_itshop_escalate_post'),
        portal_itshop_revokedelegation_post: jasmine.createSpy('portal_itshop_revokedelegation_post'),
        portal_itshop_recalldecision_post: jasmine.createSpy('portal_itshop_recalldecision_post'),
        portal_itshop_decide_post: jasmine.createSpy('portal_itshop_decide_post'),
        portal_itshop_directdecision_post: jasmine.createSpy('portal_itshop_directdecision_post')
      },
      typedClient: {
        PortalItshopApproveRequests: jasmine.createSpyObj('PortalItshopApproveRequests', {
          Get: Promise.resolve({
            totalCount: 0,
            Data: mockApplications,
            extendedData: {
              Data: [{
                WorkflowSteps: {
                  Entities: [{
                    Columns: { LevelNumber: { Value: 0 } }
                  }]
                }
              }]
            }
          })
        })
      }
    };

    reset() {
      Object.keys(this.serviceStub.client).forEach(methodName =>
        this.serviceStub.client[methodName].calls.reset()
      );

      Object.keys(this.serviceStub.typedClient).forEach(propertyName => {
        const property = this.serviceStub.typedClient[propertyName];
        Object.keys(property).forEach(methodName =>
          property[methodName].calls.reset()
        );
      });
    }
  }();

  configureTestSuite(() => {
    TestBed.configureTestingModule({
      providers: [
        ApprovalsService,
        {
          provide: QerApiService,
          useValue: sessionTestHelper.serviceStub
        },
        {
          provide: ItshopRequestService,
          useValue: {
            createRequestApprovalItem: (typedEntity, __1) => typedEntity
          }
        }
      ]
    });
  });

  beforeEach(() => {
    sessionTestHelper.reset();
    service = TestBed.inject(ApprovalsService);
  });

  it('should be created', () => {
    expect(service).toBeDefined();
  });

  it('gets requests to approve', async () => {
    expect((await service.get({})).Data.length).toEqual(mockApplications.length);
    expect(sessionTestHelper.serviceStub.typedClient.PortalItshopApproveRequests.Get).toHaveBeenCalled();
  });

  it('has an addApprover method', async () => {
    const key = 'some key';
    const approver = {};

    const pwo = { GetEntity: () => ({ GetKeys: () => [key] }) } as PortalItshopApproveRequests;

    await service.addApprover(pwo, approver);
    expect(sessionTestHelper.serviceStub.client.portal_itshop_additional_post).toHaveBeenCalledWith(key, approver);
  });

  it('has a delegateApproval method', async () => {
    const key = 'some key';
    const approver = {};

    const pwo = { GetEntity: () => ({ GetKeys: () => [key] }) } as PortalItshopApproveRequests;

    await service.delegateDecision(pwo, approver);
    expect(sessionTestHelper.serviceStub.client.portal_itshop_insteadof_post).toHaveBeenCalledWith(key, approver);
  });

  it('has a denyApproval method', async () => {
    const key = 'some key';
    const reason = 'some reason';
    const justification = 'some justification';

    const pwo = { GetEntity: () => ({ GetKeys: () => [key] }) } as PortalItshopApproveRequests;

    await service.denyDecision(pwo, { Reason: reason, UidJustification: justification });
    expect(sessionTestHelper.serviceStub.client.portal_itshop_denydecision_post).toHaveBeenCalledWith(key, { Reason: reason, UidJustification: justification });
  });

  it('has a escalateApproval method', async () => {
    const key = 'some key';
    const reason = 'some reason';

    const pwo = { GetEntity: () => ({ GetKeys: () => [key] }) } as PortalItshopApproveRequests;

    await service.escalateDecision(pwo, reason);
    expect(sessionTestHelper.serviceStub.client.portal_itshop_escalate_post).toHaveBeenCalledWith(key, { Reason: reason });
  });

  it('has a revokedelegation method', async () => {
    const key = 'some key';
    const reason = 'some reason';

    const pwo = { GetEntity: () => ({ GetKeys: () => [key] }) } as PortalItshopApproveRequests;

    await service.revokeDelegation(pwo, { Reason: reason });
    expect(sessionTestHelper.serviceStub.client.portal_itshop_revokedelegation_post).toHaveBeenCalledWith(key, { Reason: reason });
  });

  it('has a recallDecision method', async () => {
    const key = 'some key';
    const reason = 'some reason';
    const justification = 'some justification';

    const pwo = { GetEntity: () => ({ GetKeys: () => [key] }) } as PortalItshopApproveRequests;

    await service.recallDecision(pwo, { Reason: reason, UidJustification: justification });
    expect(sessionTestHelper.serviceStub.client.portal_itshop_recalldecision_post).toHaveBeenCalledWith(key, { Reason: reason, UidJustification: justification });
  });
});
