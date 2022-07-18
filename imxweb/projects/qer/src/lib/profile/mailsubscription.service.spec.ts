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

import { QerApiService } from '../qer-api-client.service';
import { MailInfoType, MailSubscriptionService } from './mailsubscription.service';

describe('MailSubscriptionService', () => {
  let service: MailSubscriptionService;

  const apiClient = new class {
    get user1Key() { return Object.keys(this.personsEmails)[0]; }
    readonly user1Mail1Uid = '1';
    readonly user1Data = [{
      GetEntity: () => ({ GetDisplay: () => undefined, GetKeys: () => [this.user1Mail1Uid] }),
      Description: { Column: { GetDisplayValue: () => undefined } },
      IsSubscribed: {},
      AllowUnsubscribe: { value: true }
    }];
    readonly personsEmails = { user1: { Data: this.user1Data } };

    readonly typedClient = {
      PortalPersonEmail: {
        Get: userUid => Promise.resolve(this.personsEmails[userUid])
      }
    };

    readonly client = { portal_person_email_post: jasmine.createSpy('portal_person_email_post') };
  }();

  configureTestSuite(() => {
    TestBed.configureTestingModule({
      providers: [
        MailSubscriptionService,
        {
          provide: QerApiService,
          useValue: apiClient
        }
      ]
    });
    service = TestBed.inject(MailSubscriptionService);
  });

  beforeEach(() => {
    apiClient.client.portal_person_email_post.calls.reset();
  });

  it('should get mails that cannot be unsubscribed', async () => {
    const mailInfo = await service.getMailsThatCanBeUnsubscribed(apiClient.user1Key);

    expect(mailInfo[0].UidMail).toEqual(apiClient.user1Mail1Uid);
  });

  describe('getMails', () => {
    it('to subscribe', () => {
      const selectedOptions = ['1'];

      const mailInfo = [
        { AllowUnsubscribe: true, UidMail: '1' },
        { AllowUnsubscribe: true, IsSubscribed: true, UidMail: '2' }
      ] as MailInfoType[];

      const mails = service.getMailsToSubscribe(mailInfo, selectedOptions);

      expect(mails.length).toEqual(1);
      expect(mails[0].UidMail).toEqual(selectedOptions[0]);
    });
  
    it('to unsubscribe', () => {
      const selectedOptions = ['2'];

      const mailInfo = [
        { AllowUnsubscribe: true, UidMail: '1' },
        { AllowUnsubscribe: true, IsSubscribed: true, UidMail: '2' },
        { AllowUnsubscribe: true, IsSubscribed: true, UidMail: '3' }
      ] as MailInfoType[];

      const mails = service.getMailsToUnsubscribe(mailInfo, selectedOptions);

      expect(mails.length).toEqual(1);
      expect(mails[0].UidMail).toEqual('3');
    });
  });

  it('should subscribe', async () => {
    const uidPerson = 'some user id';
    const uidMails = ['some mail id'];

    await service.subscribe(uidPerson, uidMails);

    expect(apiClient.client.portal_person_email_post).toHaveBeenCalledWith(
      uidPerson,
      {
        UidMail: uidMails,
        Unsubscribe: false
      }
    );
  });

  it('should unsubscribe', async () => {
    const uidPerson = 'some user id';
    const uidMails = ['some mail id'];

    await service.unsubscribe(uidPerson, uidMails);

    expect(apiClient.client.portal_person_email_post).toHaveBeenCalledWith(
      uidPerson,
      {
        UidMail: uidMails,
        Unsubscribe: true
      }
    );
  });
});
