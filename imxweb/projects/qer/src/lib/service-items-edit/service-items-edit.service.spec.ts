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
import { EuiLoadingService } from '@elemental-ui/core';
import { configureTestSuite } from 'ng-bullet';

import { DynamicMethodService } from 'qbm';
import { QerApiService } from '../qer-api-client.service';
import { ServiceItemsEditService } from './service-items-edit.service';

describe('ServiceItemsEditService', () => {
  let service: ServiceItemsEditService;

  const euiLoadingServiceStub = {
    hide: jasmine.createSpy('hide'),
    show: jasmine.createSpy('show')
  };

  const qerApiServiceStub = {
    typedClient: {
      PortalServiceitems: {
        Get: jasmine.createSpy('Get'),
        GetSchema: jasmine.createSpy('GetSchema')
      },
      PortalCandidatesAccproductparamcategory: {
        Get: jasmine.createSpy('Get')
      },
    }
  };

  configureTestSuite(() => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: QerApiService,
          useValue: qerApiServiceStub
        },
        {
          provide: EuiLoadingService,
          useValue: euiLoadingServiceStub
        },
        {
          provide: DynamicMethodService,
          useValue: {
            get: jasmine.createSpy('get').and.returnValue({})
          },
        }
      ]
    });
  });

  beforeEach(() => {
    service = TestBed.inject(ServiceItemsEditService);
    qerApiServiceStub.typedClient.PortalServiceitems.Get.calls.reset();
    qerApiServiceStub.typedClient.PortalServiceitems.GetSchema.calls.reset();
    qerApiServiceStub.typedClient.PortalCandidatesAccproductparamcategory.Get.calls.reset();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
