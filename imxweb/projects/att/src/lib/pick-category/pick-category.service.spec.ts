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
 * Copyright 2023 One Identity LLC.
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

import { TestBed, waitForAsync } from '@angular/core/testing';
import { EuiLoadingService } from '@elemental-ui/core';

import { PortalPickcategory, PortalPickcategoryItems } from 'imx-api-qer';
import { IEntity } from 'imx-qbm-dbts';

import { ClassloggerService, SnackBarService } from 'qbm';
import { QerApiService } from 'qer';
import { PickCategoryService } from './pick-category.service';

describe('PickCategoryService', () => {
  let service: PickCategoryService;

  const commitSpy = jasmine.createSpy('Commit');

  const euiLoadingServiceStub = {
    hide: jasmine.createSpy('hide'),
    show: jasmine.createSpy('show')
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: ClassloggerService,
          useValue: {
            debug: jasmine.createSpy('debug').and.callThrough(),
            trace: jasmine.createSpy('trace').and.callThrough()
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
          provide: QerApiService,
          useValue: {
            typedClient: {
              PortalPickcategory: {
                Get: jasmine.createSpy('Get').and.stub(),
                Post: jasmine.createSpy('Post').and.returnValue(Promise.resolve({ Data: [{}] })),
                GetSchema: () => ({ Columns: [] }),
                createEntity: jasmine.createSpy('createEntity').and.returnValue({
                  GetEntity: () => ({
                    Commit: commitSpy
                  }) as unknown as IEntity,
                  ObjectKeyDelegated: { Value: '' }
                } as unknown as PortalPickcategory)
              },
              PortalPickcategoryItems: {
                Get: jasmine.createSpy('Get').and.stub(),
                Post: jasmine.createSpy('Post').and.returnValue(Promise.resolve({ Data: [{}]})),
                GetSchema: () => ({ Columns: [] }),
                createEntity: jasmine.createSpy('createEntity').and.returnValue({
                  GetEntity: () => ({
                    Commit: commitSpy
                  }) as unknown as IEntity,
                  ObjectKeyDelegated: { Value: '' }
                } as unknown as PortalPickcategoryItems)
              }
            },
            client: {
              portal_hyperview_get: jasmine.createSpy('portal_hyperview_get').and.callFake(() => Promise.resolve([1, 2, 3]))
            },
          }
        }
      ]
    });
    service = TestBed.inject(PickCategoryService);
  });

  beforeEach(waitForAsync(() => {
    euiLoadingServiceStub.hide.calls.reset();
    euiLoadingServiceStub.show.calls.reset();
  }));

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
