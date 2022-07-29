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

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { EuiLoadingService } from '@elemental-ui/core';
import { configureTestSuite } from 'ng-bullet';

import { clearStylesFromDOM, SnackBarService } from 'qbm';
import { MailSubscriptionsComponent } from './mailsubscriptions.component';
import { MailInfoType, MailSubscriptionService } from './mailsubscription.service';

describe('MailSubscriptionsComponent', () => {
  let component: MailSubscriptionsComponent;
  let fixture: ComponentFixture<MailSubscriptionsComponent>;

  const mailSubscriptionService = {
    getMailsToSubscribe: jasmine.createSpy('getMailsToSubscribe').and.returnValue([
      { AllowUnsubscribe: true, UidMail: '1' }
    ] as MailInfoType[]),
    getMailsToUnsubscribe: jasmine.createSpy('getMailsToUnsubscribe').and.returnValue([
      { AllowUnsubscribe: true, IsSubscribed: true, UidMail: '2' }
    ] as MailInfoType[]),
    subscribe: jasmine.createSpy('subscribe'),
    unsubscribe: jasmine.createSpy('unsubscribe')
  };

  configureTestSuite(() =>
    TestBed.configureTestingModule({
      declarations: [
        MailSubscriptionsComponent
      ],
      imports: [
        MatCardModule,
        MatListModule
      ],
      providers: [
        {
          provide: SnackBarService,
          useValue: {
            open: jasmine.createSpy('open')
          }
        },
        {
          provide: MailSubscriptionService,
          useValue: mailSubscriptionService
        },
        {
          provide: EuiLoadingService,
          useValue: {
            show: jasmine.createSpy('show'),
            hide: jasmine.createSpy('hide')
          }
        }
      ]
    })
  );

  beforeEach(() => {
    mailSubscriptionService.getMailsToSubscribe.calls.reset();
    mailSubscriptionService.getMailsToUnsubscribe.calls.reset();
    mailSubscriptionService.subscribe.calls.reset();
    mailSubscriptionService.unsubscribe.calls.reset();

    fixture = TestBed.createComponent(MailSubscriptionsComponent);
    component = fixture.componentInstance;
  });

  afterAll(() => {
    clearStylesFromDOM();
  });

  it('should initialize', async () => {
    component.mailInfo = [
      { AllowUnsubscribe: true },
      { AllowUnsubscribe: true, IsSubscribed: true }
    ] as MailInfoType[];

    await component.ngOnInit();

    expect(component.selectedOptions.length).toEqual(1);
  });

  describe('save subscription changes', () => {
    const userUid = 'some user uid';

    // TODO: Ist beim Upgrade auf Angular v11 kaputgegangrn. Reactivate
    // it('should unsubscribe', async () => {
    //   component.uidPerson = userUid;
    //   component.mailInfo = mailInfo;

    //   await component.ngOnInit();

    //   component.selectedOptions = [];

    //   await component.saveChanges();

    //   expect(mailSubscriptionService.changeSubscription).toHaveBeenCalledWith(userUid, ['2'], true);
    // });

    it('should subscribe', async () => {
      component.uidPerson = userUid;
      component.mailInfo = [];

      await component.ngOnInit();

      component.selectedOptions = ['1'];

      await component.saveChanges();

      expect(mailSubscriptionService.subscribe).toHaveBeenCalledWith(userUid, ['1']);
    });
  });
});
