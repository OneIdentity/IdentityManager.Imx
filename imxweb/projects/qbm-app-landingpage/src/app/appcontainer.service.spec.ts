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

import { AppcontainerService } from './appcontainer.service';
import { environment } from '../environments/environment';
import { AppConfigService } from 'qbm';

[false, true].forEach(environmentIsProduction => {
  describe('AppcontainerService Constructor with environmentIsProduction=' + environmentIsProduction, () => {
    let service: AppcontainerService;

    beforeEach(() => {
      service = TestBed.configureTestingModule({
        providers: [
          AppcontainerService,
          {
            provide: AppConfigService,
            useClass: class {
              public Config = {
                Basepath: '',
                Title: '',
                WebAppIndex: ''
              };
            }
          }
        ]
      }).get(AppcontainerService);

      environment.production = environmentIsProduction;
    });

    it('should be created', () => {
      expect(service).toBeTruthy();
    });
  });
});

describe('AppcontainerService Methods', () => {
  let service: AppcontainerService;

  const nodeAppInfo = [{ Name: 'name', Description: 'description' }];

  const appConfigServiceStub = {
    Config: {
      Basepath: '',
      Title: '',
      WebAppIndex: ''
    },
    client: {
      imx_applications_get: jasmine.createSpy('imx_applications_get').and.returnValue(Promise.resolve(nodeAppInfo))
    }
  };

  beforeEach(() => {
    appConfigServiceStub.client.imx_applications_get.calls.reset();

    service = TestBed.configureTestingModule({
      providers: [
        AppcontainerService,
        {
          provide: AppConfigService,
          useValue: appConfigServiceStub
        }
      ]
    }).get(AppcontainerService);
  });

  it('has a method getAppContainers that returns an AppContainer array', async () => {
    const obj = await service.getAppContainers();
    expect(appConfigServiceStub.client.imx_applications_get).toHaveBeenCalled();
    expect(obj.length).toEqual(nodeAppInfo.length);
    expect(obj[0].link).toContain(`/html/${nodeAppInfo[0].Name}`);
    expect(obj[0].app).toEqual(nodeAppInfo[0]);
  });
});
