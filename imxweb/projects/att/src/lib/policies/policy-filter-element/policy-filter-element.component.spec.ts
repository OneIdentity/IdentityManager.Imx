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

import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectChange } from '@angular/material/select';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { EuiCoreModule } from '@elemental-ui/core';
import { configureTestSuite } from 'ng-bullet';

import { clearStylesFromDOM } from 'qbm';
import { FilterElementColumnService } from '../editors/filter-element-column.service';
import { FilterElementModel } from '../editors/filter-element-model';
import { PolicyFilterElementComponent } from './policy-filter-element.component';

@Component({
  selector: 'imx-editors',
  template: '<p>MockEditors</p>'
})
class MockEditors {
  @Input() public parameterConfig: any;
  @Input() public displays: any;
  @Output() public filterChanged = new EventEmitter<any>();
}

@Component({
  selector: 'imx-selected-objects',
  template: '<p>MockSelectedObjects</p>'
})
class MockSelectedObjects {
  @Input() public popupTitle: any;
  @Input() public popupSubtitle: any;

  @Input() public filter: any;
  @Input() public filterElement: any;
  @Input() public uidAttestationObject: any;
  @Input() public parameterConfig: any;
  @Input() public filterIsValid: any;
  @Input() public isTotal: any;
  @Input() public filterSubject: any;
}

describe('PolicyFilterElementComponent', () => {
  let component: PolicyFilterElementComponent;
  let fixture: ComponentFixture<PolicyFilterElementComponent>;

  configureTestSuite(() => {
    TestBed.configureTestingModule({
      imports: [
        MatFormFieldModule,
        MatInputModule,
        ReactiveFormsModule,
        NoopAnimationsModule,
        MatExpansionModule,
        EuiCoreModule
      ],
      declarations: [
        MockEditors,
        MockSelectedObjects,
        PolicyFilterElementComponent
      ]
    })
  });


  const model = new FilterElementModel([{ Uid: 'uid', RequiredParameter: 'NAME' }, { Uid: 'uid2', RequiredParameter: 'NAME' }],
    [],
    { AttestationSubType: 'uid', ParameterName: 'name', ParameterValue: '', ParameterValue2: '' },
    'uid',
    ({ buildColumn: jasmine.createSpy('') } as unknown) as FilterElementColumnService,
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(PolicyFilterElementComponent);
    component = fixture.componentInstance;
    component.formGroup = new FormGroup({
      filterParameter: new FormControl(undefined),
      type: new FormControl(undefined),
    });
  });

  afterAll(() => {
    clearStylesFromDOM();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('can get model', () => {

    expect(component.filterElementModel).toBeNull();

    component.formGroup.get('filterParameter').setValue(model);
    expect(component.filterElementModel).toEqual(model);

    component.formGroup = null;
    expect(component.filterElementModel).toEqual(undefined);

  });

  it('updates parameter', () => {
    const spy = spyOn(component.parameterChanged, 'emit');

    component.filterParameterChanged({ ParameterValue: 'value' });
    expect(spy).not.toHaveBeenCalled();

    component.formGroup.get('filterParameter').setValue(model);
    component.filterParameterChanged({ ParameterValue: 'value' });
    expect(spy).toHaveBeenCalledWith(component.filterElementModel);
  });

  it('updates attestation Type', () => {
    const spy = spyOn(component.conditionTypeChanged, 'emit');

    component.selectedConditionTypeChanged({ value: 'uid2' } as MatSelectChange);
    expect(spy).not.toHaveBeenCalled();

    component.formGroup.get('filterParameter').setValue(model);
    component.selectedConditionTypeChanged({ value: 'uid2' } as MatSelectChange);
    expect(spy).toHaveBeenCalledWith(component.filterElementModel);
  });

});
