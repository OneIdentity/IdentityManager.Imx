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

import { OpsupportQueueJobperformance } from 'imx-api-qbm';
import { JobPerformanceService } from './job-performance.service';
import { testTypedEntityReadOnlyProvider } from '../../test-utilities/typed-entity-provider.spec';
import { ImxApiDtoMock } from '../../test-utilities/imx-api-mock.spec';

describe('QueueJobPerformanceService', () => {
  const data = ImxApiDtoMock.CreateOpsupportQueueJobperformanceCollection([{ Uid_Job: '0' }]);
  testTypedEntityReadOnlyProvider({
    type: JobPerformanceService,
    entityType: OpsupportQueueJobperformance,
    data: data,
    parameters: { queueName: '' },
    typedClient: {
      OpsupportQueueJobperformance: jasmine.createSpyObj('OpsupportQueueJobperformance', {
        GetSchema: () => OpsupportQueueJobperformance.GetEntitySchema(),
        Get: Promise.resolve({ Data: data, totalCount: data.length })
      })
    }
  });
});
