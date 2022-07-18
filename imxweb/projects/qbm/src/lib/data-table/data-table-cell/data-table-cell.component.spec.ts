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

import { Pipe, PipeTransform } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { configureTestSuite } from 'ng-bullet';

import { IClientProperty, TypedEntity, ValType } from 'imx-qbm-dbts';

import { clearStylesFromDOM } from '../../testing/clear-styles.spec';
import { DataTableCellComponent } from './data-table-cell.component';

describe('DataTableCellComponent', () => {
  let component: DataTableCellComponent;
  let fixture: ComponentFixture<DataTableCellComponent>;

  const columnStub: IClientProperty =
  {
    Type: ValType.String,
    ColumnName: 'TestColumn'
  };

  const entityStub =
    {
      GetEntity: () => (
        {
          GetColumn: (colName: string) => (
            {
              GetValue: () => colName + '(value)',
              GetDisplayValue: () => colName + '(displayValue)'
            })
        })
    } as TypedEntity;

  const shortDateTransformSpy = jasmine.createSpy('transform').and.callFake((value: string) => value + 'short');

  @Pipe({ name: 'shortDate' })
  class MockShortDatePipe implements PipeTransform {
    transform = shortDateTransformSpy;
    browserCulture = 'de';
  }

  configureTestSuite(() => {
    TestBed.configureTestingModule({
      declarations: [
        DataTableCellComponent,
        MockShortDatePipe
      ]
    });
  });


  beforeEach(() => {
    fixture = TestBed.createComponent(DataTableCellComponent);
    component = fixture.componentInstance;

  });

  afterAll(() => {
    clearStylesFromDOM();
  });

  it('should create', () => {
    component.property = columnStub;
    component.entity = entityStub;
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  for (const testcase of [
    { description: '(non-date)', column: 'Col1', type: ValType.String, expected: 'Col1(displayValue)' },
    { description: 'date', column: 'Col2', type: ValType.Date, expected: 'Col2(value)short' }
  ]) {
    it('should create', () => {
      columnStub.ColumnName = testcase.column;
      columnStub.Type = testcase.type;

      component.property = columnStub;
      component.entity = entityStub;
      fixture.detectChanges();

      const nativeElement = fixture.debugElement.nativeElement as HTMLElement;
      const dataTableCellSpan = nativeElement.getElementsByTagName('span')[0];

      expect(dataTableCellSpan.innerText).toBe(testcase.expected);

      if (testcase.type === ValType.Date) {
        expect(shortDateTransformSpy).toHaveBeenCalled();
      }
    });
  }
});
