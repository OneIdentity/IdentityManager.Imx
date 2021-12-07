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

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, ActivatedRoute } from '@angular/router';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { configureTestSuite } from 'ng-bullet';
import * as TypeMoq from 'typemoq';

import { TypedEntityCollectionData } from 'imx-qbm-dbts';
import { FilterTileComponent, imx_SessionService, clearStylesFromDOM } from 'qbm';
import { JobsComponent } from './jobs.component';
import { RoutingMock } from '../../test-utilities/router-mock.spec';
import { SessionServiceSpy } from '../../test-utilities/imx-session.service.spy.spec';
import { SyncService } from '../../sync/sync.service';
import { EuiLoadingService } from '@elemental-ui/core';
import { QueueJobsService } from './queue-jobs.service';
import { OpsupportQueueJobs } from 'imx-api-qbm';

describe('JobsComponent', () => {
  let component: JobsComponent;
  let fixture: ComponentFixture<JobsComponent>;

  const dummyTypedEntityCollection: TypedEntityCollectionData<any> = {
    tableName: 'dummyTable',
    totalCount: 0,
    Data: []
  };


  const syncShellServiceGetSpy = jasmine.createSpy('getSyncShell').and.returnValue(Promise.resolve(dummyTypedEntityCollection));
  const syncJournalServiceGetSpy = jasmine.createSpy('getSyncJournal').and.returnValue(Promise.resolve(dummyTypedEntityCollection));
  let sessionServiceSpy: SessionServiceSpy = new SessionServiceSpy();

  const filter = [
    {
      ColumnName: 'someColumnName',
      Type: 0,
      CompareOp: 1,
      Value1: 'someValue'
    }
  ];

  function BuildFilterTile(isChecked: boolean, groupName: string): FilterTileComponent {
    const filterTile = TypeMoq.Mock.ofType<FilterTileComponent>();
    if (!isChecked) {
      filterTile.setup(t => t.isChecked).returns(() => false);
    }
    filterTile.setup(t => t.groupName).returns(() => groupName);
    return filterTile.object;
  }
  const retryJobSpy = jasmine.createSpy('Post').and.returnValue(Promise.resolve({}));

  configureTestSuite(() => {
    TestBed.configureTestingModule({
      declarations: [
        JobsComponent
      ],
      schemas: [
        NO_ERRORS_SCHEMA
      ],
      providers: [
        {
          provide: imx_SessionService,
          useValue: sessionServiceSpy
        },
        {
          provide: EuiLoadingService,
          useValue: {
            hide: jasmine.createSpy('hide'),
            show: jasmine.createSpy('show')
          }
        }, {
          provide: QueueJobsService,
          useValue: {
            Post: retryJobSpy,
            EntitySchema: OpsupportQueueJobs.GetEntitySchema(),
            Get: jasmine.createSpy('Get').and.returnValue(Promise.resolve({ data: [], totalCount: 0 }))
          }
        },
        {
          provide: ActivatedRoute, useValue: RoutingMock.GetActiveRouteMock(null, null, JSON.stringify(filter))
        },
        {
          provide: SyncService,
          useValue: {
            getSyncShell: syncShellServiceGetSpy,
            getSyncJournal: syncJournalServiceGetSpy,
          },
        }
      ]
    });
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(JobsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterAll(() => {
    clearStylesFromDOM();
  });

  it('should create', () => {
    expect(component).toBeDefined();
  });

  it('can call refresh', async () => {
    await component.refresh();
    expect(syncShellServiceGetSpy).toHaveBeenCalled();
  });

  [
    { Tile: BuildFilterTile(false, 'frozen'), Description: 'unchecked frozen tile' },
    { Tile: BuildFilterTile(true, 'frozen'), Description: 'checked frozen tile' },
    { Tile: BuildFilterTile(false, 'synchFilter'), Description: 'unchecked sync filter tile' },
    { Tile: BuildFilterTile(true, 'synchFilter'), Description: 'checked sync filter tile' }
  ]
    .forEach(testcase => {
      it('handles tile click events with' + testcase.Description, () => {
        component.handleCheckClick(testcase.Tile);
      });
    });
});
