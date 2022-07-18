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

import { TestBed, inject } from '@angular/core/testing';
import { HttpClient } from '@angular/common/http';
import { configureTestSuite } from 'ng-bullet';
import { of } from 'rxjs';

import { AppConfig } from './appconfig.interface';
import { AppConfigService } from './appConfig.service';
import { ClassloggerService } from '../classlogger/classlogger.service';

describe('AppConfig', () => {
  const expectedAppConfig: AppConfig = {
    Basepath: 'dummyBasepath',
    Title: 'dummyTitle',
    WebAppIndex: 'dummyWebAppIndex',
    NotificationUpdateInterval: 0,
    DatastoreIssueTreshold: 0,
    Translation: {
      Langs: ['dummyLang1', 'dummyLang2']
    }
  };

  const httpClientGetSpy = jasmine.createSpy('get').and.returnValue(of(expectedAppConfig));

  configureTestSuite(() => {
    TestBed.configureTestingModule({
      providers: [
        AppConfigService,
        {
          provide: ClassloggerService,
          useValue: {
            info: jasmine.createSpy('info').and.callThrough()
          }
        },
        {
          provide: HttpClient,
          useClass: class {
            get = httpClientGetSpy;
          }
        }
      ]
    });
  });

  it('should be created', inject([AppConfigService], (service: AppConfigService) => {
    expect(service).toBeDefined();
  }));

  it('can be initialized', inject([AppConfigService], async (service: AppConfigService) => {
    spyOn(window, 'fetch').and.returnValue(Promise.resolve({
      status: 200,
      headers: <any>{
        get: jasmine.createSpy('get').and.returnValue(null)
      },
      json: () => Promise.resolve({})
    }) as any);

    const baseUrl = 'http://someurl';

    await service.init(baseUrl);
    expect(httpClientGetSpy).toHaveBeenCalled();
    expect(service.Config).toEqual(expectedAppConfig);
    expect(service.BaseUrl).toEqual(baseUrl);
  }));
});
