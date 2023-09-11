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

import { TestBed, inject, fakeAsync, tick, discardPeriodicTasks } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of } from 'rxjs';

import { NotificationsService } from './notifications.service';
import { TypedEntityCollectionData } from 'imx-qbm-dbts';
import { NotificationIssueType } from './notification-issue-item';
import { imx_SessionService, ImxTranslationProviderService } from 'qbm';

interface JournalStatCounter {
  Errors?: number;
  Warnings?: number;
}

interface TestInput {
  Frozenjobs?: TypedEntityCollectionData<any>;
  JournalStat?: JournalStatCounter;
}

interface TestCase {
  Description?: string;
  TestInput: TestInput[];
  ExpectedNotificationItems?: NotificationIssueType[];
}

function* generator(values: any[]): any {
  if (values) {
    for (const value of values) {
      yield value;
    }
  }
}

interface SpyMethod {
  name: string;
  getValue: () => any;
}

function CreateSpyObj(name: string, methods: SpyMethod[]): any {
  const spyobj = jasmine.createSpyObj(name, methods.map(method => method.name));
  methods.forEach(method => spyobj[method.name].and.callFake(() => Promise.resolve(method.getValue())));
  return spyobj;
}

describe('NotificationsService', () => {
  function prepareTestBed(testCase: TestCase = { TestInput: [{}] }) {
    const frozenjobs = generator(testCase.TestInput.map(item => item.Frozenjobs));
    const journalStat = generator(testCase.TestInput.map(item => item.JournalStat));
    TestBed.configureTestingModule({
      providers: [
        NotificationsService,
        {
          provide: imx_SessionService,
          useClass: class {
            Client = CreateSpyObj('Client', [
              {
                name: 'opsupport_journal_stat_get',
                getValue: () => journalStat.next().value
              }
            ]);
            TypedClient = {
              OpsupportQueueFrozenjobs: CreateSpyObj('OpsupportQueueFrozenjobs', [
                {
                  name: 'Get',
                  getValue: () => frozenjobs.next().value
                }
              ])
            };
          }
        },
        {
          provide: Router,
          useClass: class {
            navigate = jasmine.createSpy('navigate');
          }
        }
      ]
    });
  }

  beforeEach(() => {
    prepareTestBed();
  });

  it('should be created', inject([NotificationsService], (service: NotificationsService) => expect(service).toBeTruthy()));

  [
    {
      Description: 'with a non-empty frozenjobs collection and without errors/warnings in the journal',
      TestInput: [{ Frozenjobs: { totalCount: 1 } }],
      ExpectedNotificationItems: [NotificationIssueType.FrozenJobsSinceYesterday]
    } as TestCase,
    {
      Description: 'with an empty frozenjobs collection and without errors/warnings in the journal',
      TestInput: [{}],
      ExpectedNotificationItems: []
    } as TestCase,
    {
      Description: 'with a non-empty frozenjobs collection and with errors/warnings in the journal',
      TestInput: [{ Frozenjobs: { totalCount: 1 }, JournalStat: { Errors: 1, Warnings: 0 } }],
      ExpectedNotificationItems: [NotificationIssueType.FrozenJobsSinceYesterday, NotificationIssueType.SystemJournalSinceYesterday]
    } as TestCase,
    {
      Description: 'with an empty frozenjobs collection and with errors in the journal',
      TestInput: [{ JournalStat: { Errors: 1, Warnings: 0 } }],
      ExpectedNotificationItems: [NotificationIssueType.SystemJournalSinceYesterday]
    } as TestCase,
    {
      Description: 'with an empty frozenjobs collection and with warnings in the journal',
      TestInput: [{ JournalStat: { Errors: 0, Warnings: 1 } }],
      ExpectedNotificationItems: [NotificationIssueType.SystemJournalSinceYesterday]
    } as TestCase
  ].forEach(testcase => {
    describe('should update all items', () => {
      beforeEach(() => prepareTestBed(testcase));

      it(
        testcase.Description,
        inject(
          [NotificationsService],
          fakeAsync((service: NotificationsService) => {
            service.updateItems().then(_ => {
              expect(service.items.map(item => item.type)).toEqual(testcase.ExpectedNotificationItems);
            });

            tick();
            discardPeriodicTasks();
          })
        )
      );
    });
  });

  [
    {
      Description: 'with a non-empty frozenjobs collection - then empty',
      TestInput: [{ Frozenjobs: { totalCount: 1 } }, {}],
      ExpectedNotificationItems: []
    } as TestCase,
    {
      Description: 'with errors/warnings in the journal - then empty',
      TestInput: [{ JournalStat: { Errors: 1, Warnings: 0 } }, {}],
      ExpectedNotificationItems: []
    } as TestCase,
    {
      Description: 'with a non-empty frozenjobs collection and with errors/warnings in the journal - then no emtpy frozenjobs collection',
      TestInput: [{ Frozenjobs: { totalCount: 1 }, JournalStat: { Errors: 1, Warnings: 0 } }, { JournalStat: { Errors: 1, Warnings: 0 } }],
      ExpectedNotificationItems: [NotificationIssueType.SystemJournalSinceYesterday]
    } as TestCase
  ].forEach(testcase => {
    describe('should remove items', () => {
      beforeEach(() => prepareTestBed(testcase));

      it(
        testcase.Description,
        inject(
          [NotificationsService],
          fakeAsync((service: NotificationsService) => {
            service.updateItems().then(_ => {
              expect(service.items.length).toBeGreaterThan(0);
              service.updateItems().then(_0 => {
                expect(service.items.map(item => item.type)).toEqual(testcase.ExpectedNotificationItems);
              });
            });

            tick();
            discardPeriodicTasks();
          })
        )
      );
    });
  });
});
