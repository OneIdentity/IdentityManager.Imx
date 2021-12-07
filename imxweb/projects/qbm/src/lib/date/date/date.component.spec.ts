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

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AbstractControl, FormControl, FormsModule, ReactiveFormsModule, ValidationErrors } from '@angular/forms';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { configureTestSuite } from 'ng-bullet';

import { clearStylesFromDOM } from '../../testing/clear-styles.spec';
import { DateComponent } from './date.component';

describe('DateComponent', () => {
  let component: DateComponent;
  let fixture: ComponentFixture<DateComponent>;

  configureTestSuite(() => {
    TestBed.configureTestingModule({
      declarations: [ DateComponent ],
      imports: [
        MatDatepickerModule,
        MatFormFieldModule,
        MatInputModule,
        MatNativeDateModule,
        NoopAnimationsModule,
        FormsModule,
        ReactiveFormsModule
      ]
    });
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DateComponent);
    component = fixture.componentInstance;
  });

  afterAll(() => {
    clearStylesFromDOM();
  });

  [
    { errors: { matDatepickerMin: {} }, text: 'The date you entered is outside of the allowed range.' },
    { errors: { matDatepickerMax: {} }, text: 'The date you entered is outside of the allowed range.' },
    { errors: { matDatepickerParse: {} }, text: 'The value you entered is not a valid date.' },
    { errors: { required: {} }, text: 'This field is mandatory.' },
    { text: '' }
  ].forEach(testcase =>
  it('should provide error texts on failed validation', () => {
    component.control = {
      errors: testcase.errors as ValidationErrors | null
    } as AbstractControl;

    expect(component.validationErrorText.replace('#LDS#','')).toEqual(testcase.text);
  }));
});
