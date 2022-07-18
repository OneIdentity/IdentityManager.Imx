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
import { OpsupportJobservers } from 'imx-api-qbm';
import { configureTestSuite } from 'ng-bullet';

import { imx_SessionService } from 'qbm';
import { JobServersService } from './job-servers.service';

describe('JobServersService', () => {
  const jobServersCollection = { totalCount: 10 };

  configureTestSuite(() => {
    TestBed.configureTestingModule({
      providers: [
        JobServersService,
        {
          provide: imx_SessionService,
          useClass: class {
            TypedClient = {
              OpsupportJobservers: jasmine.createSpyObj('OpsupportJobservers', {
                GetSchema: () => OpsupportJobservers.GetEntitySchema(),
                Get: Promise.resolve(jobServersCollection)
              })
            }
          }
        }
      ]
    });
  });
});
