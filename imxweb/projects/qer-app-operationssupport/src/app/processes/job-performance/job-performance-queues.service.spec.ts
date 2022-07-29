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

import { imx_SessionService } from 'qbm';
import { JobPerformanceQueuesService } from './job-performance-queues.service';
import { SessionServiceSpy } from '../../test-utilities/imx-session.service.spy.spec';

describe('imx_QBM_DBAndJobQueuesService', () => {

  let sessionServiceSpy: SessionServiceSpy = new SessionServiceSpy();

  configureTestSuite(() => {
    TestBed.configureTestingModule({
      providers: [
        JobPerformanceQueuesService,
        {
          provide: imx_SessionService,
          useValue: sessionServiceSpy
        }
      ]
    });
  });

  it('should be created', inject([JobPerformanceQueuesService], (service: JobPerformanceQueuesService) => {
    expect(service).toBeDefined();
  }));

  it('should update the items', inject([JobPerformanceQueuesService], async (service: JobPerformanceQueuesService) => {
    sessionServiceSpy.queue = ['dummyQueueName'];
    sessionServiceSpy.init();
    expect(await service.GetItems()).toEqual(sessionServiceSpy.queue);
  }));

});
