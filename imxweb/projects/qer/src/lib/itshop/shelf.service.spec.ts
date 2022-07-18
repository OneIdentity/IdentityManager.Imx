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
import { MatDialog } from '@angular/material/dialog';
import { EuiLoadingService, EuiSidesheetService } from '@elemental-ui/core';
import { configureTestSuite } from 'ng-bullet';
import { LoggerTestingModule } from 'ngx-logger/testing';
import { of } from 'rxjs';

import { QerApiService } from '../qer-api-client.service';
import { MessageDialogResult } from 'qbm';
import { ShelfService } from './shelf.service';

describe('ShelfService', () => {
  let service: ShelfService;

  let foundProductsMock = [];

  let onShelfSidesheetClose = () => undefined;

  const sessionServiceStub = {
    client: {
      portal_itshop_findproducts_post: jasmine.createSpy('portal_itshop_findproducts_post').and
        .callFake(() => foundProductsMock),
    }
  };

  const euiLoadingServiceStub = {
    hide: jasmine.createSpy('hide'),
    show: jasmine.createSpy('show')
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
        },
        {
          provide: EuiLoadingService,
          useValue: euiLoadingServiceStub
        },
        {
          provide: EuiSidesheetService,
          useValue: {
            open: jasmine.createSpy('open').and.returnValue({
              afterClosed: () => of(onShelfSidesheetClose())
            })
          }
        },
        {
          provide: MatDialog,
          useValue: mockDialog
        }
      ]
    });
    service = TestBed.inject(ShelfService);
  });

  beforeEach(() => {
    sessionServiceStub.client.portal_itshop_findproducts_post.calls.reset();
    mockDialog.open.calls.reset();
    foundProductsMock = [];
    onShelfSidesheetClose = () => undefined;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('setShops does not change the shop shelf assignment for service items that are already associated with a shop shelf', async () => {
    foundProductsMock = [{
      UidAccProduct: '1',
      UidPerson: 'a',
      UidITShopOrg: 'shelf2'
    }];
    const expectedShopShelf = 'shelf1';
    const serviceItemsForPersons = [{
      UidAccProduct: '1',
      UidPerson: 'a',
      UidITShopOrg: expectedShopShelf
    }];
    await service.setShops(serviceItemsForPersons);
    expect(sessionServiceStub.client.portal_itshop_findproducts_post).toHaveBeenCalledWith(serviceItemsForPersons);
    expect(serviceItemsForPersons[0].UidITShopOrg).toEqual(expectedShopShelf);
  });

  it('setShops sets the shop shelf for service items that have a single matching shop shelf', async () => {
    const expectedShopShelf = 'shelf2';
    foundProductsMock = [{
      UidAccProduct: '1',
      UidPerson: 'a',
      UidITShopOrg: expectedShopShelf
    }];
    const serviceItemsForPersons = [{
      UidAccProduct: '1',
      UidPerson: 'a',
      UidITShopOrg: undefined
    }];
    await service.setShops(serviceItemsForPersons);
    expect(sessionServiceStub.client.portal_itshop_findproducts_post).toHaveBeenCalledWith(serviceItemsForPersons);
    expect(serviceItemsForPersons[0].UidITShopOrg).toEqual(expectedShopShelf);
  });
});
