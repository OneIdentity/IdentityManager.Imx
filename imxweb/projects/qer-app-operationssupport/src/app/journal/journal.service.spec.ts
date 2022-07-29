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

import { JournalService } from './journal.service';
import { imx_SessionService } from 'qbm';
import { OpsupportJournal } from 'imx-api-qbm';

describe('ImxJournalService', () => {
  const mockSessionService = {
    TypedClient: {
      OpsupportJournal: jasmine.createSpyObj('OpsupportJournal', {
        GetSchema: () => OpsupportJournal.GetEntitySchema(),
        Get: Promise.resolve({})
      })
    }
  };

  configureTestSuite(() => {
    TestBed.configureTestingModule({
      providers: [
        JournalService,
        {
          provide: imx_SessionService,
          useValue: mockSessionService
        }
      ]
    });
  });

  beforeEach(() => {
    mockSessionService.TypedClient.OpsupportJournal.Get.calls.reset();
  });

  it('should be created', inject([JournalService], (service: JournalService) => {
    expect(service).toBeDefined();
  }));
});
