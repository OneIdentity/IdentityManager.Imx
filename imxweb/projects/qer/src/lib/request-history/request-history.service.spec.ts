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

import { PortalItshopRequests } from 'imx-api-qer';
import { RequestHistoryService } from './request-history.service';
import { DataModelFilter } from 'imx-qbm-dbts';
import { QerApiService } from '../qer-api-client.service';
import { ItshopRequestService } from '../itshop/itshop-request.service';

describe('RequestHistoryService', () => {

  let getDataModelResult = { Filters: [] };

  const sessionServiceStub = {
    client: {
      portal_itshop_prolongate_post: jasmine.createSpy('portal_itshop_prolongate_post'),
      portal_itshop_unsubscribe_post: jasmine.createSpy('portal_itshop_unsubscribe_post'),
      portal_itshop_cancel_post: jasmine.createSpy('portal_itshop_cancel_post').and.returnValue(Promise.resolve()),
      portal_itshop_recallquery_post: jasmine.createSpy('portal_itshop_recallquery_post').and.returnValue(Promise.resolve({})),
      portal_itshop_resetreservation_post: jasmine.createSpy('portal_itshop_resetreservation_post').and.returnValue(Promise.resolve({})),
      portal_itshop_revokedelegation_post: jasmine.createSpy('portal_itshop_revokedelegation_post').and.returnValue(Promise.resolve({})),
      portal_itshop_requests_datamodel_get: jasmine.createSpy('portal_itshop_requests_datamodel_get').and.callFake(() => Promise.resolve(getDataModelResult))
    },
    typedClient: {
      PortalItshopRequests: {
        Get: jasmine.createSpy('Get').and.returnValue(Promise.resolve({ totalCount: 1, Data: [] }))
      }
    }
  };

  let service: RequestHistoryService;

  configureTestSuite(() => {
    TestBed.configureTestingModule({
      providers: [
        RequestHistoryService,
        {
          provide: QerApiService,
          useValue: sessionServiceStub
        },
        {
          provide: ItshopRequestService,
          useValue: {
            createParameterColumns: (__0, __1) => []
          }
        }
      ]
    });
    service = TestBed.inject(RequestHistoryService);
  });

  beforeEach(() => {
    sessionServiceStub.typedClient.PortalItshopRequests.Get.calls.reset();
    sessionServiceStub.client.portal_itshop_prolongate_post.calls.reset();
    sessionServiceStub.client.portal_itshop_unsubscribe_post.calls.reset();
    sessionServiceStub.client.portal_itshop_cancel_post.calls.reset();
    sessionServiceStub.client.portal_itshop_recallquery_post.calls.reset();
    sessionServiceStub.client.portal_itshop_resetreservation_post.calls.reset();
    sessionServiceStub.client.portal_itshop_revokedelegation_post.calls.reset();
    sessionServiceStub.client.portal_itshop_requests_datamodel_get.calls.reset();

    getDataModelResult = { Filters: [] };
  });

  it('can get Requests', async () => {
    const result = await service.getRequests(undefined, {});
    expect(sessionServiceStub.typedClient.PortalItshopRequests.Get).toHaveBeenCalled();
    expect(result.totalCount).toEqual(1);
  });

  for (const testcase of [
    { description: '(without filters)', dataModelResult: { Filters: [] } },
    { description: '(with filters)', dataModelResult: { Filters: [{ Name: 'TestFilter' } as DataModelFilter] } }
  ]) {
    it(`should get filteroptions ${testcase.description}`, async () => {
      getDataModelResult = testcase.dataModelResult;
      const result = await service.getFilterOptions(undefined);
      expect(sessionServiceStub.client.portal_itshop_requests_datamodel_get).toHaveBeenCalled();
      expect(result.length).toBe(testcase.dataModelResult.Filters.length);
      if (testcase.dataModelResult.Filters.length > 0) {
        expect(result[0].Name).toBe(testcase.dataModelResult.Filters[0].Name);
      }
    });
  }

  it('can prolongate', async () => {
    const key = 'some key';
    const pwo = { GetEntity: () => ({ GetKeys: () => [key] }) } as PortalItshopRequests;

    const input = { Reason: 'some good reason', ProlongationDate: new Date() };

    await service.prolongate(pwo, input);
    expect(sessionServiceStub.client.portal_itshop_prolongate_post).toHaveBeenCalledWith(key, input);
  });

  it('can unsubscribe', async () => {
    const input = {
      UidPwo: ['some key']
    };

    await service.unsubscribe(input);
    expect(sessionServiceStub.client.portal_itshop_unsubscribe_post).toHaveBeenCalledWith(input);
  });

  it('can cancel post', async () => {
    const key = 'some key';
    const pwo = { GetEntity: () => ({ GetKeys: () => [key] }) } as PortalItshopRequests;

    await service.cancelRequest(pwo, 'some good reason');
    expect(sessionServiceStub.client.portal_itshop_cancel_post)
      .toHaveBeenCalledWith(key, { Reason: 'some good reason' });
  });

  it('can recall a query', async () => {
    const key = 'some key';
    const pwo = { GetEntity: () => ({ GetKeys: () => [key] }) } as PortalItshopRequests;
    await service.recallQuery(pwo, 'some good reason');
    expect(sessionServiceStub.client.portal_itshop_recallquery_post)
      .toHaveBeenCalledWith(key, { Reason: 'some good reason' });
  });

  it('can reset a reservation', async () => {
    const key = 'some key';
    const pwo = { GetEntity: () => ({ GetKeys: () => [key] }) } as PortalItshopRequests;
    await service.resetReservation(pwo, 'some good reason');
    expect(sessionServiceStub.client.portal_itshop_resetreservation_post)
      .toHaveBeenCalledWith(key, { Reason: 'some good reason' });
  });

  it('can revoke a delegation', async () => {
    const key = 'some key';
    const pwo = { GetEntity: () => ({ GetKeys: () => [key] }) } as PortalItshopRequests;
    await service.revokeDelegation(pwo, 'some good reason');
    expect(sessionServiceStub.client.portal_itshop_revokedelegation_post)
      .toHaveBeenCalledWith(key, { Reason: 'some good reason' });
  });
});
