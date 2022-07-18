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

import { Component, Input, Output, EventEmitter } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { configureTestSuite } from 'ng-bullet';
import { LoggerTestingModule } from 'ngx-logger/testing';

import { clearStylesFromDOM } from 'qbm';
import { FilterEditorComponent } from './filter-editor.component';
import { FilterElementModel } from './filter-element-model';

@Component({
  selector: 'imx-edit-threshold',
  template: '<p>MockRequestTable</p>'
})
class MockThresholdEditor {
  @Input() public elementInEdit: any;
  @Input() public identifier: any;

  @Output() public valueChanged = new EventEmitter<any>();
}

@Component({
  selector: 'imx-edit-name',
  template: '<p>MockRequestTable</p>'
})
class MockNameEditor {
  @Input() public elementInEdit: any;
  @Input() public identifier: any;

  @Output() public valueChanged = new EventEmitter<any>();
}

@Component({
  selector: 'imx-edit-uint',
  template: '<p>MockRequestTable</p>'
})
class MockUintEditor {
  @Input() public elementInEdit: any;
  @Input() public identifier: any;

  @Output() public valueChanged = new EventEmitter<any>();
}

@Component({
  selector: 'imx-edit-origin',
  template: '<p>MockRequestTable</p>'
})
class MockOriginEditor {
  @Input() public elementInEdit: any;
  @Input() public identifier: any;
  @Input() public parameterConfig: any;

  @Output() public valueChanged = new EventEmitter<any>();
}

@Component({
  selector: 'imx-edit-generic',
  template: '<p>MockRequestTable</p>'
})
class MockGenericEditor {
  @Input() public elementInEdit: any;
  @Input() public identifier: any;
  @Input() public parameterConfig: any;
  @Input() public displays: any;

  @Output() public valueChanged = new EventEmitter<any>();
}

describe('FilterEditorComponent', () => {
  let component: FilterEditorComponent;
  let fixture: ComponentFixture<FilterEditorComponent>;

  configureTestSuite(() => {
    TestBed.configureTestingModule({
      imports: [
        LoggerTestingModule
      ],
      declarations: [
        MockOriginEditor,
        MockNameEditor,
        MockGenericEditor,
        MockThresholdEditor,
        MockUintEditor,
        FilterEditorComponent,
      ]
    });
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FilterEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterAll(() => {
    clearStylesFromDOM();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('registers Methods', () => {

    let testValue: string;

    component.registerOnChange(() => { testValue = 'change' });
    component.registerOnTouched(() => { testValue = 'touched' });

    component.onChange(undefined);

    expect(testValue).toEqual('change');

    component.onTouch(undefined);
    expect(testValue).toEqual('touched');

  });

  it('can write model', () => {
    const model = new FilterElementModel([{ Uid: 'uid', RequiredParameter: 'NAME' }],
      [],
      { AttestationSubType: 'uid', ParameterName: 'name', ParameterValue: 'value1', ParameterValue2: '' },
      'uid',
      <any>{
        buildColumn: () => { }
      }
    );
    expect(component.filterElementModel).not.toBeDefined();
    component.writeValue(model);
    expect(component.filterElementModel).toEqual(model);
  });

  it('can change value', () => {
    component.registerOnChange(() => { });
    component.registerOnTouched(() => { });
    component.filterElementModel = new FilterElementModel([{ Uid: 'uid', RequiredParameter: 'NAME' }],
      [],
      { AttestationSubType: 'uid', ParameterName: 'name', ParameterValue: '', ParameterValue2: '' },
      'uid',
      <any>{
        buildColumn: () => { }
      }
    );
    component.invokeFilterChangedElement({ ParameterValue: 'new value', ParameterValue2: 'new value2' });
    expect(component.filterElementModel.parameterValue).toEqual('new value');
    expect(component.filterElementModel.parameterValue2).toEqual('new value2');
  });
});
