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

import { AobApiService } from '../aob-api-client.service';
import { GlobalKpiService } from './global-kpi.service';

describe('GlobalKpiService', () => {
  configureTestSuite(() => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: AobApiService,
          useValue: {
            client: {
              portal_kpi_get: jasmine.createSpy('portal_kpi_get').and.returnValue(Promise.resolve([{ Display: 'dummy' }]))
            }
          }
        }
      ]
    });
  });

  it('should be created', () => {
    const service: GlobalKpiService = TestBed.get(GlobalKpiService);
    expect(service).toBeTruthy();
  });

  it('can get data', async () => {
    const service: GlobalKpiService = TestBed.get(GlobalKpiService);
    const kpiInfo = await service.get();
    expect(kpiInfo).toBeTruthy();
  });

});
