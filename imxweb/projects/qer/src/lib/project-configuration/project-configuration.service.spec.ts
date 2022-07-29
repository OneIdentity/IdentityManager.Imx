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
import { LoggerTestingModule } from 'ngx-logger/testing';
import { QerApiService } from '../qer-api-client.service';

import { ProjectConfigurationService } from './project-configuration.service';

describe('ProjectConfigurationService', () => {
  const mockSessionService = {
    client: {
      portal_qer_projectconfig_get: jasmine.createSpy('portal_qer_projectconfig_get').and.returnValue(Promise.resolve({
        RiskThresholdHigh: .75,
      })),
      portal_config_get: jasmine.createSpy('portal_config_get').and.returnValue(Promise.resolve({
        VI_Common_EnableNotifications: true,
        EnableImageResizing: true,
        DefaultPageSize: 42,
        DefaultHistoryLengthDays: 42
      }))
    }
  }

  configureTestSuite(() => {
    TestBed.configureTestingModule({
      imports: [
        LoggerTestingModule
      ],
      providers: [
        {
          provide: QerApiService,
          useValue: mockSessionService
        }
      ]
    });
  });

  it('should be created', () => {
    const service: ProjectConfigurationService = TestBed.get(ProjectConfigurationService);
    expect(service).toBeDefined();
  });

  it('retrieves projects configuration', async () => {
    const service: ProjectConfigurationService = TestBed.get(ProjectConfigurationService);
    mockSessionService.client.portal_config_get.calls.reset();
    mockSessionService.client.portal_qer_projectconfig_get.calls.reset();
    expect(await service.getConfig()).toEqual({
      RiskThresholdHigh: .75,
      VI_Common_EnableNotifications: true,
      EnableImageResizing: true,
      DefaultPageSize: 42,
      DefaultHistoryLengthDays: 42
    });
    expect(mockSessionService.client.portal_config_get).toHaveBeenCalled();
    expect(mockSessionService.client.portal_qer_projectconfig_get).toHaveBeenCalled();
  });
});
