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
 * Copyright 2021 One Identity LLC.
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

import { ObjectHistoryService } from './object-history.service';
import { imx_SessionService } from 'qbm';
import { SessionServiceSpy } from '../../test-utilities/imx-session.service.spy.spec';

describe('ObjectHistoryService', () => {
  let sessionServiceSpy: SessionServiceSpy = new SessionServiceSpy();

  configureTestSuite(() => {
    TestBed.configureTestingModule({
      providers: [
        ObjectHistoryService,
        {
          provide: imx_SessionService,
          useValue: sessionServiceSpy
        }
      ]
    });
  });

  it('should be created', () => {
    const service: ObjectHistoryService = TestBed.get(ObjectHistoryService);
    expect(service).toBeDefined();
  });

  [
    {description: 'with fetch', fetch: true},
    {description: 'without fetch', fetch: false}
  ].forEach(testcase => {
    it(`gets informations ${testcase.description}`, inject([ObjectHistoryService], async(service: ObjectHistoryService) => {
      await service.get({table: 'dummyTable', uid: 'dummyUid'}, testcase.fetch);
      expect(sessionServiceSpy.Client.opsupport_history_get).toHaveBeenCalledWith('dummyTable', 'dummyUid');
    }));
  });
});
