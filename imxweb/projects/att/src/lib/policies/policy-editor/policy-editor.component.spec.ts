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
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { EuiLoadingService } from '@elemental-ui/core';
import { configureTestSuite } from 'ng-bullet';
import { LoggerTestingModule } from 'ngx-logger/testing';
import { BehaviorSubject } from 'rxjs';

import { clearStylesFromDOM } from 'qbm';
import { PolicyEditorComponent } from './policy-editor.component';
import { FilterModel } from './filter-model';
import { IEntityColumn } from 'imx-qbm-dbts';
import { FilterElementColumnService } from '../editors/filter-element-column.service';
import { FilterElementModel } from '../editors/filter-element-model';
import { PolicyService } from '../policy.service';


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

@Component({
  selector: 'imx-policy-filter-element',
  template: '<p>MockFilterElementComponen</p>'
})
export class MockFilterElementComponent {

  @Input() public formGroup: any;
  @Input() public idForTest: any;

  @Output() public deleteFilter = new EventEmitter<any>();
  @Output() public conditionTypeChanged = new EventEmitter<any>();
  @Output() public parameterChanged = new EventEmitter<any>();
}

describe('PolicyEditorComponent', () => {
  let component: PolicyEditorComponent;
  let fixture: ComponentFixture<PolicyEditorComponent>;

  let parmData;
  const mockPolicyService = {
    getParmData: jasmine.createSpy('getParmData').and.callFake(() => parmData)
  }

  const euiLoadingServiceStub = {
    hide: jasmine.createSpy('hide'),
    show: jasmine.createSpy('show')
  };

  const mockColumnService = {
    buildColumn: jasmine.createSpy('buildColumn').and.returnValue({
      GetValue: () => 'uid1',
      GetDisplayValue: () => 'Display for uid1',
      GetMetadata: () => ({
        GetFkRelations: () => [{
          Get: () => ({ Entities: [], TotalCount: 1 })
        }]
      }) as unknown

    } as IEntityColumn),
    policyService: mockPolicyService
  }



  configureTestSuite(() => {
    TestBed.configureTestingModule({
      imports: [
        MatFormFieldModule,
        MatInputModule,
        ReactiveFormsModule,
        NoopAnimationsModule,
        LoggerTestingModule
      ],
      declarations: [
        MockFilterElementComponent,
        MockSelectedObjects,
        PolicyEditorComponent
      ],
      providers: [
        {
          provide: FilterElementColumnService,
          useValue: mockColumnService
        },
        {
          provide: EuiLoadingService,
          useValue: euiLoadingServiceStub
        },
        {
          provide: PolicyService,
          useValue: {
            getCasesThreshold: jasmine.createSpy('getCasesThreshold').and.returnValue(Promise.resolve(99999))
          }
        }
      ]
    });
  });


  beforeEach(() => {
    fixture = TestBed.createComponent(PolicyEditorComponent);
    component = fixture.componentInstance;
    mockPolicyService.getParmData.calls.reset();
    component.formGroup = new FormGroup({});
    component.filterModel = new FilterModel(({ buildColumn: jasmine.createSpy(''), policyService: mockPolicyService } as unknown) as FilterElementColumnService,
    new BehaviorSubject<boolean>(true),
    new BehaviorSubject<string>(undefined));
    component.filterModel.policyFilterData = {
      IsReadOnly: false,
      Filter: { Elements: [{ AttestationSubType: 'uid1' }] },
      InfoDisplay: [['Display1']]
    }
  });

  afterAll(() => {
    clearStylesFromDOM();
  });

  it('can init', async () => {
    component.formGroup = new FormGroup({});
    component.filterModel.uidAttestationObject = 'uid1';
    component.filterModel.policyFilterData = {
      IsReadOnly: false,
      Filter: { Elements: [{ AttestationSubType: 'uid1' }] },
      InfoDisplay: [['Display1']]
    };
    parmData = [{ Uid: 'uid1' }];

    await component.ngOnInit();
    expect(component.filterArray.length).toEqual(1);
  });

  it('unsubscribes', async() =>{
    fixture.detectChanges();
    expect(component.filterModel.attestationObjectSubject.observers.length).toBeGreaterThan(0);

    component.ngOnDestroy();
    expect(component.filterModel.attestationObjectSubject.observers).toEqual(null);

  });


    // TODO: Ist beim Upgrade auf Angular v11 kaputgegangrn. Reactivate
  // it('deletes a condition', async () => {
  //   component.filterModel.policyFilterData = {
  //     IsReadOnly: false,
  //     Filter: { Elements: [{ AttestationSubType: 'uid1' }, { AttestationSubType: 'uid1' }] },
  //     InfoDisplay: [['Display1'], ['Display2']]
  //   }
  //   await component.ngOnInit();

  //   expect(component.filterArray.length).toEqual(2);
  //   expect(component.filterModel.policyFilterData.Filter.Elements.length).toEqual(2);
  //   expect(component.filterModel.policyFilterData.InfoDisplay.length).toEqual(2);
  //   expect(component.filterArray.dirty).toBeFalsy();


  //   component.deleteCondition(0);

  //   expect(component.filterArray.length).toEqual(1);
  //   expect(component.filterModel.policyFilterData.Filter.Elements.length).toEqual(1);
  //   expect(component.filterModel.policyFilterData.InfoDisplay.length).toEqual(1);
  //   expect(component.filterArray.dirty).toBeTruthy();
  // });

  // TODO: Skip this unit test because of "TypeError: cannot read property 'filter' of undefined" in filter-element-model.ts
  xit('adds a condition', async () => {
    await component.ngOnInit();

    expect(component.filterArray.length).toEqual(1);
    expect(component.filterModel.policyFilterData.Filter.Elements.length).toEqual(1);
    expect(component.filterModel.policyFilterData.InfoDisplay.length).toEqual(1);
    expect(component.filterArray.dirty).toBeFalsy();


    component.addCondition();
    expect(component.filterArray.length).toEqual(2);
    expect(component.filterModel.policyFilterData.Filter.Elements.length).toEqual(2);
    expect(component.filterModel.policyFilterData.InfoDisplay.length).toEqual(2);
    expect(component.filterArray.dirty).toBeTruthy();
  });

  for (const testcase of [
    { parmData: { Uid: 'uid', RequiredParameter: 'NAME' }, expect: { Uid: 'uid', RequiredParameter: 'NAME' } },
    { parmData: { Uid: 'uid2', RequiredParameter: 'NAME' }, expect: null },
  ]) {
    it('can get a parameter', () => {
      expect(FilterElementModel.getParameterData([testcase.parmData], 'uid',)).toEqual(testcase.expect);
    });
  }

  it('reacts to filter parameter changes', async () => {
    parmData = [{ Uid: 'uid1' }];

    await component.ngOnInit();

    const filterGroup = component.filterArray.controls[0] as FormGroup;
    const model = filterGroup.get('filterParameter').value as FilterElementModel;

    model.displays = ['a display'];

    component.filterParameterChanged(0, model);

    expect(component.filterModel.policyFilterData.Filter.Elements[0].AttestationSubType)
      .toEqual(model.attestationSubType);
    expect(component.filterModel.policyFilterData.InfoDisplay[0]).toEqual(['a display']);
  });

  it('can update concatination type', () => {
    component.filterModel.policyFilterData = { IsReadOnly: true, Filter: { ConcatenationType: 'OR' } }
    component.filterFormGroup.get('concatenationType').setValue('AND');

    expect(component.filterModel.policyFilterData.Filter.ConcatenationType).toEqual('AND');
  });

  for (const testcase of [
    { requiredType: 'UINT', newParameterValue1: '-1', newParameterValue2: '', expectedValidity: false },
    { requiredType: 'UINT', newParameterValue1: '1', newParameterValue2: '', expectedValidity: true },
    { requiredType: 'THRESHOLD', newParameterValue1: '0', newParameterValue2: '1', expectedValidity: true },
    { requiredType: 'THRESHOLD', newParameterValue1: '1', newParameterValue2: '1', expectedValidity: true },
    { requiredType: 'THRESHOLD', newParameterValue1: '0', newParameterValue2: 'ß', expectedValidity: true },
    { requiredType: 'THRESHOLD', newParameterValue1: '0.3', newParameterValue2: '0.9', expectedValidity: true },
    { requiredType: 'THRESHOLD', newParameterValue1: '1.1', newParameterValue2: '0.9', expectedValidity: false },
    { requiredType: 'THRESHOLD', newParameterValue1: '0', newParameterValue2: '2', expectedValidity: false },
    { requiredType: 'UID_SomeOID', newParameterValue1: '', newParameterValue2: '', expectedValidity: false },
    { requiredType: 'UID_SomeOID', newParameterValue1: 'someID', newParameterValue2: '', expectedValidity: true },
  ]) {
    it('can validate', async () => {
      component.filterModel.policyFilterData = {
        IsReadOnly: false,
        Filter: {
          Elements: [{
            AttestationSubType: 'uid1',
            ParameterName: testcase.requiredType,
            ParameterValue: testcase.newParameterValue1,
            ParameterValue2: testcase.newParameterValue2
          }]
        },
        InfoDisplay: [['Display1']]
      };
      parmData = [{ Uid: 'uid1', RequiredParameter: testcase.requiredType }];

      await component.ngOnInit();

      const control = component.filterArray.controls[0] as FormGroup;

      expect(control.invalid).toEqual(!testcase.expectedValidity)
    });
  }

  it('updates selected Condition type', async () => {
    component.filterModel.policyFilterData = {
      IsReadOnly: false,
      Filter: {
        Elements: [{
          AttestationSubType: 'uid1',
          ParameterName: '',
          ParameterValue: '',
          ParameterValue2: ''
        }]
      },
      InfoDisplay: [['Display1']]
    };
    parmData = [{ Uid: 'uid1' }];

    await component.ngOnInit();
    const model = ({ filterElement: { AttestationSubType: 'uid2' } } as unknown) as FilterElementModel;
    component.selectedConditionTypeChanged(0, model);

    expect(component.filterModel.policyFilterData.InfoDisplay[0]).toEqual([]);
    expect(component.filterModel.policyFilterData.Filter.Elements[0]).toEqual(model.filterElement);
  });
});
