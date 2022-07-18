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
import { DateAdapter } from '@angular/material/core';
import { configureTestSuite } from 'ng-bullet';
import { TranslateService } from '@ngx-translate/core';
import { of } from 'rxjs';

import { ImxTranslationProviderService } from './imx-translation-provider.service';
import { LdsReplacePipe } from '../lds-replace/lds-replace.pipe';
import { AppConfigService } from '../appConfig/appConfig.service';

describe('ImxTranslationProviderService', () => {
  let service: ImxTranslationProviderService;

  const translationDict: {
    [key: string]: { [key: string]: string };
  } = {
    'QBM-1': {
      Task: 'Task-translated',
      Processing: 'Processing',
      Waiting: 'Waiting',
      Count: 'Count',
      URL: 'URL',
      Connection: 'Connection',
      'Response time in milliseconds; or -1 if any error occurred.':
        'Response time in milliseconds; or -1 if any error occurred.',
      'Next synchronization': 'Next synchronization',
      Failures: 'Failures',
      'Affected objects': 'Affected objects',
      Name: 'Name',
      'Display name': 'Display name'
    },
    'QBM-2': {
      active: 'active',
      inactive: 'inactive'
    },
    'DPR-3': {
      Information: 'Information',
      Warning: 'Warning',
      Error: 'Error'
    }
  };

  const captions = {
    Timeline_ZoomIn: 'Timeline_ZoomIn_Text',
    Timeline_ZoomOut: 'Timeline_ZoomOut_Text',
    Timeline_MoveLeft: 'Timeline_MoveLeft_Text',
    Timeline_MoveRight: 'Timeline_MoveRight_Text',
    Timeline_ClusterDescription: 'Timeline_ClusterDescription_Text{0}',
    Timeline_ClusterTitle: 'Timeline_ClusterTitle_Text{0}'
  };

  const mockTranslateService = {
    get: jasmine.createSpy('get').and.callFake((key: string) => of(key)),
    getBrowserCultureLang: jasmine.createSpy('getBrowserCultureLang'),
    getDefaultLang: () => 'someLang',
    setDefaultLang: __ => {},
    use: __ => of()
  };

  const mockLdsReplacePipe = {
    transform: jasmine.createSpy('transform')
  };

  configureTestSuite(() => {
    TestBed.configureTestingModule({
      providers: [
        ImxTranslationProviderService,
        {
          provide: AppConfigService,
          useValue: {
            client: jasmine.createSpyObj('client', {
              loadSchema: Promise.resolve({}),
              imx_multilanguage_getcaptions_get: Promise.resolve(captions),
              imx_multilanguage_translations_get: Promise.resolve(translationDict)
            })
          }
        },
        {
          provide: TranslateService,
          useValue: mockTranslateService
        },
        {
          provide: LdsReplacePipe,
          useValue: mockLdsReplacePipe
        },
        {
          provide: DateAdapter,
          useValue: {
            setLocale: jasmine.createSpy('setLocale')
          }
        }
      ]
    });
  });

  beforeEach(() => {
    mockLdsReplacePipe.transform.calls.reset();
    service = TestBed.get(ImxTranslationProviderService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return a translated text', async () => {
    const keyItem = {
      UidColumn: 'QBM-1',
      Key: 'Task'
    };

    await service.init();
    expect(service.GetTranslation(keyItem)).toEqual(translationDict[keyItem.UidColumn][keyItem.Key]);
  });

  it('should not return a translated text', async () => {
    const keyItem = {
      UidColumn: 'QBM-1',
      Key: 'Mask'
    };

    await service.init();
    expect(service.GetTranslation(keyItem)).toBeUndefined();
  });

  it('should provide multilanguage captions', async () => {
    const numOfEvents = 0;

    await service.init();

    expect(service.MultiLanguageCaptions.Timeline_ClusterDescription(numOfEvents))
    .toEqual(captions.Timeline_ClusterDescription.replace('{0}', numOfEvents.toString()));
    expect(service.MultiLanguageCaptions.Timeline_ClusterTitle(numOfEvents))
    .toEqual(captions.Timeline_ClusterTitle.replace('{0}', numOfEvents.toString()));

    expect(service.MultiLanguageCaptions.Timeline_MoveLeft).toEqual(captions.Timeline_MoveLeft);
    expect(service.MultiLanguageCaptions.Timeline_MoveRight).toEqual(captions.Timeline_MoveRight);
    expect(service.MultiLanguageCaptions.Timeline_ZoomIn).toEqual(captions.Timeline_ZoomIn);
    expect(service.MultiLanguageCaptions.Timeline_ZoomOut).toEqual(captions.Timeline_ZoomOut);

    expect(service.MultiLanguageCaptions.Timeline_New).toEqual('New');
    expect(service.MultiLanguageCaptions.Timeline_CreateNewEvent).toEqual('Create new event');
  });

  it('has a Translate method that calls translate get as string', () => {
    const text = "somekey";
    service.Translate(text).subscribe((_: string) => {
      expect(mockTranslateService.get).toHaveBeenCalledWith(text);
      expect(mockLdsReplacePipe.transform).not.toHaveBeenCalled();
    });
  });

  it('has a Translate method that calls translate get - parameters null', () => {
    const text = { key: 'somekey' };
    service.Translate(text).subscribe((_: string) => {
      expect(mockTranslateService.get).toHaveBeenCalledWith(text.key);
      expect(mockLdsReplacePipe.transform).not.toHaveBeenCalled();
    });
  });

  it('has a Translate method that calls translate get and LdsReplace transform - parameters empty', () => {
    const text = { key: 'somekey', parameters: [] };
    service.Translate(text).subscribe((_: string) => {
      expect(mockTranslateService.get).toHaveBeenCalledWith(text.key);
      expect(mockLdsReplacePipe.transform).toHaveBeenCalledWith(text.key);
    });
  });

  it('has a Translate method that calls translate get and LdsReplace transform - with parameter(s)', () => {
    const text = { key: 'somekey', parameters: ['someparameter'] };
    service.Translate(text).subscribe((_: string) => {
      expect(mockTranslateService.get).toHaveBeenCalledWith(text.key);
      expect(mockLdsReplacePipe.transform).toHaveBeenCalledWith(text.key, 'someparameter');
    });
  });
});
