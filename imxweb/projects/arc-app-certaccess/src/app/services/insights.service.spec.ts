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
import { ArcGovernanceTestBed } from '../../test/arc-governance-test-bed';
import { AppInsightsService } from './insights.service';
import { AppInsights } from 'applicationinsights-js';
import { ProjectConfigurationService } from 'qer';
import { NavigationEnd } from '@angular/router';
import { of } from 'rxjs';
import { fakeAsync, flush } from '@angular/core/testing';

xdescribe('AppInsightsService', () => {
  let service: AppInsightsService;

  let mockProjectConfigurationService = {
    getConfig: () => {
      return Promise.resolve({
        AppInsightsKey: 'test',
        VI_Common_EnableNotifications: false,
        EnableImageResizing: false,
        DefaultPageSize: 10,
        DefaultHistoryLengthDays: 10,
      });
    },
  };

  ArcGovernanceTestBed.configureTestingModule({
    imports: [],
    providers: [
      AppInsightsService,
      {
        provide: ProjectConfigurationService,
        useValue: mockProjectConfigurationService,
      },
    ],
  });

  beforeEach(() => {
    service = TestBed.inject(AppInsightsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('setup() should call downloadAndSetup()', fakeAsync(() => {
    const mockEvent = new NavigationEnd(0, 'https://localhost/login', 'https://localhost/login');
    const mockAppInsightsDownloadSpy = spyOn(AppInsights, 'downloadAndSetup');
    const mockAppInsightsQueueSpy = spyOn(AppInsights['queue'], 'push');
    const routerEventsSpy = spyOn<any>(service['router']['events'], 'subscribe').and.returnValue(of(mockEvent));
    service.setup();
    flush();
    expect(mockAppInsightsDownloadSpy).toHaveBeenCalledWith({ instrumentationKey: 'test' });
    expect(mockAppInsightsQueueSpy).toHaveBeenCalled();
    expect(routerEventsSpy).toHaveBeenCalled();
  }));
});
