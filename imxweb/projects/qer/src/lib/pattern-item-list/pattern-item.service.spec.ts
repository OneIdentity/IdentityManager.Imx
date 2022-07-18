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
import { BrowserAnimationsModule, NoopAnimationsModule } from '@angular/platform-browser/animations';
import { CollectionLoadParameters } from 'imx-qbm-dbts';
import { configureTestSuite } from 'ng-bullet';
import { clearStylesFromDOM } from 'qbm';
import { QerApiService } from '../qer-api-client.service';
import { ServiceItemsService } from '../service-items/service-items.service';

import { PatternItemService } from './pattern-item.service';

describe('PatternItemService', () => {
  let service: PatternItemService;

  interface patternItemParameters extends CollectionLoadParameters {
    UID_Person?: string;
  }

  interface mockPatternRequestable {
    key: string;
  }

  const testhelpers = new class {
    mockServiceItems: mockPatternRequestable[];
    get: (parameters: patternItemParameters) => mockPatternRequestable[];
    constructor() {
      this.reset();
    }
    reset() {
      this.mockServiceItems = [{ key: '1'}];
      this.get = (_: patternItemParameters) => this.mockServiceItems;
    }
  };

  const sessionServiceStub = {
    typedClient: {
      PortalItshopPatternRequestable: {
        Get: jasmine.createSpy('Get').and.callFake(parameters => {
          const items = testhelpers.get(parameters);
          return Promise.resolve(({
            totalCount: items.length,
            Data: items
          }));
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
        },
        {
          provide: ServiceItemsService,
          useValue: {
            getServiceItems: jasmine.createSpy('getServiceItems')
          }
        }
      ]
    });
    service = TestBed.inject(PatternItemService);
  });

  beforeEach(() => {
    // sessionServiceStub.typedClient.PortalItshopPatternRequestable.Get.calls.reset();
    // testhelpers.reset();
  })

  afterAll(() => {
    clearStylesFromDOM();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  // xit('gets template items', async () => {
  //   const parameters = {};
  //   expect((await service.get(parameters)).totalCount).toEqual(testhelpers.mockServiceItems.length);
  //   expect(sessionServiceStub.typedClient.PortalItshopPatternRequestable.Get).toHaveBeenCalledWith(parameters);
  // })
});
