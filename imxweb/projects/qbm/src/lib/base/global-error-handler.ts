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

import { ErrorHandler, Injectable, Injector } from '@angular/core';

import { UserMessageService } from '../user-message/user-message.service';
import { ClassloggerService } from '../classlogger/classlogger.service';
import { HttpErrorResponse } from '@angular/common/http';
import { ErrorService } from './error.service';

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  private messageService: UserMessageService;
  private logger: ClassloggerService;

  constructor(private injector: Injector, private readonly errorService: ErrorService) {}

  private get target() {
    return this.errorService.target;
  }

  public handleError(error: any): void {
    this.checkInjectedServices();

    if (error instanceof HttpErrorResponse) {
      this.handleHttpErrorResponse(error);
    } else if (error instanceof Error) {
      if (error.message != null && error.message.indexOf('\n') !== -1) {
        this.messageService.subject.next({
          text: error.message.substring(0, error.message.indexOf('\n')).replace('Uncaught (in promise):', ''),
          target: this.target,
          type: 'error',
        });
      } else {
        this.messageService.subject.next({
          text: error.toString(),
          target: this.target,
          type: 'error',
        });
      }
    } else {
      this.messageService.subject.next({
        // TODO: do we really want the full error JSON shown to the user?
        text: JSON.stringify(error),
        target: this.target,
        type: 'error',
      });
    }

    this.logger.error(this, error);
  }

  public resetMessage(): void {
    this.checkInjectedServices();
    this.messageService.subject.next(undefined);
  }

  private async handleHttpErrorResponse(error: HttpErrorResponse): Promise<void> {
    const body = error.error;
    var response: any;
    // By default, just use the HTTP status text of the response.
    var text = error.statusText;
    // Angular returns the error as a ArrayBuffer object
    if (body instanceof ArrayBuffer) {
      var t = await new Blob([body]).text();
      var response: any;
      try {
        response = JSON.parse(t);
        // assume that the body of the response is of the ExceptionData type defined by the API
        text = (<any>response[0])?.Message;
      } catch {
        // Cannot parse as JSON? ignore
      }
    }

    this.messageService.subject.next({
      text: text,
      target: this.target,
      type: 'error',
    });
  }

  private checkInjectedServices(): void {
    if (this.messageService == null) {
      this.messageService = this.injector.get(UserMessageService);
    }

    if (this.logger == null) {
      this.logger = this.injector.get(ClassloggerService);
    }
  }
}
