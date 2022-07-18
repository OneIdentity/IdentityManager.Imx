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

import { MastHeadService } from '../mast-head/mast-head.service';
import { TestBed } from '@angular/core/testing';
import { configureTestSuite } from 'ng-bullet';
import { AppConfigService } from '../appConfig/appConfig.service';

describe('DeviceStateService', () => {
  let service: MastHeadService;
  let translateCurrentLang: jasmine.Spy;
  const expectedDeDocPath = 'imx/doc/OneIM_QER_WebPortal_de-de.html5/OneIM_QER_WebPortal.html';
  const expectedEnDocPath = 'imx/doc/OneIM_QER_WebPortal_en-us.html5/OneIM_QER_WebPortal.html';

  configureTestSuite(() => {
    TestBed.configureTestingModule({
      providers: [
        MastHeadService,
        {
          provide: AppConfigService,
          useValue: {
            Config: {
              LocalDocPath: {
                'de-DE': expectedDeDocPath,
                'en-US': expectedEnDocPath
              }
            },
            BaseUrl: 'testhost'
          }
        }
      ],
    });
  });

  beforeEach(() => {
    service = TestBed.inject(MastHeadService);
    translateCurrentLang = spyOnProperty<any>(service['translate'], 'currentLang');
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('openDocumentationLink() tests', () => {
    it('should construct the full documentation url and open a new tab with that url', () => {
      translateCurrentLang.and.returnValue('de-De');
      const windowOpenSpy = spyOn(window, 'open');
      const expectedDocUrl = `testhost/${expectedDeDocPath}`;
      service.openDocumentationLink();
      expect(windowOpenSpy).toHaveBeenCalledWith(expectedDocUrl, '_blank');
    });
  });

  describe('getLocaleDocumentationPath() tests', () => {
    it(`should return the documentation path that directly matches the browsers culture if there
    is a direct match on the appConfig LocalDocPath property`, () => {
      translateCurrentLang.and.returnValue('en-US');
      expect(service['getLocaleDocumentationPath']()).toEqual(expectedEnDocPath);

    });
    it(`should return the closest documentation path that matches the browsers language if there
    is no direct match on browesers culture against the appConfig LocalDocPath property`, () => {
      translateCurrentLang.and.returnValue('en-GB');
      expect(service['getLocaleDocumentationPath']()).toEqual(expectedEnDocPath);
    });
    it(`should return the first documentation path from the LocalDocPath property when there are no
    direct or close matches from the browsers language or culture`, () => {
      translateCurrentLang.and.returnValue('es-ES');
      expect(service['getLocaleDocumentationPath']()).toEqual(expectedDeDocPath);
    });
  });
});
