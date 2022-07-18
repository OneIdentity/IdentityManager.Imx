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
import { QerApiService } from '../../qer-api-client.service';

import { DependencyService } from './dependency.service';

describe('DependencyService', () => {
  let service: DependencyService;

  const qerApiStub = {
    v2Client: {
      portal_shop_serviceitems_dependencies_get: jasmine.createSpy('portal_shop_serviceitems_dependencies_get').and.callFake(
        (
          uid: string,
          options?: {
            UID_Person?: string;
          }
        ) => Promise.resolve({})
      ),
    },
    typedClient: {
      PortalShopServiceitems: {
        GetSchema: () => {},
      },
    },
  };

  configureTestSuite(() => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: QerApiService,
          useValue: qerApiStub,
        },
        {
          provide: EuiLoadingService,
          useValue: {
            hide: jasmine.createSpy('hide'),
            show: jasmine.createSpy('show')
          },
        },
      ],
    });
    service = TestBed.inject(DependencyService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
