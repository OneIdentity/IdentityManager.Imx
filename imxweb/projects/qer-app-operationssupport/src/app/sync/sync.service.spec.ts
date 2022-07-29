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

import { SyncService } from './sync.service';
import { DprApiService } from '../../../dpr-api-client.service';
import { OpsupportSyncShell } from 'imx-api-dpr';

describe('SyncShellService', () => {
  const typedEntityCollection = { totalCount: 10 };

  configureTestSuite(() => {
    TestBed.configureTestingModule({
      providers: [
        SyncService,
        {
          provide: DprApiService,
          useValue: {
            typedClient: {
              OpsupportSyncShell: jasmine.createSpyObj('OpsupportSyncShell', {
                GetSchema: () => OpsupportSyncShell.GetEntitySchema(),
                Get: Promise.resolve(typedEntityCollection)
              }),
              OpsupportSyncJournal: jasmine.createSpyObj('OpsupportSyncJournal', {
                GetSchema: () => OpsupportSyncShell.GetEntitySchema(),
                Get: Promise.resolve(typedEntityCollection)
              })
            }
          }
        }
      ]
    });
  });

  it('should be created', () => {
    expect(TestBed.get(SyncService)).toBeTruthy();
  });

  it('can get display name', inject([SyncService], async (service: SyncService) => {
    const getspy = spyOn(service, 'getSyncShell').and.returnValue(Promise.resolve({ Data: [] }) as any);

    await service.GetDisplayName('dummy');
    expect(getspy).toHaveBeenCalled();

    getspy.calls.reset();
    await service.GetDisplayName('dummy', true);
    expect(getspy).toHaveBeenCalled();
  }));


});

