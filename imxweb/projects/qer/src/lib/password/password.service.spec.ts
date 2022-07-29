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
import { configureTestSuite } from 'ng-bullet';

import { QerApiService } from '../qer-api-client.service';
import { PasswordService } from './password.service';

describe('PasswordService', () => {
  let service: PasswordService;


  const qerApiServiceStub = {
    typedClient: {
      PasswordresetPasswordquestions: {
        Get: jasmine.createSpy('Get')
      }
    },
    client:{
      passwordreset_passwords_post: jasmine.createSpy('passwordreset_passwords_post'),
      passwordreset_passwords_get: jasmine.createSpy('passwordreset_passwords_get')
    }
  };

  configureTestSuite(() => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: QerApiService,
          useValue: qerApiServiceStub
        }
      ]
    });
    service = TestBed.inject(PasswordService);
  });

  beforeEach(() => { 
    qerApiServiceStub.typedClient.PasswordresetPasswordquestions.Get.calls.reset();
    qerApiServiceStub.client.passwordreset_passwords_get.calls.reset();
    qerApiServiceStub.client.passwordreset_passwords_post.calls.reset();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
