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

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { configureTestSuite } from 'ng-bullet';

import { PortalApplication } from 'imx-api-aob';
import { clearStylesFromDOM } from 'qbm';
import { AuthenticationRootComponent } from './authentication-root.component';

describe('AuthenticationRootComponent', () => {
  let component: AuthenticationRootComponent;
  let fixture: ComponentFixture<AuthenticationRootComponent>;

  configureTestSuite(() => {
    TestBed.configureTestingModule({
      declarations: [
        AuthenticationRootComponent
      ],
      imports: [
        ReactiveFormsModule
      ]
    });
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AuthenticationRootComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterAll(() => {
    clearStylesFromDOM();
  });

  function createColumn(inititalValue?) {
    return new class {
      constructor(public value) {}
      Column = {
        PutValueStruct: vs => { this.value = vs.DataValue; Promise.resolve(); },
        GetDisplayValue: () => undefined,
        GetValue: () => this.value
      }
    }(inititalValue);
  }

  const authenticationRootValue = 'some value';

  for (const testcase of [
    {
      authenticationRootHelperValue: undefined,
      expected: authenticationRootValue
    },
    {
      authenticationRootHelperValue: '',
      expected: authenticationRootValue
    },
    {
      authenticationRootHelperValue: 'some other value',
      expected: 'some other value'
    }
  ]) {
    it('should create', async () => {
      component.application = {
        IsAuthenticationIntegrated: {},
        AuthenticationRoot: createColumn(authenticationRootValue),
        AuthenticationRootHelper: createColumn(testcase.authenticationRootHelperValue)
      } as PortalApplication;

      await component.ngOnInit();

      expect(component.authenticationRootWrapper.column.GetValue()).toEqual(testcase.expected);
    });
  }
});
