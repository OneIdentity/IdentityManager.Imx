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
import { EuiLoadingService, EuiSidesheetService } from '@elemental-ui/core';
import { configureTestSuite } from 'ng-bullet';
import { LoggerTestingModule } from 'ngx-logger/testing';

import { SnackBarService } from 'qbm';
import { ServiceItemsService } from '../../service-items/service-items.service';
import { UserModelService } from '../../user/user-model.service';
import { CartItemsService } from '../cart-items.service';
import { CartItemCloneService } from './cart-item-clone.service';

describe('CartItemCloneService', () => {
  let service: CartItemCloneService;

  const cartItemsServiceStub = {

  };

  configureTestSuite(() => {
    TestBed.configureTestingModule({
      imports: [
        LoggerTestingModule
      ],
      providers: [
        {
          provide: ServiceItemsService,
          useValue: {}
        },
        {
          provide: UserModelService,
          useValue: {
            reloadPendingItems: jasmine.createSpy('ReloadPendingItems')
          }
        },
        {
          provide: EuiSidesheetService,
          useValue: { }
        },
        {
          provide: EuiLoadingService,
          useValue: {
            show: jasmine.createSpy('show'),
            hide: jasmine.createSpy('hide')
          }
        },
        {
          provide: CartItemsService,
          useValue: cartItemsServiceStub
        },
        {
          provide: SnackBarService,
          useValue: {
            open: jasmine.createSpy('open')
          }
        }
      ]
    });
    service = TestBed.inject(CartItemCloneService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
