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
import { EuiSplashScreenService } from '@elemental-ui/core';
import { configureTestSuite } from 'ng-bullet';

import { SplashService } from './splash.service';

describe('SplashService', () => {
  let service: SplashService;

  const euiSplashScreenServiceStub = {
    open: jasmine.createSpy('open'),
    updateState: jasmine.createSpy('updateState'),
    close: jasmine.createSpy('close'),
  };

  configureTestSuite(() => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: EuiSplashScreenService,
          useValue: euiSplashScreenServiceStub
        },
      ]
    });
    service = TestBed.inject(SplashService);
  });

  beforeEach(() => {
    euiSplashScreenServiceStub.open.calls.reset();
    euiSplashScreenServiceStub.updateState.calls.reset();
    euiSplashScreenServiceStub.close.calls.reset();

    service = TestBed.get(SplashService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('init() should be trigger open() from the EuiSplashScreenService', () => {
    service.init({ applicationName: 'TestMessage' });

    expect(euiSplashScreenServiceStub.open).toHaveBeenCalledWith(jasmine.objectContaining({
      applicationName: 'TestMessage'
    }));
  });

  it('update() should be trigger updateState() from the EuiSplashScreenService', async() => {
    await service.update({ applicationName: 'TestMessage' });

    expect(euiSplashScreenServiceStub.updateState).toHaveBeenCalledWith({ applicationName: 'TestMessage' });
  });

  it('close() should be trigger close() from the EuiSplashScreenService', () => {
    service.close();

    expect(euiSplashScreenServiceStub.close).toHaveBeenCalled();
  });

});
