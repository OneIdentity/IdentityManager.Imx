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
import { configureTestSuite } from 'ng-bullet';
import { of } from 'rxjs';

import { SystemStatusService } from './system-status.service';
import { imx_SessionService } from 'qbm';

describe('imx_QBM_SystemStatusService', () => {
  const dummyResponse = of({
    totalCount: 10,
    data: 'success'
  });

  const ClientSpy = jasmine.createSpyObj('Client', {
    opsupport_systemstatus_get: dummyResponse,
    opsupport_systemstatus_post: dummyResponse
  });

  configureTestSuite(() => {
    TestBed.configureTestingModule({
      providers: [
        SystemStatusService,
        {
          provide: imx_SessionService,
          useClass: class {
            Client = ClientSpy;
          }
        }
      ]
    });
  });

  it('should be created', inject([SystemStatusService], (service: SystemStatusService) => {
    expect(service).toBeDefined();
  }));

  it('should get the current system status', inject([SystemStatusService], (service: SystemStatusService) => {
    service.getStatus();
    expect(ClientSpy.opsupport_systemstatus_get).toHaveBeenCalled();
  }));

  it('should get the current system status', inject([SystemStatusService], (service: SystemStatusService) => {
    service.setStatus(true, true);
    expect(ClientSpy.opsupport_systemstatus_post).toHaveBeenCalled();
  }));
});
