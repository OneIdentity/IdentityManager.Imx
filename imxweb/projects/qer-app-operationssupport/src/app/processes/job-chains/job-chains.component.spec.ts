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

import { async, ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { configureTestSuite } from 'ng-bullet';

import { JobChainsComponent } from './job-chains.component';
import { clearStylesFromDOM } from 'qbm';
import { JobChainsService } from './job-chains.service';
import { RoutingMock } from '../../test-utilities/router-mock.spec';
import { EuiLoadingService } from '@elemental-ui/core';
import { OpsupportQueueJobchains } from 'imx-api-qbm';

describe('JobChainsComponent', () => {
  let component: JobChainsComponent;
  let fixture: ComponentFixture<JobChainsComponent>;

  const mockJobChainsService =  {
    Get: jasmine.createSpy('Get').and.returnValue(Promise.resolve({
        Data: [],
        totalCount: 0
    })),
    EntitySchema:OpsupportQueueJobchains.GetEntitySchema()
  };

  configureTestSuite(() => {
    TestBed.configureTestingModule({
      declarations: [
        JobChainsComponent
      ],
      schemas: [
        NO_ERRORS_SCHEMA
      ],
      providers: [
        {
          provide: JobChainsService,
          useValue: mockJobChainsService
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

  beforeEach(async(() => {
    mockJobChainsService.Get.calls.reset();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(JobChainsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterAll(() => {
    clearStylesFromDOM();
  });

  it('should create', () => {
    expect(component).toBeDefined();
  });

  it('refresh is working', fakeAsync(() => {
    component.refresh();
    tick();
    expect(mockJobChainsService.Get).toHaveBeenCalled();
  }));
});
