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
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { configureTestSuite } from 'ng-bullet';
import { LoggerTestingModule } from 'ngx-logger/testing';

import { EditNumberComponent } from './edit-number.component';
import { clearStylesFromDOM } from '../../testing/clear-styles.spec';
import { ColumnDependentReference } from '../column-dependent-reference.interface';
import { IEntityColumn, ValType } from 'imx-qbm-dbts';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { NumberValidatorService } from './number-validator.service';

function createCdrStub(startValue = 2, asyncDelay = 0): ColumnDependentReference {
  let currentValue = startValue;

  const columnStub = {
    ColumnChanged: {
      subscribe: (args) => { return { unsubscribe: () => { } } }
    },
    GetDisplayValue: () => `Display for ${currentValue}`,
    GetValue: () => currentValue,
    PutValue: async value => {
      if (asyncDelay > 0) {
        await new Promise(resolve => setTimeout(resolve, asyncDelay));
      }
      currentValue = value;
    },
    GetMetadata: () => ({
      CanEdit: () => true,
      GetLimitedValues: () => undefined,
      GetMinLength: () => 1,
      GetDisplay: () => 'column display'
    }),
    GetType: () => ValType.Int
  } as IEntityColumn;

  return {
    column: columnStub,
    isReadOnly: () => false
  };
}

describe('EditNumberComponent', () => {
  let component: EditNumberComponent;
  let fixture: ComponentFixture<EditNumberComponent>;

  configureTestSuite(() => {
    TestBed.configureTestingModule({
      imports: [
        FormsModule,
        MatFormFieldModule,
        MatInputModule,
        ReactiveFormsModule,
        LoggerTestingModule,
        NoopAnimationsModule
      ],
      declarations: [
        EditNumberComponent
      ],
      providers: [
        {
          provide: NumberValidatorService,
          useValue: {
            validate: (__0, __1) => null
          }
        }
      ]
    });
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EditNumberComponent);
    component = fixture.componentInstance;
  });

  afterAll(() => {
    clearStylesFromDOM();
  });

  it('should create', () => {
    expect(component).toBeDefined();
  });

  it('handles non-numbers', () => {
    component.bind(createCdrStub(2));

    fixture.detectChanges();

    const input = fixture.nativeElement.querySelector('input');
    expect(Number.parseInt(input.value)).toEqual(2);

    const newValue = 'a';
    component.control.setValue(newValue);
    expect(input.value).toEqual('');
  });
});
