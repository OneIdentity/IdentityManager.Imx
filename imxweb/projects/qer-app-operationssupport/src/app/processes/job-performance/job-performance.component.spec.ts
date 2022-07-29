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

import { ComponentFixture, TestBed, fakeAsync, tick, waitForAsync } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { configureTestSuite } from 'ng-bullet';
import { LoggerTestingModule } from 'ngx-logger/testing';
import { MatSelectChange } from '@angular/material/select';
import { EuiLoadingService } from '@elemental-ui/core';

import { JobPerformanceComponent } from './job-performance.component';
import { JobPerformanceQueuesService } from './job-performance-queues.service';
import { clearStylesFromDOM } from 'qbm';
import { JobPerformanceService } from './job-performance.service';
import { OpsupportQueueJobperformance } from 'imx-api-qbm';

describe('JobPerfomanceComponent', () => {
  let component: JobPerformanceComponent;
  let fixture: ComponentFixture<JobPerformanceComponent>;


  const mockJobPerformanceQueuesService = {
    GetItems: jasmine.createSpy('GetItems').and.returnValue(Promise.resolve(['somequeuename']))
  };

  const mockJobPerformanceService = {
    Get: jasmine.createSpy('Get').and.returnValue(Promise.resolve({
      Data: [],
      totalCount: 0
    })),
    EntitySchema: OpsupportQueueJobperformance.GetEntitySchema()
  };

  configureTestSuite(() => {
    TestBed.configureTestingModule({
      imports: [LoggerTestingModule],
      declarations: [
        JobPerformanceComponent
      ],
      schemas: [
        NO_ERRORS_SCHEMA
      ],
      providers: [
        {
          provide: JobPerformanceQueuesService,
          useValue: mockJobPerformanceQueuesService
        },
        {
          provide: EuiLoadingService,
          useValue: {
            hide: jasmine.createSpy('hide'),
            show: jasmine.createSpy('show')
          }
        },
        {
          provide: JobPerformanceService,
          useValue: mockJobPerformanceService
        }
      ]
    });
  });

  beforeEach(waitForAsync(() => {
    mockJobPerformanceQueuesService.GetItems.calls.reset();
    mockJobPerformanceService.Get.calls.reset();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(JobPerformanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterAll(() => {
    clearStylesFromDOM();
  });

  it('should create', () => {
    expect(component).toBeDefined();
  });

  it('could be initialized by angular', fakeAsync(() => {
    component.ngOnInit();
    tick();
    expect(mockJobPerformanceQueuesService.GetItems).toHaveBeenCalled();
  }));

  it('should update JobPerformanceQueue', fakeAsync(() => {
    component.selectionChange({value: 'newValue'} as MatSelectChange);
    tick();
    expect(mockJobPerformanceService.Get).toHaveBeenCalledWith({ StartIndex: 0, PageSize: 20, queue: 'newValue' });
  }));

  it('refresh is working', async () => {
    await component.refresh();
    expect(mockJobPerformanceService.Get).toHaveBeenCalled();
  });
});
