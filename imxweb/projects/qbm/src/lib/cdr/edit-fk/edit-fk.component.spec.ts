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
import { MatAutocompleteModule, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { configureTestSuite } from 'ng-bullet';
import { LoggerTestingModule } from 'ngx-logger/testing';
import { Subject } from 'rxjs';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { Component, Input, Pipe, PipeTransform } from '@angular/core';
import { EuiCoreModule, EuiSidesheetService } from '@elemental-ui/core';

import { EditFkComponent } from './edit-fk.component';
import { IForeignKeyInfo, IValueMetadata, IEntityColumn, ValueStruct, EntityCollectionData } from 'imx-qbm-dbts';
import { EntityColumnStub } from '../../testing/entity-column-stub.spec';
import { clearStylesFromDOM } from '../../testing/clear-styles.spec';
import { MetadataService } from '../../base/metadata.service';

@Component({
  selector: 'imx-view-property',
  template: '<p>MockViewProperty</p>',
})
class MockViewProperty {
  @Input() columnContainer: any;
  @Input() defaultValue: any;
}

function createColumnStub(value: ValueStruct<string>, canEdit = true, candidateCollections?: EntityCollectionData[], minLength = 0): IEntityColumn {
  const getFki = c => ({ Get: _ => Promise.resolve(c) } as IForeignKeyInfo);

  return new EntityColumnStub(
    value.DataValue,
    value.DisplayValue,
    {
      GetFkRelations: () => (
        candidateCollections ?
          candidateCollections.map(c => getFki(c))
          : [getFki({ Entities: [] })]
      ) as ReadonlyArray<IForeignKeyInfo>,
      CanEdit: () => canEdit,
      GetLimitedValues: () => undefined,
      GetMinLength: () => minLength,
      GetDisplay: () => 'display'
    } as IValueMetadata
  );
}

@Pipe({ name: 'ldsReplace' })
class MockLdsReplacePipe implements PipeTransform {
  transform() { }
}

describe('EditFkComponent', () => {
  let component: EditFkComponent;
  let fixture: ComponentFixture<EditFkComponent>;

  const afterClosedSubject = new Subject<any>();

  const matDialogStub = {
    open: jasmine.createSpy('open').and.returnValue({ afterClosed: () => afterClosedSubject })
  };

  const metadataServiceStub = {
    update: jasmine.createSpy('update')
  };

  configureTestSuite(() => {
    TestBed.configureTestingModule({
      imports: [
        FormsModule,
        MatAutocompleteModule,
        MatFormFieldModule,
        MatInputModule,
        MatTableModule,
        MatPaginatorModule,
        ScrollingModule,
        NoopAnimationsModule,
        LoggerTestingModule,
        ReactiveFormsModule,
        EuiCoreModule
      ],
      declarations: [
        EditFkComponent,
        MockLdsReplacePipe,
        MockViewProperty
      ],
      providers: [
        {
          provide: EuiSidesheetService,
          useValue: matDialogStub
        },
        {
          provide: MetadataService,
          useValue: metadataServiceStub
        }
      ]
    });
  });

  beforeEach(waitForAsync(() => {
    matDialogStub.open.calls.reset();
    metadataServiceStub.update.calls.reset();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditFkComponent);
    component = fixture.componentInstance;
  });

  afterAll(() => {
    clearStylesFromDOM();
  });

  it('should create', () => {
    expect(component).toBeDefined();
  });

  [
    { input: { isReadonly: false }, expected: { canEdit: true } },
    { input: { isReadonly: true }, expected: { canEdit: false } },
  ].forEach(testcase =>
  it('should bind the object to this component' + testcase.input.isReadonly, () => {
    // Arrange
    const metadataMinLength = 5;
    const columnStub = new EntityColumnStub<any>('value', 'display', {
      CanEdit: () => !testcase.input.isReadonly,
      GetMinLength: () => metadataMinLength,
      GetFkRelations: () => [{} as IForeignKeyInfo] as ReadonlyArray<IForeignKeyInfo>,
      GetLimitedValues: () => undefined
    } as IValueMetadata);

    // Act
    component.bind({
      column: columnStub,
      isReadOnly: () => testcase.input.isReadonly
    });

    // Assert
    expect(component.columnContainer.displayValue).toBe(columnStub.GetDisplayValue());
    expect(component.columnContainer.value).toEqual(columnStub.GetValue());
    expect(component.columnContainer.canEdit).toEqual(testcase.expected.canEdit, 'canEdit');
    expect(metadataServiceStub.update).toHaveBeenCalled();
  }));

  it('is readonly when the cdr is missing', () => {
    // Act/Assert
    expect(component.columnContainer.canEdit).toBeFalsy();
  });

  [
    {
      valueStructs: [{
        DataValue: 'val1',
        DisplayValue: 'displayValue'
      }],
      canEdit: true
    },
    {
      valueStructs: [],
      canEdit: true
    },
    {
      valueStructs: [],
      canEdit: false
    }
  ].forEach(testcase =>
  it('should change the assignment', fakeAsync(() => {
    const fakeDelay = 1000;
    const start = {
      DataValue: 'val0',
      DisplayValue: 'display0'
    };
    const column = createColumnStub(start, testcase.canEdit);
    component.bind({
      column,
      isReadOnly: () => false
    });

    component.editAssignment();

    tick(fakeDelay);

    afterClosedSubject.subscribe(_ =>
      expect(matDialogStub.open).toHaveBeenCalled()
    );

    afterClosedSubject.next({ table: {}, candidates: testcase.valueStructs });

    tick(fakeDelay);

    if (testcase.canEdit) {
      if (testcase.valueStructs && testcase.valueStructs.length > 0) {
        expect(component.columnContainer.displayValue).toBe(testcase.valueStructs[0].DisplayValue);
        expect(component.control.value).toEqual(testcase.valueStructs[0]);
        expect(component.columnContainer.value).toEqual(testcase.valueStructs[0].DataValue);
      } else {
        expect(component.columnContainer.displayValue).toBeUndefined();
        expect(component.control.value).toBeUndefined();
        expect(component.columnContainer.value).toBeUndefined();
      }
    } else {
      expect(component.columnContainer.displayValue).toBe(start.DisplayValue);
      expect(component.control.value).toEqual(start);
      expect(component.columnContainer.value).toEqual(start.DataValue);
    }
  })));

  it('should revert to previous value if leaving autocomplete', () => {
    const start = {
      DataValue: 'val0',
      DisplayValue: 'display0'
    };
    const column = createColumnStub(start);
    component.bind({
      column,
      isReadOnly: () => false
    });

    component.control.setValue('some string', { emitEvent: false });

    component.close();

    expect(component.control.value).toEqual(start);
  });

  it('should remove the assignment', async () => {
    const start = {
      DataValue: 'val0',
      DisplayValue: 'display0'
    };
    const column = createColumnStub(start);
    component.bind({
      column,
      isReadOnly: () => false
    });

    await component.removeAssignment();

    expect(component.columnContainer.displayValue).toBeUndefined();
    expect(component.control.value).toBeUndefined();
    expect(component.columnContainer.value).toBeUndefined();
  });

  it('should update the entity upon autocomplete option selection', async () => {
    const start = {
      DataValue: 'val0',
      DisplayValue: 'display0'
    };
    const column = createColumnStub(start);
    component.bind({
      column,
      isReadOnly: () => false
    });

    const value = { DataValue: 'val1', DisplayValue: 'display1' };

    await component.optionSelected({ option: { value } } as MatAutocompleteSelectedEvent);

    expect(component.columnContainer.displayValue).toEqual(value.DisplayValue);
    expect(component.columnContainer.value).toEqual(value.DataValue);
  });

  it('should provide a display method', () => {
    const value = { DataValue: 'val1', DisplayValue: 'display1' };

    expect(component.getDisplay(value)).toEqual(value.DisplayValue);
  });

  it('should init the candidates', async () => {
    function createKey(value: string): string {
      return '<Key><T>table0</T><P>' + value + '</P></Key>';
    }

    const mockValues = [
      {
        DataValue: 'val0',
        DisplayValue: 'display0',
      },
      {
        DataValue: 'val1',
        DisplayValue: 'display1'
      }
    ];
    const candidateCollection = {
      Entities: mockValues.map(e => ({
        Display: e.DisplayValue,
        Columns: { XObjectKey: { Value: createKey(e.DataValue) } }
      })),
      TotalCount: mockValues.length
    };
    const column = createColumnStub(
      {
        DataValue: createKey(mockValues[0].DataValue),
        DisplayValue: mockValues[0].DisplayValue
      },
      true,
      [candidateCollection, { Entities: [], TotalCount: 0 }]
    );
    component.bind({
      column,
      isReadOnly: () => false
    });

    spyOn((component as any).changeDetectorRef , 'detectChanges');
    await component.ngOnInit();

    expect(component.candidates[0].DataValue).toEqual(candidateCollection.Entities[0].Columns.XObjectKey.Value);
    expect(component.candidates[0].DisplayValue).toEqual(candidateCollection.Entities[0].Display);
    expect(component.hasCandidatesOrIsLoading).toEqual(true);
  });

  [
    { description: '= 0', minLength: 0, expectedError: false },
    { description: '> 0', minLength: 1, expectedError: true }
  ].forEach(testcase =>
  it('should set error.required to ' + testcase.expectedError +
     ' if minLength ' + testcase.description + ' and value is not set', () => {
    const start = {
      DataValue: null
    };
    const column = createColumnStub(start, true, undefined, testcase.minLength);
    component.bind({
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
  }));
});
