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

import { TestBed, ComponentFixture } from '@angular/core/testing';
import { Component } from '@angular/core';
import { configureTestSuite } from 'ng-bullet';

import { LdsReplacePipe } from './lds-replace.pipe';

describe('LdsReplacePipe', () => {
  const service = new LdsReplacePipe();

  it('returns null when the input text is null', () => {
    expect(service.transform(null, 'someparametervalue')).toBeNull();
  });

  [
    {
      value: 'text',
      parameters: [],
      expected: 'text'
    },
    {
      value: 'text',
      parameters: ['parameter1'],
      expected: 'text'
    },
    {
      value: 'text{0}',
      parameters: ['parameter1'],
      expected: 'textparameter1'
    },
    {
      value: 'text{0}',
      parameters: [],
      expected: 'text{0}'
    },
    {
      value: 'text_{0}{0}{1}{0}',
      parameters: ['a', 'b'],
      expected: 'text_aaba'
    }
  ].forEach(testcase => {
    const paramDesc = testcase.parameters && testcase.parameters.length > 0 ? testcase.parameters.join(',') : 'empty/null';
    it('returns ' + `${testcase.expected} when value is ${testcase.value} and parameters are ${paramDesc}`, () => {
      expect(service.transform(testcase.value, ...testcase.parameters)).toEqual(testcase.expected);
    });
  });
});

describe('LdsReplacePipe in HTML template', () => {
  @Component({
    template: `
    <span id="text1">{{ 'value' | ldsReplace:value1:value2 }}</span><br>
    <span id="text2">{{ 'value: {0}'| ldsReplace:value1:value2 }}</span><br>
    <span id="text3">{{ 'value1: {0} value2: {1}' | ldsReplace:value1:value2 }}</span><br>
    `})
  class SimpleTestComponent {
    readonly value1 = '1';
    readonly value2 = '2';
  }

  let fixture: ComponentFixture<SimpleTestComponent>;

  configureTestSuite(() => {
    TestBed.configureTestingModule({
      declarations: [
        SimpleTestComponent,
        LdsReplacePipe
      ]
    });
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SimpleTestComponent);
  });

  it('replaces', () => {
    fixture.detectChanges();
    const text1 = document.getElementById('text1');
    expect(text1.innerText).toBe('value');

    const text2 = document.getElementById('text2');
    expect(text2.innerText).toBe('value: ' + fixture.componentInstance.value1);


    const text3 = document.getElementById('text3');
    expect(text3.innerText).toBe('value1: ' + fixture.componentInstance.value1 +
                                ' value2: ' + fixture.componentInstance.value2);
  });
});
