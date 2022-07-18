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

import { EventEmitter } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { configureTestSuite } from 'ng-bullet';
import { LoggerTestingModule } from 'ngx-logger/testing';

import { EditMultiLimitedValueComponent } from './edit-multi-limited-value.component';
import { IEntityColumn, LimitedValueData, ValType } from 'imx-qbm-dbts';
import { clearStylesFromDOM } from '../../testing/clear-styles.spec';
import { DisableControlModule } from '../../disable-control/disable-control.module';
import { MultiValueService } from '../../multi-value/multi-value.service';

function createColumnStub(defaultValue: string, limited = [], canEdit = true, minlength = 0): IEntityColumn {
  let currentValue = defaultValue;

  return {
    GetDisplayValue: () => currentValue != null ? `Display for ${currentValue}` : '',
    GetValue: () => currentValue,
    PutValue: async value => {
      currentValue = value;
    },
    GetMetadata: () => ({
      CanEdit: () => canEdit,
      GetLimitedValues: () => BuildLimitedValues(limited),
      GetMinLength: () => minlength,
      GetType: () => ValType.String,
      GetDisplay: () => undefined
    })
  } as IEntityColumn;
}

function BuildLimitedValues(limited: any[]): ReadonlyArray<LimitedValueData> {
  return limited.map(element => ({ Value: element, Description: `${element}` }));
}

describe('EditMultiLimitedValueComponent', () => {
  let component: EditMultiLimitedValueComponent;
  let fixture: ComponentFixture<EditMultiLimitedValueComponent>;

  const multiValueDelimMock = '|';

  configureTestSuite(() => {
    TestBed.configureTestingModule({
      imports: [
        DisableControlModule,
        FormsModule,
        MatCheckboxModule,
        MatFormFieldModule,
        MatInputModule,
        NoopAnimationsModule,
        LoggerTestingModule,
        ReactiveFormsModule
      ],
      providers: [
        {
          provide: MultiValueService,
          useValue: {
            getValues: jasmine.createSpy('getValues').and.callFake(value => value ? value.split(multiValueDelimMock) : undefined),
            getMultiValue: jasmine.createSpy('getMultiValue').and.callFake(values => values.join(multiValueDelimMock))
          }
        }
      ],
      declarations: [ EditMultiLimitedValueComponent ]
    });
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EditMultiLimitedValueComponent);
    component = fixture.componentInstance;
  });

  afterAll(() => {
    clearStylesFromDOM();
  });

  [
    { isReadOnly: false, description: 'with string editor' },
    { isReadOnly: true, description: 'with string viewer' },
  ].forEach(testcase => {
    it(`should create ${testcase.description}`, () => {
      const cdr = {
        column: createColumnStub('a', ['a', 'b', 'c']),
        isReadOnly: () => testcase.isReadOnly
      };
      const expectedValue = cdr.column.GetValue();
      component.bind(cdr);
      expect(component.columnContainer.value).toEqual(expectedValue);
    });
  });

  it('can handle empty value', () => {
    const values = ['a', 'b', 'c'];
    const cdr = {
      column: createColumnStub(undefined, values),
      isReadOnly: () => false
    };
    component.bind(cdr);
    expect(component.columnContainer.value).toBeUndefined();
    expect(component.columnContainer.limitedValuesContainer.values.length).toEqual(values.length);
  });

  [
    { canEdit: true, select: true },
    { canEdit: true, select: false },
    { canEdit: false, select: true }
  ].forEach(testcase =>
  it('writes value', () => {
    component.bind({
      column: createColumnStub('a', ['a', 'b', 'c'], testcase.canEdit),
      isReadOnly: () => false
    });
    fixture.detectChanges();
    component.control.get('1').setValue(testcase.select);
    if (testcase.canEdit && testcase.select) {
      expect(component.columnContainer.value).toEqual(`a${multiValueDelimMock}b`); // since 'a' was selected at bind, and 'b' in setValue
    } else {
      expect(component.columnContainer.value).toEqual('a');
    }
  }));

  it('unsubscribes on destroy', () => {
    component.bind({
      column: createColumnStub('a', ['a', 'b', 'c']),
      isReadOnly: () => false
    });

    fixture.detectChanges();

    fixture.destroy();

    expect((component.control.valueChanges as EventEmitter<any>).observers.length).toEqual(0);
  });


  [
    { description: '= 0', defaultValue:'', minLength: 0, expectedError: false },
    { description: '> 0 and no value is set', defaultValue:'', minLength: 1, expectedError: true },
    { description: '> 0 and a value is set', defaultValue:'a', minLength: 1, expectedError: false }
  ].forEach(testcase =>
  it(`should set error.required to ${ testcase.expectedError} if minLength ${testcase.description}`, () => {
    component.bind({
      column: createColumnStub(testcase.defaultValue, ['a', 'b', 'c'], true, testcase.minLength),
      isReadOnly: () => false
    });

    component.control.markAsTouched();
    component.control.updateValueAndValidity({ onlySelf: true, emitEvent: false });

    if (testcase.expectedError) {
      expect(component.control.errors.required).toBeTruthy();
    } else {
      expect(component.control.errors).toBeNull();
    }
  }));

});
