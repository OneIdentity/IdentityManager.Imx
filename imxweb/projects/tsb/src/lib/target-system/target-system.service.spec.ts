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
import { configureTestSuite } from 'ng-bullet';

import { TsbApiService } from '../tsb-api-client.service';
import { TargetSystemService } from './target-system.service';

describe('TargetSystemService', () => {
  let service: TargetSystemService;

  const mockTsbUserConfig = { CanClaimGroup: true };

  configureTestSuite(() => {
    TestBed.configureTestingModule({
      providers: [
        TargetSystemService,
        {
          provide: TsbApiService,
          useValue: {
            client: {
              portal_targetsystem_userconfig_get: jasmine.createSpy('portal_targetsystem_userconfig_get').and.returnValue(Promise.resolve(mockTsbUserConfig))
            }
          }
        }
      ]
    });
    service = TestBed.inject(TargetSystemService);
  });

  it('provides TSB UserConfig', async () => {
    expect((await service.getUserConfig()).CanClaimGroup).toEqual(mockTsbUserConfig.CanClaimGroup);
  });
});
