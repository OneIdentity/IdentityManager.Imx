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
import { NGXLogger } from 'ngx-logger';
import { LoggerTestingModule } from 'ngx-logger/testing';
import { configureTestSuite } from 'ng-bullet';

import { ClassloggerService } from './classlogger.service';

describe('ClassloggerService', () => {
  const logSpy = jasmine.createSpy('log');
  const debugSpy = jasmine.createSpy('debug');
  const errorSpy = jasmine.createSpy('error');
  const traceSpy = jasmine.createSpy('trace');
  const warnSpy = jasmine.createSpy('warn');

  const mockLogObject = {
    toString: () => 'message',
    stack: 'some stack trace'
  };

  configureTestSuite(() => {
    TestBed.configureTestingModule({
      imports: [LoggerTestingModule],
      providers: [
        {
          provide: NGXLogger,
          useValue: {
            log: logSpy,
            debug: debugSpy,
            error: errorSpy,
            trace: traceSpy,
            warn: warnSpy
          }
        }
      ]
    });
  });

  beforeEach(() => {
    logSpy.calls.reset();
    debugSpy.calls.reset();
    errorSpy.calls.reset();
    traceSpy.calls.reset();
    warnSpy.calls.reset();
  });

  it('should be created', () => {
    const service: ClassloggerService = TestBed.get(ClassloggerService);
    expect(service).toBeTruthy();
  });

  it('can log', () => {
    const service: ClassloggerService = TestBed.get(ClassloggerService);
    service.log(service, mockLogObject);
    expect(logSpy).toHaveBeenCalledWith(mockLogObject, '\nCaller: ClassloggerService');
    logSpy.calls.reset();
    service.log(service, mockLogObject, 1, 2, 3);
    expect(logSpy).toHaveBeenCalledWith(mockLogObject, 1, 2, 3, '\nCaller: ClassloggerService');
  });

  it('can debug', () => {
    const service: ClassloggerService = TestBed.get(ClassloggerService);
    service.debug(service, mockLogObject);
    expect(debugSpy).toHaveBeenCalledWith(mockLogObject, '\nCaller: ClassloggerService');
    debugSpy.calls.reset();
    service.debug(service, mockLogObject, 1, 2, 3);
    expect(debugSpy).toHaveBeenCalledWith(mockLogObject, 1, 2, 3, '\nCaller: ClassloggerService');
  });

  it('can error', () => {
    const service: ClassloggerService = TestBed.get(ClassloggerService);
    service.error(service, mockLogObject);
    expect(errorSpy).toHaveBeenCalledWith(mockLogObject, '\nCaller: ClassloggerService');
    errorSpy.calls.reset();
    service.error(service, mockLogObject, 1, 2, 3);
    expect(errorSpy).toHaveBeenCalledWith(mockLogObject, 1, 2, 3, '\nCaller: ClassloggerService');
  });

  it('can trace', () => {
    const service: ClassloggerService = TestBed.get(ClassloggerService);
    service.trace(service, mockLogObject);
    expect(traceSpy).toHaveBeenCalledWith(mockLogObject, '\nCaller: ClassloggerService');
    traceSpy.calls.reset();
    service.trace(service, mockLogObject, 1, 2, 3);
    expect(traceSpy).toHaveBeenCalledWith(mockLogObject, 1, 2, 3, '\nCaller: ClassloggerService');
  });

  it('can warn', () => {
    const service: ClassloggerService = TestBed.get(ClassloggerService);
    service.warn(service, mockLogObject);
    expect(warnSpy).toHaveBeenCalledWith(mockLogObject, '\nCaller: ClassloggerService');
    warnSpy.calls.reset();
    service.warn(service, mockLogObject, 1, 2, 3);
    expect(warnSpy).toHaveBeenCalledWith(mockLogObject, 1, 2, 3, '\nCaller: ClassloggerService');
  });
});
