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

import { OpsupportSyncDatastore } from 'imx-api-dpr';
import { imx_SessionService, AppConfigService } from 'qbm';
import { UnresolvedRefsService } from './unresolved-refs.service';
import { RoutingMock } from '../test-utilities/router-mock.spec';
import { DprApiService } from '../../../dpr-api-client.service';

describe('UnresolvedRefsService', () => {
  const unresolvedRefs = [];
  const mockSessionService = {
    typedClient: {
      OpsupportSyncDatastore: jasmine.createSpyObj('OpsupportSyncDatastore', {
        GetSchema: OpsupportSyncDatastore.GetEntitySchema(),
        Get: Promise.resolve({ Data: unresolvedRefs, totalCount: unresolvedRefs.length })
      })
    }
  };

  configureTestSuite(() => {
    TestBed.configureTestingModule({
      providers: [
        UnresolvedRefsService,
        imx_SessionService,
        AppConfigService,
        {
          provide: Router,
          useValue: new RoutingMock()
        },
        {
          provide: DprApiService,
          useValue: mockSessionService
        }
      ]
    });
  });

  beforeEach(() => {
    mockSessionService.typedClient.OpsupportSyncDatastore.Get.calls.reset();
  });

  it('should be created', inject([UnresolvedRefsService], (service: UnresolvedRefsService) => {
    expect(service).toBeDefined();
  }));
});
