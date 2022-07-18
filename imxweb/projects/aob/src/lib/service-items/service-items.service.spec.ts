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

import { ServiceItemsService } from './service-items.service';
import { PortalEntitlement } from 'imx-api-aob';
import { AobApiService } from '../aob-api-client.service';

describe('ServiceItemsService', () => {
  const mockServiceItems = [{}];

  const typedClientStub = {
    PortalEntitlementServiceitem: {
      Get: jasmine.createSpy('Get').and.returnValue({
        totalCount: mockServiceItems.length,
        Data: mockServiceItems
      })
    } 
  };

  configureTestSuite(() => TestBed.configureTestingModule({
    providers: [
      {
        provide: AobApiService,
        useValue: {
          typedClient: typedClientStub
        }
      }
    ]
  }));

  it('should be created', () => {
    const service: ServiceItemsService = TestBed.get(ServiceItemsService);
    expect(service).toBeTruthy();
  });

  it('can get service items', async () => {
    const uid_aobentitlement = 'id1';

    const service: ServiceItemsService = TestBed.get(ServiceItemsService);
    const items = await service.get({ UID_AOBEntitlement: { value: uid_aobentitlement } } as PortalEntitlement);
    expect(typedClientStub.PortalEntitlementServiceitem.Get).toHaveBeenCalledWith({ uid_aobentitlement });
    expect(items.Data.length).toEqual(mockServiceItems.length);
  });
});
