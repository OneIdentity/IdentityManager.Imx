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

import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { Router } from '@angular/router';
import { configureTestSuite } from 'ng-bullet';

import { JobsGridviewComponent } from './jobs-gridview.component';
import { QueueJobsService } from '../queue-jobs.service';
import { SnackBarService, clearStylesFromDOM, SettingsService } from 'qbm';
import { DummyJobData } from '../../../test-utilities/imx-api-mock.spec';
import { TranslationProviderServiceSpy } from '../../../test-utilities/imx-translation-provider.service.spy.spec';
import { EuiLoadingService, EuiSidesheetService } from '@elemental-ui/core';
import { OpsupportQueueJobs } from 'imx-api-qbm';
import { TranslateModule } from '@ngx-translate/core';

describe('JobsGridviewComponent', () => {
  let component: JobsGridviewComponent;
  let fixture: ComponentFixture<JobsGridviewComponent>;

  const retryJobSpy = jasmine.createSpy('Retry').and.returnValue(Promise.resolve({}));
  const routerNavigateSpy = jasmine.createSpy('navigate');
  const mockTranslationProvider = new TranslationProviderServiceSpy();

  configureTestSuite(() => {
    TestBed.configureTestingModule({
      declarations: [
        JobsGridviewComponent
      ],
      imports: [
        TranslateModule,
        MatMenuModule,
        MatButtonModule
      ],
      providers: [
        {
          provide: EuiSidesheetService,
          useValue: {
            open: jasmine.createSpy('open')
          }
        },
        {
          provide: QueueJobsService,
          useValue: {
           Retry: retryJobSpy,
           EntitySchema: OpsupportQueueJobs.GetEntitySchema(),
           Get: jasmine.createSpy('Get').and.returnValue(Promise.resolve({data:[], totalCount:0}))
          }
        },
        {
          provide: EuiLoadingService,
          useValue: {
            hide: jasmine.createSpy('hide'),
            show: jasmine.createSpy('show')
          }
        },
        {
          provide: Router,
          useClass: class {
            public navigate = routerNavigateSpy;
          }
        },
        {
          provide: SnackBarService,
          useClass: class {
            public open = jasmine.createSpy('open');
            public dismiss = jasmine.createSpy('dismiss');
          }
        },
        {
          provide: SettingsService,
          useValue:{DefaultPageSize: 25}
        }
      ],
      schemas: [
        CUSTOM_ELEMENTS_SCHEMA
      ]
    });
  });

  beforeEach(async(() => {
    mockTranslationProvider.GetColumnDisplay.calls.reset();
    routerNavigateSpy.calls.reset();
    retryJobSpy.calls.reset();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(JobsGridviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterAll(() => {
    clearStylesFromDOM();
  });

  it('should create', () => {
    expect(component).toBeDefined();
  });

  it('identifies job as Frozen', () => {
    let testJob = DummyJobData.getItem({ Uid_Job: 'testjob', Uid_Tree: 'testTree', CombinedStatus: 'FROZEN' });
    let isFrozen = component.isFrozen(testJob);
    expect(isFrozen).toBe(true);

    testJob = DummyJobData.getItem({ Uid_Job: 'testjob', Uid_Tree: 'testTree', CombinedStatus: 'OVERLIMIT' });
    isFrozen = component.isFrozen(testJob);
    expect(isFrozen).toBe(true);
  });

  it('can call retry job', () => {
    component.retryJob(DummyJobData.getItem({ Uid_Job: 'testjob', Uid_Tree: 'treeUid' }));
    expect(retryJobSpy).toHaveBeenCalled();
  });

});
