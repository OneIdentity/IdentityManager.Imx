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
import { TsbApiService } from 'tsb';

import { ArcApiService } from '../../services/arc-api-client.service';
import { UnsgroupsService } from './unsgroups.service';

describe('UnsgroupsService', () => {
  let service: UnsgroupsService;

  const mockUnsGroups = [];

  const mockArcApiService = {
    typedClient: {
      PortalRespUnsgroup: {
        Get: jasmine.createSpy('Get').and.returnValue(Promise.resolve({
          totalCount: mockUnsGroups.length,
          Data: mockUnsGroups
        }))
      }
    }
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        UnsgroupsService,
        {
          provide: ArcApiService,
          useValue: mockArcApiService
        },
        {
          provide: TsbApiService,
          useValue: {}
        }
      ]
    });
    service = TestBed.inject(UnsgroupsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('gets unsgroups', async () => {
    const parameters = { filter: [] };
    expect((await service.get(parameters)).totalCount).toEqual(mockUnsGroups.length);
  });
});
