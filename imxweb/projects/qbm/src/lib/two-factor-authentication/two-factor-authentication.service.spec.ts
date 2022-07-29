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

import { Component, NgModule } from '@angular/core';
import { TestBed, inject } from '@angular/core/testing';
import { configureTestSuite } from 'ng-bullet';

import { TwoFactorAuthenticationService } from './two-factor-authentication.service';

@Component({
  template: `<p>works!</p>`
})
class SomeComponent { }
@NgModule({
  declarations: [SomeComponent],
})
class TestModule { }

describe('TwoFactorAuthenticationService', () => {

  configureTestSuite(() => {
    TestBed.configureTestingModule({
      imports: [TestModule],
      providers: [TwoFactorAuthenticationService]
    });
  });

  it('should be created', inject([TwoFactorAuthenticationService], (service: TwoFactorAuthenticationService) => {
    expect(service).toBeTruthy();
  }));

  it('should register a service', inject([TwoFactorAuthenticationService], (service: TwoFactorAuthenticationService) => {
    service.register('Starling', SomeComponent);
    expect(service.Registry['Starling']).toEqual(SomeComponent);
  }));
});
