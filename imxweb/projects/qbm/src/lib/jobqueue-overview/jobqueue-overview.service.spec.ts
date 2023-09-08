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

import { TestBed } from '@angular/core/testing';
import { TranslateService } from '@ngx-translate/core';

import { ClassloggerService } from '../classlogger/classlogger.service';
import { AppConfigService } from '../appConfig/appConfig.service';
import { imx_SessionService } from '../session/imx-session.service';
import { JobQueueOverviewService, JobQueueDataSlice, JobQueueGroups } from './jobqueue-overview.service';
import { EntityColumnData, EntityData } from 'imx-qbm-dbts';
import { of } from 'rxjs';
import { EventStreamConfig } from 'imx-api-qbm';

describe('JobQueueOverviewService', () => {
  let service: JobQueueOverviewService;

  // Mock Services
  class Mocks {
    translate = {
      get: jasmine.createSpy('get').and.callFake((key) => of(key.replace('#LDS#', ''))),
    };

    session = {
      SessionState: {
        IsLoggedOut: false,
      },
      Client: jasmine.createSpyObj('Client', {
        opsupport_streamconfig_get: Promise.resolve([]),
      }),
    };

    appConfigService = {};

    logger = {
      debug: jasmine.createSpy(),
      error: jasmine.createSpy(),
    };
  }
  const mocks = new Mocks();

  // Mock Data
  const emptySlice = {} as JobQueueDataSlice;
  const mockUID: string = 'uid';
  const mockName: string = 'Test Queue';
  const mockName2: string = 'Test Queue 2';
  const mockColumn: EntityColumnData = {
    Value: 1,
  };
  const mockEntity: EntityData = {
    Columns: {
      CountFrozen: mockColumn,
      CountOverlimt: mockColumn,
      CountMissing: mockColumn,
      CountFalse: mockColumn,
      CountTrue: mockColumn,
      CountLoaded: mockColumn,
      CountProcessing: mockColumn,
      CountFinished: mockColumn,
      CountHistory: mockColumn,
      CountDelete: mockColumn,
    },
  };
  const mockGroup: JobQueueGroups = {
    Error: mockEntity.Columns.CountFrozen.Value + mockEntity.Columns.CountOverlimt.Value + mockEntity.Columns.CountMissing.Value,
    Waiting: mockEntity.Columns.CountFalse.Value,
    Ready: mockEntity.Columns.CountTrue.Value,
    Processing: mockEntity.Columns.CountLoaded.Value + mockEntity.Columns.CountProcessing.Value,
    Finished: mockEntity.Columns.CountFinished.Value + mockEntity.Columns.CountHistory.Value + mockEntity.Columns.CountDelete.Value,
  };
  const mockUpdate: object = {
    [mockUID]: {
      CountFinished: {
        Value: 10,
      },
    },
  };

  const mockParams: EventStreamConfig = {
    RefreshIntervalSeconds: null,
    HistorySeconds: null,
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: TranslateService,
          useValue: mocks.translate,
        },
        {
          provide: AppConfigService,
          useValue: mocks.appConfigService,
        },
        {
          provide: imx_SessionService,
          useValue: mocks.session,
        },
        {
          provide: ClassloggerService,
          useValue: mocks.logger,
        },
      ],
    });
    service = TestBed.inject(JobQueueOverviewService);
    service.configParams = mockParams;
  });

  it('should be created', () => {
    expect(service).toBeDefined();
  });

  it('should setup, start job loop, and shutdown', async () => {
    service.isAvailable = true; // Pretend as if stream is open
    service.addEntity(mockName, mockEntity);
    await service.setUp();
    expect(service.totalStreamName).toBeDefined();
    service.configParams.RefreshIntervalSeconds = 1; // set sampling rate to 1 second

    await new Promise((r) => setTimeout(r, service.configParams.RefreshIntervalSeconds * 1000 + 500 /* padding */));
    expect(service.getSlice(mockName).Time.length).toBeGreaterThanOrEqual(1);

    service.shutdown();
    expect(service.queueNames.length).toEqual(0);
  });

  it('should return an empty slice for an uninitialized queue', () => {
    service.pushTable();
    expect(service.getSlice(undefined)).toEqual(emptySlice);
  });

  it('should add an entity, compute groups, and get non-empty slice', () => {
    service.addEntity(mockName, mockEntity);
    service.pushTable();
    expect(service.queueNames).toContain(mockName);
    expect(service.computeGroups(mockName)).toEqual(mockGroup);
    expect(service.getSlice(mockName)).not.toEqual(emptySlice);
  });

  it('should add multiple entities, compute totals and return a non-empty slice', () => {
    service.totalStreamName = 'All Queues'; // Have to initialize this since it's done in an async setup
    service.addEntity(mockName, mockEntity);
    service.addEntity(mockName2, mockEntity);
    service.checkTotalExists(mockEntity);
    service.pushTable();
    expect(service.queueNames).toContain(service.totalStreamName);
    expect(service.getSlice(service.totalStreamName)).not.toEqual(emptySlice);
  });

  it('should not add uninteresting data points', () => {
    service.addEntity(mockName, mockEntity);
    // Add two copy points, only one should make it
    service.pushTable();
    service.pushTable();
    expect(service.getSlice(mockName).Time.length).toEqual(1);
  });

  it('should update values and cull old values from stored data', async () => {
    service.addEntity(mockName, mockEntity);
    service.configParams.HistorySeconds = 1; // Change cull time to 1 sec

    service.pushTable();
    service.updateEntites(mockUID, mockName, mockUpdate);
    service.pushTable();
    expect(service.getSlice(mockName).Time.length).toEqual(2);

    // Wait past history duration, add new point and the old should be culled
    await new Promise((r) => setTimeout(r, service.configParams.HistorySeconds * 1000 + 500 /* padding */));
    service.pushTable();
    expect(service.getSlice(mockName).Time.length).toEqual(1);
  });
});
