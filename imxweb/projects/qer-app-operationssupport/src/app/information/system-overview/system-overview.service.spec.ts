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

import { TestBed, inject } from '@angular/core/testing';
import { Router } from '@angular/router';
import { configureTestSuite } from 'ng-bullet';

import { imx_SessionService, AppConfigService } from 'qbm';
import { SystemOverviewService } from './system-overview.service';
import { RoutingMock } from '../../test-utilities/router-mock.spec';

describe('SystemOverviewService', () => {
  const systemOverviewItemsCollection = { totalCount: 10 };

  configureTestSuite(() => {
    TestBed.configureTestingModule({
      providers: [
        SystemOverviewService,
        {
          provide: Router, useValue: new RoutingMock()
        },
        {
          provide: imx_SessionService,
          useValue: {
            TypedClient: {
              OpsupportSystemoverview: jasmine.createSpyObj('OpsupportSystemoverview', {
                Get: Promise.resolve(systemOverviewItemsCollection)
              })
            }
          }
        },
        {
          provide: AppConfigService,
          useValue: {
            basePath: '',
            baseUrl: '',
            title: '',
            webAppIndex: '',
            notificationUpdateInterval: 0,
            treshold: 0,
            translation: { Langs: [''] }
          }
        }
      ]
    });
  });

  it('should be created', inject([SystemOverviewService], (service: SystemOverviewService) => {
    expect(service).toBeDefined();
  }));

  it('can fetch an systemoverview information', async () => {
    const service: SystemOverviewService = TestBed.get(SystemOverviewService);
    const entity = await service.ItemsProvider();
    expect(entity.totalCount).toBe(systemOverviewItemsCollection.totalCount);
  });
});
