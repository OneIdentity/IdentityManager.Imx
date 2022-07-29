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

import { Component, DebugElement, Input } from '@angular/core';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { configureTestSuite } from 'ng-bullet';

import { DisableControlDirective } from './disable-control.directive';
import { clearStylesFromDOM } from '../testing/clear-styles.spec';

@Component({
  template: `<input [formControl]="form" type="text" [imxDisableControl]="isDisabled">`
})
class DummyComponent {
  @Input() isDisabled: boolean;
  public form = new FormControl('');
}

describe('DisableControlDirective', () => {
  let component: DummyComponent;
  let fixture: ComponentFixture<DummyComponent>;
  let inputEl: DebugElement;

  configureTestSuite(() => {
    TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      declarations: [DummyComponent, DisableControlDirective]
    });
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DummyComponent); (2)
    component = fixture.componentInstance;
    inputEl = fixture.debugElement.query(By.css('input'));
  });

  afterAll(() => {
    clearStylesFromDOM();
  });

  it('should create an instance', () => {
    const directive = new DisableControlDirective(null);
    expect(directive).toBeDefined();
  });

  [true, false].forEach(testcase => {
    it(`is callable with disabled = ${testcase}`, () => {
      component.isDisabled = testcase;
      fixture.detectChanges();
      expect(inputEl.nativeElement.disabled).toBe(testcase);
    })
  });

});
