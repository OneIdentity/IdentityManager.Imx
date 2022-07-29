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

import { ComponentFixture, TestBed, fakeAsync, tick, waitForAsync } from '@angular/core/testing';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { configureTestSuite } from 'ng-bullet';
import { LoggerTestingModule } from 'ngx-logger/testing';
import { Subject, of } from 'rxjs';
import { EuiCoreModule, EuiSidesheetService } from '@elemental-ui/core';
import { TranslateService } from '@ngx-translate/core';

import { IValueMetadata } from 'imx-qbm-dbts';
import { EntityColumnStub } from '../../testing/entity-column-stub.spec';
import { clearStylesFromDOM } from '../../testing/clear-styles.spec';
import { EditFkMultiComponent } from './edit-fk-multi.component';
import { MultiValueService } from '../../multi-value/multi-value.service';

describe('EditFkMultiComponent', () => {
  let component: EditFkMultiComponent;
  let fixture: ComponentFixture<EditFkMultiComponent>;

  const afterClosedSubject = new Subject<any>();

  const matDialogStub = {
    open: jasmine.createSpy('open').and.returnValue({ afterClosed: () => afterClosedSubject })
  };

  const multiValueDelimMock = '|';

  configureTestSuite(() => {
    TestBed.configureTestingModule({
      imports: [
        FormsModule,
        EuiCoreModule,
        MatFormFieldModule,
        MatInputModule,
        MatTableModule,
        MatPaginatorModule,
        NoopAnimationsModule,
        LoggerTestingModule,
        ReactiveFormsModule
      ],
      declarations: [
        EditFkMultiComponent
      ],
      providers: [
        {
          provide: EuiSidesheetService,
          useValue: matDialogStub
        },
        {
          provide: TranslateService,
          useValue: { get: jasmine.createSpy('get').and.callFake(key => of(key.replace('#LDS#', ''))) }
        },
        {
          provide: MultiValueService,
          useValue: {
            getValues: jasmine.createSpy('getValues').and.callFake(value => value ? value.split(multiValueDelimMock) : undefined),
            getMultiValue: jasmine.createSpy('getMultiValue').and.callFake(values => values.join(multiValueDelimMock))
          }
        }
      ]
    });
  });

  beforeEach(waitForAsync(() => {
    matDialogStub.open.calls.reset();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditFkMultiComponent);
    component = fixture.componentInstance;
  });

  afterAll(() => {
    clearStylesFromDOM();
  });

  it('should create', () => {
    expect(component).toBeDefined();
  });

  [
    {
      valueStructs: [
        {
          DataValue: 'val1',
          DisplayValue: 'displayValue1'
        }
      ],
      expected: {
        value: 'val1',
        display: 'displayValue1',
        controlValue: 'displayValue1',
      },
      canEdit: true
    },
    {
      valueStructs: [
        {
          DataValue: 'val1',
          DisplayValue: 'displayValue1'
        },
        {
          DataValue: 'val2',
          DisplayValue: 'displayValue2'
        }
      ],
      expected: {
        value: 'val1' + multiValueDelimMock + 'val2',
        display: 'displayValue1' + multiValueDelimMock + 'displayValue2',
        controlValue: '2 items selected'
      },
      canEdit: true
    },
    {
      valueStructs: [],
      expected: {
        value: undefined,
        display: undefined,
        controlValue: undefined
      },
      canEdit: true
    },
    {
      valueStructs: [],
      expected: {
        value: undefined,
        display: undefined,
        controlValue: undefined
      },
      canEdit: false
    }
  ].forEach(testcase =>
    it('should change the assignment, canEdit=' + testcase.canEdit, fakeAsync(() => {
      const fakeDelay = 1000;
      const start = {
        value: 'val0',
        display: 'display0'
      };
      const column = new EntityColumnStub(
        start.value,
        start.display,
        {
          GetFkRelations: () => undefined,
          CanEdit: () => testcase.canEdit,
          GetLimitedValues: () => undefined,
          GetMinLength: () => undefined,
          GetDisplay: () => ''
        } as unknown as IValueMetadata
      );
      component.bind({
        column,
        isReadOnly: () => false
      });

      tick(fakeDelay);

      component.editAssignment();
      tick(fakeDelay);

      afterClosedSubject.subscribe(_ =>
        expect(matDialogStub.open).toHaveBeenCalled()
      );

      afterClosedSubject.next({ table: {}, candidates: testcase.valueStructs });

      tick(fakeDelay);

      if (testcase.canEdit && testcase.valueStructs) {
        expect(component.columnContainer.displayValue).toEqual(testcase.expected.display);
        expect(component.control.value).toEqual(testcase.expected.controlValue);
        expect(component.columnContainer.value).toEqual(testcase.expected.value);
      } else {
        expect(component.columnContainer.displayValue).toEqual(start.display);
        expect(component.control.value).toEqual(start.display);
        expect(component.columnContainer.value).toEqual(start.value);
      }
    })));

  for (const testcase of
    [
      { description: '= 0', minLength: 0, expectedError: false },
      { description: '> 0', minLength: 1, expectedError: true }
    ]) {
    it('should set error.required to ' + testcase.expectedError +
      ' if minLength ' + testcase.description + ' and value is not set', async () => {
        const column = new EntityColumnStub(
          '',
          '',
          {
            GetFkRelations: () => undefined,
            CanEdit: () => true,
            GetLimitedValues: () => undefined,
            GetMinLength: () => testcase.minLength
          } as IValueMetadata
        );
        await component.bind({
          column,
          isReadOnly: () => false
        });

        component.control.markAsTouched();
        component.control.updateValueAndValidity({ onlySelf: true, emitEvent: false });

        expect(component.control.value).toBeUndefined();
        if (testcase.expectedError) {
          expect(component.control.errors.required).toBeTruthy();
        } else {
          expect(component.control.errors).toBeNull();
        }
      });
  }
});
