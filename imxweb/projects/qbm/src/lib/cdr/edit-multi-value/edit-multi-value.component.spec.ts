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
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { configureTestSuite } from 'ng-bullet';
import { LoggerTestingModule } from 'ngx-logger/testing';

import { EditMultiValueComponent } from './edit-multi-value.component';
import { IEntityColumn } from 'imx-qbm-dbts';
import { clearStylesFromDOM } from '../../testing/clear-styles.spec';
import { ColumnDependentReference } from '../column-dependent-reference.interface';
import { MultiValueService } from '../../multi-value/multi-value.service';

function BuildMockCdr(defaultValue: any, readOnly: boolean = false, asyncDelay = 0): ColumnDependentReference {
  let currentValue = defaultValue;

  const column = {
    GetDisplayValue: () => currentValue != null && currentValue !== '' ? `Display for ${currentValue}` : '',
    GetValue: () => currentValue,
    PutValue: async value => {
      if (asyncDelay > 0) {
        await new Promise(resolve => setTimeout(resolve, asyncDelay));
      }
      currentValue = value;
    },
    GetMetadata: () => ({
      CanEdit: () => true,
      GetMinLength: () => 1,
      GetLimitedValues: () => undefined,
      GetDisplay: () => undefined
    })
  } as IEntityColumn;

  return {
    column,
    isReadOnly: () => readOnly
  };
}

describe('EditMultiValueComponent', () => {
  let component: EditMultiValueComponent;
  let fixture: ComponentFixture<EditMultiValueComponent>;

  const multiValueDelimMock = '|';

  configureTestSuite(() => {
    TestBed.configureTestingModule({
      imports: [
        FormsModule,
        LoggerTestingModule,
        MatFormFieldModule,
        MatInputModule,
        NoopAnimationsModule,
        ReactiveFormsModule
      ],
      declarations: [EditMultiValueComponent],
      providers: [
        {
          provide: MultiValueService,
          useValue: {
            getValues: jasmine.createSpy('getValues').and.callFake(value => value.split(multiValueDelimMock)),
            getMultiValue: jasmine.createSpy('getMultiValue').and.callFake(values => values ? values.filter(v => v.length > 0).join(multiValueDelimMock): undefined)
          }
        }
      ]
    });
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EditMultiValueComponent);
    component = fixture.componentInstance;
  });

  afterAll(() => {
    clearStylesFromDOM();
  });

  [
    { value: BuildMockCdr('a', false), description: 'with string editor' },
    { value: BuildMockCdr('a', true), description: 'with string viewer' },
  ].forEach(testcase => {
    it(`should create ${testcase.description}`, () => {
      component.bind(testcase.value);
      fixture.detectChanges();

      expect(component).toBeDefined();
    });
  });

  it('allows empty list', () => {
    component.bind(BuildMockCdr('', true));
    expect(component.columnContainer.displayValue).toEqual('');
  });

  it('writes value', fakeAsync(() => {
    component.bind(BuildMockCdr(''));
    fixture.detectChanges();
    component.control.setValue('a\nb\n');
    tick();
    expect(component.columnContainer.value).toEqual(`a${multiValueDelimMock}b`);
  }));

  it('unsubscribes on destroy', () => {
    component.bind(BuildMockCdr(['a', 'b', 'c'].join(multiValueDelimMock), true));

    fixture.detectChanges();

    fixture.destroy();

    expect((component.control.valueChanges as EventEmitter<any>).observers.length).toEqual(0);
  });
});
