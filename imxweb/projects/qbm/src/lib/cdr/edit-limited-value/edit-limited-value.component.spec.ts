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
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { configureTestSuite } from 'ng-bullet';
import { LoggerTestingModule } from 'ngx-logger/testing';

import { EditLimitedValueComponent } from './edit-limited-value.component';
import { ColumnDependentReference } from '../column-dependent-reference.interface';
import { IEntityColumn, LimitedValueData, ValType } from 'imx-qbm-dbts';
import { clearStylesFromDOM } from '../../testing/clear-styles.spec';
import { MatInputModule } from '@angular/material/input';

function createCdrStub(defaultValue: any, readOnly: boolean = false, limited?: any[],
  allowsNull?: boolean, type?: ValType, asyncDelay = 0): ColumnDependentReference {
  let currentValue = defaultValue;

  const column = {
    GetDisplayValue: () => currentValue != null && currentValue !== '' ? `Display for ${currentValue}` : '',
    GetValue: () => currentValue,
    ColumnChanged: {
      subscribe: (args) => { return { unsubscribe: () => { } } }
    },
    PutValue: async value => {
      if (asyncDelay > 0) {
        await new Promise(resolve => setTimeout(resolve, asyncDelay));
      }
      currentValue = value;
    },
    GetMetadata: () => ({
      CanEdit: () => true,
      GetLimitedValues: () => BuildLimitedValues(limited),
      GetMinLength: () => allowsNull ? 0 : 1,
      GetType: () => type,
      GetDisplay: () => undefined
    })
  } as IEntityColumn;

  return {
    column,
    isReadOnly: () => readOnly
  };
}

function BuildLimitedValues(limited: any[]): ReadonlyArray<LimitedValueData> {
  return limited.map(element => ({ Value: element, Description: `${element}` }));
}

describe('EditLimitedValueComponent', () => {
  let component: EditLimitedValueComponent;
  let fixture: ComponentFixture<EditLimitedValueComponent>;

  configureTestSuite(() => {
    TestBed.configureTestingModule({
      imports: [
        FormsModule,
        LoggerTestingModule,
        ReactiveFormsModule,
        MatSelectModule,
        MatInputModule,
        NoopAnimationsModule
      ],
      providers: [
      ],
      declarations: [EditLimitedValueComponent]
    });
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EditLimitedValueComponent);
    component = fixture.componentInstance;
  });


  afterAll(() => {
    clearStylesFromDOM();
  });

  [
    { value: createCdrStub('a', false, ['a', 'b', 'c']), description: 'with string editor' },
    { value: createCdrStub('a', true, ['a', 'b', 'c']), description: 'with string viewer' },
    { value: createCdrStub(1, false, [1, 2, 3]), description: 'with number editor' },
    { value: createCdrStub(1, true, [1, 2, 3]), description: 'with number viewer' },
  ].forEach(testcase => {
    it(`should create ${testcase.description}`, () => {
      component.bind(testcase.value);
      fixture.detectChanges();
      expect(component).toBeDefined();
    });
  });
});
