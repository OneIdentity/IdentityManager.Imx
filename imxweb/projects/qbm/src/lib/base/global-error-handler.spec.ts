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
import { configureTestSuite } from 'ng-bullet';
import { LoggerTestingModule } from 'ngx-logger/testing';
import { Subject } from 'rxjs';

import { GlobalErrorHandler } from './global-error-handler';
import { UserMessageService } from '../user-message/user-message.service';
import { Message } from '../user-message/message.interface';
import { ServerExceptionError } from './server-exception-error';
import { ServerError } from './server-error';
import { clearStylesFromDOM } from '../testing/clear-styles.spec';

describe('GlobalErrorHandler', () => {
  let message: Message = undefined;
  const userMessageServiceStub = {
    subject: new Subject<Message>()
  };
  userMessageServiceStub.subject.subscribe(m => message = m);

  configureTestSuite(() => {
    TestBed.configureTestingModule({
      imports: [LoggerTestingModule],
      providers: [
        GlobalErrorHandler,
        {
          provide: UserMessageService,
          useValue: userMessageServiceStub
        }
      ]
    });
  });

  beforeEach(() => {
    message = undefined;
  });

  afterAll(() => {
    clearStylesFromDOM();
  });

  it('should be created', inject([GlobalErrorHandler], (service: GlobalErrorHandler) => {
    expect(service).toBeDefined();
  }));

  it('should handle error', inject([GlobalErrorHandler], (service: GlobalErrorHandler) => {
    const messageText = 'This is an error';
    const expectedErrorMessage = `Error: ${messageText}`;
    const errorDummy = new Error(messageText);
    service.handleError(errorDummy);
    expect(message.text).toEqual(expectedErrorMessage);
    expect(message.type).toEqual('error');
  }));

  it('should handle imx error', inject([GlobalErrorHandler], (service: GlobalErrorHandler) => {
    const messageText = 'This is an error';
    const expectedErrorMessage = messageText;
    const errorDummy = new ServerError(messageText);
    service.handleError(errorDummy);
    expect(message.text).toEqual(expectedErrorMessage);
    expect(message.type).toEqual('error');
  }));

  it('should handle server error', inject([GlobalErrorHandler], (service: GlobalErrorHandler) => {
    const exceptionData = {
      Level: 0,
      Number: 999,
      Message: 'This is an error'
    };
    const expectedErrorMessage = `${exceptionData.Message} [${exceptionData.Number}]`;
    const errorDummy = new ServerExceptionError([exceptionData]);
    service.handleError(errorDummy);
    expect(message.text).toEqual(expectedErrorMessage);
    expect(message.type).toEqual('error');
  }));

  it('should handle any', inject([GlobalErrorHandler], (service: GlobalErrorHandler) => {
    const anyDummy = { error: 42, message: 'hallo', property23: 'value123' };
    service.handleError(anyDummy);
    expect(message.text).toEqual(JSON.stringify(anyDummy));
    expect(message.type).toEqual('error');
  }));
});
