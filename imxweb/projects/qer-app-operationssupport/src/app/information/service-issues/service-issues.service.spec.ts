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
 * Copyright 2023 One Identity LLC.
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
import { Router } from '@angular/router';
import { of } from 'rxjs';

import { OpsupportSyncJournal, OpsupportSyncShell } from 'imx-api-dpr';
import { TypedEntityCollectionData } from 'imx-qbm-dbts';
import { AppConfigService, ImxTranslationProviderService, imx_SessionService } from 'qbm';
import { ServiceIssueType, ServiceIssueItem } from './service-issue-item';
import { ServiceIssuesService } from './service-issues.service';
import { SystemStatusService } from '../system-status/system-status.service';
import { UnresolvedRefsService } from '../../unresolved-refs/unresolved-refs.service';
import { SyncService } from '../../sync/sync.service';
import { SystemStatusInformation } from '../system-status/system-status-information.interface';

interface TestInput {
  SystemStatus?: SystemStatusInformation[];
  InactiveJobServers?: TypedEntityCollectionData<any>[];
  Frozenjobsbyqueue?: TypedEntityCollectionData<any>[];
  SyncJournal?: TypedEntityCollectionData<any>[];
  SyncDatastore?: TypedEntityCollectionData<any>[];
  SyncDatastoreIssueThreshold?: number;
}

class CallContainer {
  private counter = 0;
  public get ReturnValue(): any {
    if (this.returnvalues) {
      const index = Math.min(this.counter, this.returnvalues.length - 1);
      this.counter++;
      return this.returnvalues[index];
    }
    return {};
  }
  constructor(private returnvalues: any[]) {}
}

interface SpyMethod {
  name: string;
  callContainer: CallContainer;
}

function CreateSpyObj(name: string, methods: SpyMethod[]): any {
  const spyobj = jasmine.createSpyObj(name, methods.map(method => method.name));
  methods.forEach(method => spyobj[method.name].and.callFake(() => Promise.resolve(method.callContainer.ReturnValue)));
  return spyobj;
}

function prepareTestBed(testinput: TestInput = {}) {
  const systemStatusGetResult = new CallContainer(testinput.SystemStatus);
  const syncJournalGetResult = new CallContainer(testinput.SyncJournal);
  const syncDatastoreGetResult = new CallContainer(testinput.SyncDatastore);

  TestBed.configureTestingModule({
    providers: [
      ServiceIssuesService,
      {
        provide: AppConfigService,
        useClass: class {
          Config = {
            NotificationUpdateInterval: 9999,
            DatastoreIssueTreshold: testinput.SyncDatastoreIssueThreshold
          };
        }
      },
      {
        provide: ImxTranslationProviderService,
        useClass: class {
          multilanguageTranslationDict: {};
          Translate = jasmine.createSpy('Translate').and.returnValue(of(''));
        }
      },
      {
        provide: Router,
        useClass: class {
          navigate = jasmine.createSpy('navigate');
        }
      },
      {
        provide: imx_SessionService,
        useClass: class {
          TypedClient = {
            OpsupportQueueFrozenjobsbyqueue: CreateSpyObj('OpsupportQueueFrozenjobsbyqueue', [
              { name: 'Get', callContainer: new CallContainer(testinput.Frozenjobsbyqueue) }
            ]),
            OpsupportJobservers: CreateSpyObj('OpsupportJobservers', [
              { name: 'Get', callContainer: new CallContainer(testinput.InactiveJobServers) }
            ])
          }
        }
      },
      {
        provide: SystemStatusService,
        useClass: class {
          get = jasmine.createSpy('get').and.callFake(() => Promise.resolve(systemStatusGetResult.ReturnValue));
          set = jasmine.createSpy('set').and.returnValue(Promise.resolve({}));
        }
      },
      {
        provide: UnresolvedRefsService,
        useClass: class {
          get = jasmine.createSpy('get').and.callFake(() => Promise.resolve(syncDatastoreGetResult.ReturnValue));
        }
      },
      {
        provide: SyncService,
        useValue: {
          getSyncShell: jasmine.createSpy('getSyncShell').and.returnValue(Promise.resolve({ Data: [], TotalCount: 0 })),
          getSyncJournal:jasmine.createSpy('getSyncJournal').and.callFake(() => Promise.resolve(syncJournalGetResult.ReturnValue)),
          syncShellSchema: OpsupportSyncShell.GetEntitySchema(),
          syncJournalSchema: OpsupportSyncJournal.GetEntitySchema(),
          GetDisplayName: jasmine.createSpy('GetDisplayName').and.returnValue(Promise.resolve('theDisplay'))
        }
      }
    ]
  });

}

describe('ImxServerIssuesService init', () => {
  beforeEach(() => {
    prepareTestBed();
  });

  it('should be created', inject([ServiceIssuesService], (service: ServiceIssuesService) => {
    expect(service).toBeDefined();
  }));
});

const frozenJobQueueEntry1 = { QueueName: { value: 'queue1' }, Count: { value: 1 } };
const frozenJobQueueEntry2 = { QueueName: { value: 'queue2' }, Count: { value: 1 } };

interface TestCase {
  Description: string;
  Input: TestInput;
  Test: (items: ServiceIssueItem[]) => boolean;
}

for (const testcase of [
  {
    Description: 'dbqueue is stopped - creates',
    Input: { SystemStatus: [{ IsDbSchedulerDisabled: true }] },
    Test: items => items.filter(item => item.type === ServiceIssueType.DbSchedulerDisabled).length === 1
  } as TestCase,
  {
    Description: 'jobqueue is stopped - creates',
    Input: { SystemStatus: [{ IsJobServiceDisabled: true }] },
    Test: items => items.filter(item => item.type === ServiceIssueType.JobServiceDisabled).length === 1
  } as TestCase,
  {
    Description: 'compilation is required - creates',
    Input: { SystemStatus: [{ IsCompilationRequired: true }] },
    Test: items => items.filter(item => item.type === ServiceIssueType.CompilationRequired).length === 1
  } as TestCase,
  {
    Description: 'is in maintenance mode - creates',
    Input: { SystemStatus: [{ IsInMaintenanceMode: true }] },
    Test: items => items.filter(item => item.type === ServiceIssueType.MaintenanceMode).length === 1
  } as TestCase,
  {
    Description: 'at least one job service is inactive - creates',
    Input: { InactiveJobServers: [{ totalCount: 1 }] },
    Test: items => items.filter(item => item.type === ServiceIssueType.InactiveServers).length === 1
  } as TestCase,
  {
    Description: 'at least one frozen job exists - creates',
    Input: { Frozenjobsbyqueue: [{ Data: [frozenJobQueueEntry1] }] },
    Test: items => items.filter(item => item.id === frozenJobQueueEntry1.QueueName.value).length === 1
  } as TestCase,
  {
    Description: 'at least one sync issue exists - creates',
    Input: { SyncJournal: [{ totalCount: 1 }] },
    Test: items => items.filter(item => item.type === ServiceIssueType.SyncIssues).length === 1
  } as TestCase,
  {
    Description: 'number of unresolved references higher than threshold - creates',
    Input: { SyncDatastore: [{ totalCount: 1, Data: [0] }], SyncDatastoreIssueThreshold: 0 },
    Test: items => items.filter(item => item.type === ServiceIssueType.UnresolvedRefs).length === 1
  } as TestCase
]) {
  describe('ImxServerIssuesService items - create', () => {
    it(testcase.Description, () => {
      prepareTestBed(testcase.Input);
      inject([ServiceIssuesService], async (service: ServiceIssuesService) => {
        expect(service.items.length).toEqual(0);
        await service.updateItems();
        expect(testcase.Test(service.items)).toEqual(true);
      })();
    });
  });
}

for (const testcase of [
  {
    Description: 'dbqueue is stopped - state remains - updates',
    Input: { SystemStatus: [{ IsDbSchedulerDisabled: true }, { IsDbSchedulerDisabled: true }] },
    Test: items => items.filter(item => item.type === ServiceIssueType.DbSchedulerDisabled).length === 1
  } as TestCase,
  {
    Description: 'dbqueue is started - then stopped - removes',
    Input: { SystemStatus: [{ IsDbSchedulerDisabled: true }, { IsDbSchedulerDisabled: false }] },
    Test: items => items.filter(item => item.type === ServiceIssueType.DbSchedulerDisabled).length === 0
  } as TestCase,
  {
    Description: 'jobqueue is stopped - state remains - updates',
    Input: { SystemStatus: [{ IsJobServiceDisabled: true }, { IsJobServiceDisabled: true }] },
    Test: items => items.filter(item => item.type === ServiceIssueType.JobServiceDisabled).length === 1
  } as TestCase,
  {
    Description: 'jobqueue is started - then stopped - removes',
    Input: { SystemStatus: [{ IsJobServiceDisabled: true }, { IsJobServiceDisabled: false }] },
    Test: items => items.filter(item => item.type === ServiceIssueType.JobServiceDisabled).length === 0
  } as TestCase,
  {
    Description: 'compilation is required - state remains - updates',
    Input: { SystemStatus: [{ IsCompilationRequired: true }, { IsCompilationRequired: true }] },
    Test: items => items.filter(item => item.type === ServiceIssueType.CompilationRequired).length === 1
  } as TestCase,
  {
    Description: 'compilation is required - then not anymore - removes',
    Input: { SystemStatus: [{ IsCompilationRequired: true }, { IsCompilationRequired: false }] },
    Test: items => items.filter(item => item.type === ServiceIssueType.CompilationRequired).length === 0
  } as TestCase,
  {
    Description: 'is in maintenance mode - state remains - updates',
    Input: { SystemStatus: [{ IsInMaintenanceMode: true }, { IsInMaintenanceMode: true }] },
    Test: items => items.filter(item => item.type === ServiceIssueType.MaintenanceMode).length === 1
  } as TestCase,
  {
    Description: 'is in maintenance mode - then not anymore - removes',
    Input: { SystemStatus: [{ IsInMaintenanceMode: true }, { IsInMaintenanceMode: false }] },
    Test: items => items.filter(item => item.type === ServiceIssueType.MaintenanceMode).length === 0
  } as TestCase,
  {
    Description: 'at least one job service is inactive - state remains - updates',
    Input: { InactiveJobServers: [{ totalCount: 1 }, { totalCount: 1 }] },
    Test: items => items.filter(item => item.type === ServiceIssueType.InactiveServers).length === 1
  } as TestCase,
  {
    Description: 'at least one job service is inactive - then not anymore - removes',
    Input: { InactiveJobServers: [{ totalCount: 1 }, { totalCount: 0 }] },
    Test: items => items.filter(item => item.type === ServiceIssueType.InactiveServers).length === 0
  } as TestCase,
  {
    Description: 'at least one frozen job exists - state remains - updates',
    Input: { Frozenjobsbyqueue: [{ Data: [frozenJobQueueEntry1] }, { Data: [frozenJobQueueEntry1] }] },
    Test: items => items.filter(item => item.id === frozenJobQueueEntry1.QueueName.value).length === 1
  } as TestCase,
  {
    Description: 'at least one frozen job exists - then not anymore - removes',
    Input: { Frozenjobsbyqueue: [{ Data: [frozenJobQueueEntry1] }, { Data: [] }] },
    Test: items => items.filter(item => item.id === frozenJobQueueEntry1.QueueName.value).length === 0
  } as TestCase,
  {
    Description: 'at least one frozen job exists in a specific queue - then not anymore - removes only for this queue',
    Input: { Frozenjobsbyqueue: [{ Data: [frozenJobQueueEntry1, frozenJobQueueEntry2] }, { Data: [frozenJobQueueEntry2] }] },
    Test: items =>
      items.filter(item => item.id === frozenJobQueueEntry1.QueueName.value).length === 0 &&
      items.filter(item => item.id === frozenJobQueueEntry2.QueueName.value).length === 1
  } as TestCase,
  {
    Description: 'at least one sync issue exists - state remains - updates',
    Input: { SyncJournal: [{ totalCount: 1 }, { totalCount: 1 }] },
    Test: items => items.filter(item => item.type === ServiceIssueType.SyncIssues).length === 1
  } as TestCase,
  {
    Description: 'at least one sync issue exists - then not anymore - removes',
    Input: { SyncJournal: [{ totalCount: 1 }, { totalCount: 0 }] },
    Test: items => items.filter(item => item.type === ServiceIssueType.SyncIssues).length === 0
  } as TestCase,
  {
    Description: 'number of unresolved references higher than threshold - state remains - updates',
    Input: { SyncDatastore: [{ totalCount: 1 }, { totalCount: 1 }], SyncDatastoreIssueThreshold: 0 },
    Test: items => items.filter(item => item.type === ServiceIssueType.UnresolvedRefs).length === 1
  } as TestCase,
  {
    Description: 'number of unresolved references higher than threshold - then not anymore - removes',
    Input: { SyncDatastore: [{ totalCount: 1 }, { totalCount: 0 }], SyncDatastoreIssueThreshold: 0 },
    Test: items => items.filter(item => item.type === ServiceIssueType.UnresolvedRefs).length === 0
  } as TestCase
]) {
    describe('ImxServerIssuesService items - update or remove', () => {
      beforeEach(() => {
        prepareTestBed(testcase.Input);
      });

      it(testcase.Description, () => {
        inject([ServiceIssuesService], async (service: ServiceIssuesService) => {
          expect(service.items.length).toEqual(0);
          await service.updateItems();
          expect(service.items.length).toBeGreaterThan(0);
          await service.updateItems();
          expect(testcase.Test(service.items)).toEqual(true);
        })();
      });
    });
  }
