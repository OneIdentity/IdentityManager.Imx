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
 * Copyright 2021 One Identity LLC.
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

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  private messageService: UserMessageService;
  private logger: ClassloggerService;

  constructor(private injector: Injector) { }

  public handleError(error: any): void {
    this.checkInjectedServices();

    if (error instanceof Error) {
      if (error.message != null && error.message.indexOf('\n') !== -1) {
        this.messageService.subject.next({
          text: error.message.substring(0, error.message.indexOf('\n')).replace('Uncaught (in promise):', ''),
          type: 'error'
        });
      } else {
        this.messageService.subject.next({
          text: error.toString(),
          type: 'error'
        });
      }
    } else {
      this.messageService.subject.next({
        text: JSON.stringify(error),
        type: 'error'
      });
    }

    this.logger.error(this, error);
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
