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
import { LoggerTestingModule } from 'ngx-logger/testing';
import { of } from 'rxjs';

import { ItshopService } from './itshop.service';
import { QerApiService } from '../qer-api-client.service';
import { MessageDialogResult } from 'qbm';

describe('ItshopService', () => {
  let service: ItshopService;

  let foundProductsMock = [];

 
  const sessionServiceStub = {
    client: {
      portal_itshop_findproducts_post: jasmine.createSpy('portal_itshop_findproducts_post').and
        .callFake(() => foundProductsMock),
      portal_itshop_cart_delete: jasmine.createSpy('portal_itshop_cart_delete')
    },
    typedClient: {
      PortalItshopPersondecision: {
        Get: jasmine.createSpy('Get').and.returnValue(Promise.resolve({ totalCount: 1, Data: [] }))
      },
      PortalItshopPeergroupMemberships: {
        Get: __ => ({})
      },
      PortalItshopApproveHistory: { GetSchema: () => undefined }
    }
  };

  const mockDialog = {
    open: jasmine.createSpy('open').and.returnValue({
      beforeClosed: () => of(MessageDialogResult.YesResult),
      afterClosed: () => of(MessageDialogResult.YesResult)
    })
  };

  configureTestSuite(() => {
    TestBed.configureTestingModule({
      imports: [LoggerTestingModule],
      providers: [
        {
          provide: QerApiService,
          useValue: sessionServiceStub
        }
      ]
    });
    service = TestBed.inject(ItshopService);
  });

  beforeEach(() => {
    sessionServiceStub.client.portal_itshop_findproducts_post.calls.reset();
    sessionServiceStub.client.portal_itshop_cart_delete.calls.reset();
    sessionServiceStub.typedClient.PortalItshopPersondecision.Get.calls.reset();
    mockDialog.open.calls.reset();
    foundProductsMock = [];
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('get peer group memberships', async () => {
    expect(await service.getPeerGroupMemberships({ UID_PersonPeerGroup: 'some id' })).toBeDefined();
    expect(await service.getPeerGroupMemberships({ UID_PersonReference: 'some id' })).toBeDefined();
  });

  it('can get approver', async () => {
    const key = 'some key';
    const app = await service.getApprovers(key);
    expect(sessionServiceStub.typedClient.PortalItshopPersondecision.Get)
      .toHaveBeenCalledWith(key);
    expect(app.totalCount).toEqual(1);
  });

  it('has a delete cart method', async () => {
    await (service.deleteShoppingCart('cart1'));
    expect(sessionServiceStub.client.portal_itshop_cart_delete).toHaveBeenCalled();
  });
});
