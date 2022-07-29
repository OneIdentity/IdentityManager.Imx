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

import { imx_SessionService } from 'qbm';
import { QueueTreeService } from './queue-tree.service';
import { QueueJobsService } from '../jobs/queue-jobs.service';
import { ImxApiDtoMock } from '../../test-utilities/imx-api-mock.spec';
import { EuiLoadingService } from '@elemental-ui/core';
import { ReactivateJobMode } from 'imx-api-qbm';

describe('QueueTreeService', () => {


  let service: QueueTreeService;

  const elem = ImxApiDtoMock.CreateOpsupportQueueTree([
    { UID_Job: 'uid1', TaskName: 'TestTask1', UID_JobError: 'uid3', UID_JobSuccess: 'uid2', IsRootJob: true },
    { UID_Job: 'uid2', TaskName: 'TestTask2', UID_JobSuccess: 'uid4', Ready2EXE: 'OVERLIMIT' },
    { UID_Job: 'uid3', TaskName: 'TestTask3', UID_JobError: 'uid5' },
    { UID_Job: 'uid4', TaskName: 'TestTask4', Ready2EXE: 'FINISHED' },
    { UID_Job: 'uid5', TaskName: 'TestTask5', UID_JobSuccess: 'uid4', Ready2EXE: 'FROZEN' }]);

  const retrySpy = jasmine.createSpy('Retry').and.returnValue(Promise.resolve({}));

  configureTestSuite(() => {
    TestBed.configureTestingModule({
      providers: [
        QueueTreeService,
        {
          provide: imx_SessionService,
          useValue: {
            TypedClient: {
              OpsupportQueueTree: jasmine.createSpyObj('OpsupportQueueTree', {
                Get: Promise.resolve({ Data: elem, totalCount: elem.length, tableName: 'dummyTable' })
              })
            }
          }
        },
        {
          provide: QueueJobsService,
          useValue: {
            Retry: retrySpy,
          }
        },
        {
          provide: EuiLoadingService,
          useValue: {
            hide: jasmine.createSpy('hide'),
            show: jasmine.createSpy('show')
          }
        }
      ]
    });
  });

  beforeEach(() => {
    service = TestBed.inject(QueueTreeService);
  });

  // TODO #227277 fix unittests after update on Angular V9
  it('itemsProvider is working', async () => {
    const val = await service.itemsProvider()
    expect(val.length).toBe(elem.length);
  });

  // TODO #227277 fix unittests after update on Angular V9
  it('childItemsProvider is working', async () => {
    await service.LoadItems()
    let val = await service.childItemsProvider(elem[0]);
    expect(val.length).toBe(2);

    val = await service.childItemsProvider(elem[1]);
    expect(val.length).toBe(1);

    val = await service.childItemsProvider(elem[2]);
    expect(val.length).toBe(1);

    val = await service.childItemsProvider(elem[3]);
    expect(val.length).toBe(0);

    val = await service.childItemsProvider(elem[4]);
    expect(val.length).toBe(1);
  });

  it('hasChildItems is working', async () => {
    await service.LoadItems();
    expect(service.hasChildrenProvider(elem[0])).toBe(true);
    expect(service.hasChildrenProvider(elem[1])).toBe(true);
    expect(service.hasChildrenProvider(elem[2])).toBe(true);
    expect(service.hasChildrenProvider(elem[3])).toBe(false);
    expect(service.hasChildrenProvider(elem[4])).toBe(true);
  });

  it('gets total steps', async () => {
    await service.LoadItems();
    expect(service.GetTotalSteps()).toBe(6);
  });

  it('gets complete steps', async () => {
    await service.LoadItems();
    expect(service.GetCompleteSteps()).toBe(2);
  });

  // TODO #227277 fix unittests after update on Angular V9
  it('can be reactivated', async () => {
    await service.LoadItems();
    expect(service.CanBeReactivated()).toBeTruthy();
  });

  it('reactivates the job', async () => {
    await service.LoadItems();
    await service.Reactivate(ReactivateJobMode.Reactivate);
    expect(retrySpy).toHaveBeenCalled();
  });

  it('removes emptyItems', () => {
    const items = ImxApiDtoMock.CreateEntityDataCollection([
      { Display: 'Element1' },
      null,
      { Display: 'Element1' },
      null,
      { Display: 'Element1' },
    ]);
    expect(items.length).toBe(5);
    expect(service.RemoveEmpty(items).length).toBe(3);
  });
});

describe('QueueTreeService Not Frozen', () => {
  let service: QueueTreeService;
  const elem = ImxApiDtoMock.CreateOpsupportQueueTree([
    { UID_Job: 'uid1', TaskName: 'TestTask1', UID_JobError: 'uid3', UID_JobSuccess: 'uid2', IsRootJob: true },
    { UID_Job: 'uid2', TaskName: 'TestTask2', UID_JobSuccess: 'uid4', Ready2EXE: 'FALSE' },
    { UID_Job: 'uid3', TaskName: 'TestTask3', UID_JobError: 'uid5' },
    { UID_Job: 'uid4', TaskName: 'TestTask4', Ready2EXE: 'FINISHED' },
    { UID_Job: 'uid5', TaskName: 'TestTask5', UID_JobSuccess: 'uid4', Ready2EXE: 'FALSE' }]);

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        QueueTreeService,
        {
          provide: imx_SessionService,
          useValue: {
            TypedClient: {
              OpsupportQueueTree: jasmine.createSpyObj('OpsupportQueueTree', {
                Get: Promise.resolve({ Data: elem, totalCount: elem.length, tableName: 'dummyTable' })
              })
            }
          }
        },
        {
          provide: QueueJobsService,
          useClass: class { }
        },
        {
          provide: EuiLoadingService,
          useValue: {
            hide: jasmine.createSpy('hide'),
            show: jasmine.createSpy('show')
          }
        }
      ]
    });
    service = TestBed.inject(QueueTreeService);
  });

  it('not reactivated', async () => {
    await service.LoadItems()
    const resp = await service.Reactivate(ReactivateJobMode.Reactivate);
    expect(resp).toEqual(null);
  });
});
