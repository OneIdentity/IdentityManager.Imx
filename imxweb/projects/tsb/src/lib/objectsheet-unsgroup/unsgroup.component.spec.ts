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
import { EuiLoadingService } from '@elemental-ui/core';
import { configureTestSuite } from 'ng-bullet';

import { imx_SessionService, ClassloggerService, clearStylesFromDOM } from 'qbm';
import { QerApiService, UserModelService } from 'qer';

import { UnsGroupObjectSheetComponent } from './unsgroup.component';

describe('UnsGroupObjectSheetComponent', () => {

  const mockSessionService = {};
  const mockQerApiService = {};
  const mockEuiLoadingService = {};
  const mockClassLoggerService = {
    debug: jasmine.createSpy('debug')
  };

  configureTestSuite(() => {
    TestBed.configureTestingModule({
      declarations: [
        UnsGroupObjectSheetComponent
      ],
      providers: [
        {
          provide: UserModelService,
          useValue: {}
        },
        {
          provide: imx_SessionService,
          useValue: mockSessionService
        },
        {
          provide: QerApiService,
          useValue: mockQerApiService
        },
        {
          provide: ClassloggerService,
          useValue: mockClassLoggerService
        },
        {
          provide: EuiLoadingService,
          useValue: mockEuiLoadingService
        }
      ]
    }).compileComponents();
  });

  afterAll(() => {
    clearStylesFromDOM();
  });

  it('should create the app', waitForAsync(() => {
    const fixture = TestBed.createComponent(UnsGroupObjectSheetComponent);
    const app = fixture.debugElement.componentInstance;
    expect(app).toBeTruthy();
  }));
});
