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
import { SnackBarService } from 'qbm';
import { ShelfService, UserModelService, QerApiService } from 'qer';
import { TsbTestBed } from '../../../../test/tsb-test-bed.spec';
import { NewMembershipService } from './new-membership.service';

describe('NewMembershipService', () => {
  let service: NewMembershipService;

  const euiLoadingServiceStub = {
    hide: jasmine.createSpy('hide'),
    show: jasmine.createSpy('show')
  };

  const userModelServiceStub = {
    reloadPendingItems: jasmine.createSpy('reloadPendingItems')
  }

  const qerApiStub ={
    typedClient: {
      PortalCartitem: {
        createEntity: jasmine.createSpy('createEntity'),
        Post: jasmine.createSpy('Post')
      }
    }
  }


  TsbTestBed.configureTestingModule({
    providers: [
      NewMembershipService,
      {
        provide: ShelfService,
        useValue: {
          setShops: jasmine.createSpy('setShops')
        }
      },
      
      {
        provide: EuiLoadingService,
        useValue: euiLoadingServiceStub
      },
      {
        provide: SnackBarService,
        useValue: {
          open: jasmine.createSpy('open')
        }
      },
      {
        provide: UserModelService,
        useValue: userModelServiceStub
      },
      {
        provide: QerApiService,
        useValue: qerApiStub
      }
    ]
  });

  beforeEach(() => {
    service = TestBed.inject(NewMembershipService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
