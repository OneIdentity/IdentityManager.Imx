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

import { QueueJobsService } from './queue-jobs.service';
import { imx_SessionService } from 'qbm';
import { ReactivateJobMode } from 'imx-api-qbm';

describe('QueueJobsService', () => {
  const jobsEntityCollection = { totalCount: 10 };
  const mockSessionService = {
    Client: jasmine.createSpyObj('Client', {
      opsupport_queue_reactivatejob_post: Promise.resolve({})
    }),
    TypedClient: {
      OpsupportQueueJobs: jasmine.createSpyObj('OpsupportQueueJobs', {
        Get: Promise.resolve(jobsEntityCollection)
      }),
    }
  };

  configureTestSuite(() => {
    TestBed.configureTestingModule({
      providers: [
        QueueJobsService,
        {
          provide: imx_SessionService,
          useValue: mockSessionService
        }
      ]
    });
  });

  beforeEach(() => {
    mockSessionService.Client.opsupport_queue_reactivatejob_post.calls.reset();
    mockSessionService.TypedClient.OpsupportQueueJobs.Get.calls.reset();
  });

  it('can fetch jobs', inject([QueueJobsService], async (service: QueueJobsService) => {
    const entity = await service.Get({});
    expect(entity.totalCount).toEqual(jobsEntityCollection.totalCount);
  }));

  it('can fetch jobs with sort and filter', inject([QueueJobsService], async (service: QueueJobsService) => {
    const filter = [
      {
        ColumnName: 'someColumnName',
        Type: 0,
        CompareOp: 1,
        Value1: 'someValue'
      }
    ];
    const entity = await service.Get({ filter });
    expect(entity.totalCount).toEqual(jobsEntityCollection.totalCount);
  }));

  it('can reactivate the job with the given uid', inject([QueueJobsService], async (service: QueueJobsService) => {
    const jobUids = ['uid'];
    await service.Post(jobUids);
    expect(mockSessionService.Client.opsupport_queue_reactivatejob_post).toHaveBeenCalledWith({
      Mode: ReactivateJobMode.Reactivate,
      UidJobs: jobUids
    });
  }));
});