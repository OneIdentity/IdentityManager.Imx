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

import { Component, NgModule, ViewContainerRef } from '@angular/core';
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { configureTestSuite } from 'ng-bullet';
import * as TypeMoq from 'typemoq';

import { TwoFactorAuthenticationComponent } from './two-factor-authentication.component';
import { TwoFactorAuthenticationService } from './two-factor-authentication.service';
import { imx_SessionService } from '../session/imx-session.service';

@Component({
  template: `<p>works!</p>`
})
class SomeComponent { }
@NgModule({
  declarations: [SomeComponent],
})
class TestModule { }

describe('TwoFactorAuthenticationComponent', () => {
  let component: TwoFactorAuthenticationComponent;
  let fixture: ComponentFixture<TwoFactorAuthenticationComponent>;

  const register = { 'Starling': SomeComponent };
  const getSessionStateSpy = jasmine.createSpy('getSessionState').and.returnValue(Promise.resolve({
    SecondaryAuthName: Object.keys(register)[0]
  }));

  const viewContainerRefMock = TypeMoq.Mock.ofType<ViewContainerRef>();

  configureTestSuite(() => {
    TestBed.configureTestingModule({
      declarations: [TwoFactorAuthenticationComponent],
      imports: [TestModule],
      providers: [
        {
          provide: imx_SessionService, useClass: class {
            getSessionState = getSessionStateSpy;
          }
        },
        {
          provide: TwoFactorAuthenticationService, useClass: class {
            register = jasmine.createSpy('register');
            Registry = register;
          }
        }
      ]
    });
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TwoFactorAuthenticationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    component.directive = { viewContainerRef : viewContainerRefMock.object };
  });

  it('should create', () => {
    expect(component).toBeTruthy();
    expect(getSessionStateSpy).toHaveBeenCalled();
  });

  it('could be initiated', fakeAsync(() => {
    component.ngOnInit();
    tick();
    // TODO
  }));
});
