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
import { TsbTestBed } from './test/tsb-test-bed.spec';
import { DeHelperService } from './de-helper.service';
import { CollectionLoadParameters } from 'imx-qbm-dbts';
import { TsbApiService } from './tsb-api-client.service';

describe('DeHelperService', () => {
  let service: DeHelperService;

  const mockTsbApiService = {
    typedClient: {
      PortalTargetsystemUnsSystem: {
        Get: jasmine.createSpy('Get').and.returnValue(Promise.resolve({ Data: [] })),
      },
      PortalTargetsystemUnsContainer: {
        Get: jasmine.createSpy('Get').and.returnValue(Promise.resolve({ Data: [] })),
      },
    },
  };
  const navigationState: CollectionLoadParameters = { PageSize: 100000, StartIndex: 0 };

  TsbTestBed.configureTestingModule({
    providers: [
      {
        provide: TsbApiService,
        useValue: mockTsbApiService,
      },
      DeHelperService,
    ]
  });

  beforeEach(() => {
    service = TestBed.inject(DeHelperService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getAuthorityData()', () => {
    it('should make a call to get the authority data', async () => {
      const data = await service.getAuthorityData();
      expect(data).toEqual({ hasAuthorities: false, authorities: [] });
      expect(mockTsbApiService.typedClient.PortalTargetsystemUnsSystem.Get).toHaveBeenCalled();
    });
  });

  describe('getContainers()', () => {
    it('should make a call to get the containers', async () => {
      expect(await service.getContainers(navigationState)).toBeDefined();
      expect(mockTsbApiService.typedClient.PortalTargetsystemUnsContainer.Get).toHaveBeenCalled();
    });
  });
});
