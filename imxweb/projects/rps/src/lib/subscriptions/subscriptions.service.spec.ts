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
import { RpsApiService } from '../rps-api-client.service';

import { SubscriptionsService } from './subscriptions.service';

describe('SubscriptionsService', () => {
  let service: SubscriptionsService;
  let reportCount: number;

  const apiServiceStub = {
    client: {
      portal_subscription_sendmailcc_post: jasmine.createSpy('portal_subscription_sendmailcc_post'),
      portal_subscription_sendmail_post: jasmine.createSpy('portal_subscription_sendmail_post'),
      portal_subscription_delete: jasmine.createSpy('portal_subscription_delete')
    },
    typedClient: {
      PortalSubscription: {
        Get: jasmine.createSpy('Get')
      },
      PortalSubscriptionInteractive: {
        Get_byid: jasmine.createSpy('Get_byid')
      },
      PortalSubscriptioninteractive: {
        Get_byid: jasmine.createSpy('Get_byid')
      },
      PortalReports: {
        Get: jasmine.createSpy('Get').and.callFake(() => Promise.resolve({ TotalCount: reportCount }))
      }
    }
  };

  configureTestSuite(() => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: RpsApiService,
          useValue: apiServiceStub
        }
      ]
    });
    service = TestBed.inject(SubscriptionsService);
  });

  beforeEach(() => {
    apiServiceStub.typedClient.PortalSubscription.Get.calls.reset();
    apiServiceStub.typedClient.PortalSubscriptionInteractive.Get_byid.calls.reset();
    apiServiceStub.typedClient.PortalSubscriptionInteractive.Get_byid.calls.reset();
    apiServiceStub.typedClient.PortalReports.Get.calls.reset();
    apiServiceStub.client.portal_subscription_sendmail_post.calls.reset();
    apiServiceStub.client.portal_subscription_sendmailcc_post.calls.reset();
    apiServiceStub.client.portal_subscription_delete.calls.reset();
  })

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('can get subscriptions', async () => {
    await service.getSubscriptions({ StartIndex: 0, PageSize: 25 });
    expect(apiServiceStub.typedClient.PortalSubscription.Get).toHaveBeenCalledWith({ StartIndex: 0, PageSize: 25 })
  });

  it('can get single subscription', async () => {
    await service.getSubscriptionInteractive('uid');
    expect(apiServiceStub.typedClient.PortalSubscriptionInteractive.Get_byid).toHaveBeenCalledWith('uid');
  });

  it('can delete a subscription', async () => {
    await service.deleteSubscription('uid');
    expect(apiServiceStub.client.portal_subscription_delete).toHaveBeenCalledWith('uid');
  });

  for (const withCC of [true, false]) {
    it(`can send mail to ${withCC ? 'all subscribers' : 'myself only'}`, async () => {
      await service.sendMail('somereport', withCC);

      expect(apiServiceStub.client.portal_subscription_sendmail_post).toHaveBeenCalledWith('somereport');

      if (withCC) {
        expect(apiServiceStub.client.portal_subscription_sendmailcc_post).toHaveBeenCalledWith('somereport');
      } else {
        expect(apiServiceStub.client.portal_subscription_sendmailcc_post).not.toHaveBeenCalled();
      }
    })
  }

  for (const numberOfReports of [0, 1, 2]) {
    it('checks if there are reports or not', async () => {
      reportCount = numberOfReports;
      expect(await service.hasReports()).toEqual(numberOfReports < 0);
    });
  }
});
