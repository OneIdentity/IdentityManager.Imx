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

import { ShopsService } from './shops.service';
import { ImxTranslationProviderService } from 'qbm';
import { PortalApplication, PortalShops } from 'imx-api-aob';
import { AobApiService } from '../aob-api-client.service';

describe('ShopsService', () => {
  const mockShopAssigned = { UID_ITShopOrg: { value: 'someShopUid0' } } as PortalShops;
  const mockShopUnAssigned = { UID_ITShopOrg: { value: 'someShopUid1' } } as PortalShops;

  const mockShopsData = [mockShopAssigned, mockShopUnAssigned];

  const mockApplicationinshopData = [mockShopAssigned];

  const mockSessionService = {
    typedClient: {
      PortalShops: {
        Get: jasmine.createSpy('Get').and.returnValue(Promise.resolve({
          totalCount: mockShopsData.length,
          Data: mockShopsData
        })),
        GetSchema: () => ({ Display: '' })
      },
      PortalApplicationinshop: {
        Get: jasmine.createSpy('Get').and.returnValue(Promise.resolve({
          totalCount: mockApplicationinshopData.length,
          Data: mockApplicationinshopData
        }))
      }
    },
    client: {
      portal_applicationinshop_delete: jasmine.createSpy('portal_applicationinshop_delete'),
      portal_applicationinshop_put: jasmine.createSpy('portal_applicationinshop_put')
    }
  };

  configureTestSuite(() => {
    TestBed.configureTestingModule({
      imports: [
        LoggerTestingModule
      ],
      providers: [
        {
          provide: AobApiService,
          useValue: mockSessionService
        },
        {
          provide: ImxTranslationProviderService,
          useValue: {}
        }
      ]
    });
  });

  beforeEach(() => {
    mockSessionService.client.portal_applicationinshop_delete.calls.reset();
    mockSessionService.client.portal_applicationinshop_put.calls.reset();
  });

  it('should be created', () => {
    const service: ShopsService = TestBed.get(ShopsService);
    expect(service).toBeTruthy();
  });

  [
    undefined,
    {}
  ].forEach(parameters =>
  it('can get shops', async () => {
    const service: ShopsService = TestBed.get(ShopsService);
    const shops = await service.get(parameters);
    expect(shops.Data.length).toEqual(mockShopsData.length);
  }));

  [
    undefined,
    {}
  ].forEach(parameters =>
  it('can get application in shop', async () => {
    const service: ShopsService = TestBed.get(ShopsService);
    const application = await service.getApplicationInShop('someApplicationUid', parameters);
    expect(application.Data.length).toEqual(mockApplicationinshopData.length);
  }));

  [
    { changeSet: { add: [mockShopUnAssigned], remove: [mockShopAssigned] }, calls: 1 },
    { changeSet: { add: [mockShopAssigned], remove: [mockShopUnAssigned] }, calls: 0 }
  ].forEach(testcase =>
    it('can update application in shops', async () => {
      const service: ShopsService = TestBed.get(ShopsService);
      await service.updateApplicationInShops({ UID_AOBApplication: { value: 'someApplicationUid' } } as PortalApplication, testcase.changeSet);
      expect(mockSessionService.client.portal_applicationinshop_delete).toHaveBeenCalledTimes(testcase.calls);
      expect(mockSessionService.client.portal_applicationinshop_put).toHaveBeenCalledTimes(testcase.calls);
    })
  );
});
