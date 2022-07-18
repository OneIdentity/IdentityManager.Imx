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
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { configureTestSuite } from 'ng-bullet';
import { MastHeadService } from '../mast-head/mast-head.service';
import { IeWarningService } from './ie-warning.service';

describe('IeWarningService', () => {
  let service: IeWarningService;
  const expectedEnDocPath = 'testhost/imx/doc/OneIM_QER_WebPortal_en-us.html5/OneIM_QER_WebPortal.html';

  configureTestSuite(() => {
    TestBed.configureTestingModule({
      providers: [
        IeWarningService,
        {
          provide: MastHeadService,
          useValue: {
            getDocumentationLink: () => {
              return expectedEnDocPath
            }
          }
        }
      ],
      imports: [
        MatSnackBarModule
      ]
    })
  });

  beforeEach(() => {
    service = TestBed.inject(IeWarningService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('showIe11Banner() tests', () => {
    let storageServiceIsHelperDismissedSpy: jasmine.Spy;
    let alertBannerOpenSpy: jasmine.Spy;
    beforeEach(() => {
      storageServiceIsHelperDismissedSpy = spyOn<any>(service['storageService'], 'isHelperAlertDismissed');
      alertBannerOpenSpy = spyOn<any>(service['alertBanner'], 'open');
      alertBannerOpenSpy.calls.reset();
    });

    describe('when browser is IE', () => {
      it(`should call open on the EuiAlertBannerService with the correct params when the alert
      has not already been dismissed`, async() => {
        const expectedParams = {
          type: 'warning',
          dismissable: true,
          message: `#LDS#Internet Explorer is no longer supported and the application may not work properly. Please use a browser from the following list: <a href='${expectedEnDocPath}#Sources/WebPortalUserGuide/WPORTGettingStart/WPortGettingStart.htm?Highlight=Supported browsers' target='_blank' rel='noopener noreferrer'>#LDS#Supported browsers</a>.`
        };
        spyOnProperty(navigator, 'userAgent').and.returnValue('MSIE');
        storageServiceIsHelperDismissedSpy.and.returnValue(false);
        await service.showIe11Banner();
        expect(alertBannerOpenSpy).toHaveBeenCalledWith(expectedParams);
      });
      it(`should do nothing when the alert has already been dismissed`, async() => {
        storageServiceIsHelperDismissedSpy.and.returnValue(true);
        await service.showIe11Banner();
        expect(alertBannerOpenSpy).not.toHaveBeenCalled();
      });
    });
    describe('when browser is not IE', () => {
      it(`should do nothing when the browser is not IE`, async() => {
        storageServiceIsHelperDismissedSpy.and.returnValue(false);
        await service.showIe11Banner();
        expect(alertBannerOpenSpy).not.toHaveBeenCalled();
      });
    });
  });
});
