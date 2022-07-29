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

import { SystemInfoService } from './system-info.service';
import { imx_SessionService } from '../session/imx-session.service';

describe('SystemInfoService', () => {
  const mockSessionService = {
    Client: {
      imx_system_get: jasmine.createSpy('imx_system_get').and.returnValue(Promise.resolve({}))
    }
  };

  configureTestSuite(() => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: imx_SessionService,
          useValue: mockSessionService
        }
      ]
    })
  });

  it('provides a get method with caching for system info', async () => {
    const service: SystemInfoService = TestBed.get(SystemInfoService);

    mockSessionService.Client.imx_system_get.calls.reset();
    expect(await service.get()).toBeDefined();
    expect(mockSessionService.Client.imx_system_get).toHaveBeenCalled();

    mockSessionService.Client.imx_system_get.calls.reset();
    expect(await service.get()).toBeDefined();
    expect(mockSessionService.Client.imx_system_get).not.toHaveBeenCalled();
  });
});
