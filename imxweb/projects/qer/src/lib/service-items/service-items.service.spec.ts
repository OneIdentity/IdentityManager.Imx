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
 * Copyright 2021 One Identity LLC.
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
import { NoopAnimationsModule, BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { configureTestSuite } from 'ng-bullet';

import { ServiceItemsService } from './service-items.service';
import { PortalShopServiceitems } from 'imx-api-qer';
import { CollectionLoadParameters } from 'imx-qbm-dbts';
import { QerApiService } from '../qer-api-client.service';

describe('ServiceItemsService', () => {
  let service: ServiceItemsService;

  interface serviceItemParameters extends CollectionLoadParameters {
    UID_Person?: string;
    UID_AccProductGroup?: string;
    IncludeChildCategories?: boolean;
    UID_AccProductParent?: string;
    UID_PersonReference?: string;
  }

  interface mockServiceItem {
    key: string;
    ParentKey?: string;
  }

  const testhelpers = new class {
    mockServiceItems: mockServiceItem[];
    getServiceItems: (parameters: serviceItemParameters) => mockServiceItem[];
    constructor() {
      this.reset();
    }
    reset() {
      this.mockServiceItems = [{ key: '1' }];
      this.getServiceItems = (_: serviceItemParameters) => this.mockServiceItems;
    }
  };

  function createEntities(items: { key: string }[]): PortalShopServiceitems[] {
    return items.map(item => ({
      GetEntity: () => ({
        GetKeys: () => [item.key],
        GetDisplay: () => undefined
      })
    } as PortalShopServiceitems));
  }

  const sessionServiceStub = {
    typedClient: {
      PortalShopServiceitems: {
        Get: jasmine.createSpy('Get').and.callFake(parameters => {
          const items = testhelpers.getServiceItems(parameters);
          return Promise.resolve({
            totalCount: items.length,
            Data: createEntities(items)
          });
        })
      }
    }
  };

  configureTestSuite(() => {
    TestBed.configureTestingModule({
      imports: [
        BrowserAnimationsModule,
        NoopAnimationsModule
      ],
      providers: [
        {
          provide: QerApiService,
          useValue: sessionServiceStub
        }
      ]
    });
    service = TestBed.inject(ServiceItemsService);
  });

  beforeEach(() => {
    sessionServiceStub.typedClient.PortalShopServiceitems.Get.calls.reset();
    testhelpers.reset();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('gets service items', async () => {
    const parameters = {};
    expect((await service.get(parameters)).totalCount).toEqual(testhelpers.mockServiceItems.length);
    expect(sessionServiceStub.typedClient.PortalShopServiceitems.Get).toHaveBeenCalledWith(parameters, jasmine.any(Object));
  });

  it('gets service item', async () => {
    const serviceItem = await service.getServiceItem(testhelpers.mockServiceItems[0].key);
    expect(serviceItem.GetEntity().GetKeys()[0]).toEqual(testhelpers.mockServiceItems[0].key);
    expect(sessionServiceStub.typedClient.PortalShopServiceitems.Get).toHaveBeenCalledWith({
      IncludeChildCategories: false,
      filter: [
        {
          ColumnName: 'UID_AccProduct',
          Type: 0,
          CompareOp: 0,
          Value1: testhelpers.mockServiceItems[0].key
        }
      ]
    },
    jasmine.any(Object));
  });

  [
    {
      serviceItems: [],
      personValues: [],
      personDisplayValues: []
    },
    { // TODO: expect error / only distinct pairs?
      serviceItems: [{ key: '1' }, { key: '1' }],
      personValues: ['a', 'a'],
      personDisplayValues: ['a(Display)', 'a(Display)']
    },
    {
      serviceItems: [{ key: '1' }, { key: '2' }],
      personValues: ['a', 'b', 'c'],
      personDisplayValues: ['a(Display)', 'b(Display)', 'c(Display)']
    }
  ].forEach(testcase =>
  it('gets service items for persons', async () => {

    const persons = testcase.personValues.map((DataValue, index) => ({
      DataValue,
      DisplayValue: testcase.personDisplayValues[index]
    }));

    const serviceItemsForPersons = await service.getServiceItemsForPersons(
      createEntities(testcase.serviceItems),
      persons
    );

    expect(serviceItemsForPersons.length).toEqual(testcase.serviceItems.length * testcase.personValues.length);
    testcase.serviceItems.forEach(serviceItem =>
      testcase.personValues.forEach(uidPersonOrdered =>
        expect(serviceItemsForPersons.find(item =>
          item.UidAccProduct === serviceItem.key &&
          item.UidPerson === uidPersonOrdered
        )).toBeTruthy()
      )
    );
  }));

  it('gets service items for persons with uidITShopOrg', async () => {
    const serviceItems = [{ key: '1' }, { key: '2' }];
    const uidITShopOrg = 'some uid';   

    const persons = [
      { DataValue: 'a', DisplayValue: 'a(Display)' },
      { DataValue: 'b', DisplayValue: 'b(Display)' }
    ];

    const serviceItemsForPersons = await service.getServiceItemsForPersons(
      createEntities(serviceItems),
      persons,
      uidITShopOrg
    );

    expect(serviceItemsForPersons.length).toEqual(serviceItems.length * persons.length);
    serviceItemsForPersons.forEach(item =>
      expect(item.UidITShopOrg).toEqual(uidITShopOrg)
    );
  });
});
