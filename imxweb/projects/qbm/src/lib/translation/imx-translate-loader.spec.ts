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

import { TestBed, waitForAsync } from '@angular/core/testing';
import { configureTestSuite } from 'ng-bullet';

import { ImxTranslateLoader } from './imx-translate-loader';
import { imx_SessionService } from '../session/imx-session.service';

describe('imx_TranslateLoader', () => {
  const captions = {
    text1_key: 'text1_value',
    text2_key: 'text2_value'
  } as { [key: string]: string };

  configureTestSuite(() => {
    TestBed.configureTestingModule({
      providers: [
        ImxTranslateLoader,
        {
          provide: imx_SessionService,
          useValue: {
            Client: jasmine.createSpyObj('Client', {
              imx_multilanguage_getcaptions_get: Promise.resolve(captions)
            })
          }
        }
      ]
    });
  });

  it('should be created', () => {
    const service = TestBed.get(ImxTranslateLoader);
    expect(service).toBeTruthy();
  });

  it('should provide translations for LDS strings', waitForAsync(() => {
    const service = TestBed.get(ImxTranslateLoader);
    service.getTranslation(null).subscribe((translations: { [key: string]: string }) => {
      Object.keys(captions).forEach((key: string) => expect(translations['#LDS#' + key]).toEqual(captions[key]));
    });
  }));
});
