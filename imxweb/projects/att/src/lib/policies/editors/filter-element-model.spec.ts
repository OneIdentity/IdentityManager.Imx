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

import { TestBed } from "@angular/core/testing";
import { MultiValueProperty } from 'imx-qbm-dbts';
import { configureTestSuite } from 'ng-bullet';
import { FilterElementColumnService } from './filter-element-column.service';
import { FilterElementModel } from './filter-element-model';

describe('FilterElementModel', () => {
  let model: FilterElementModel;

  configureTestSuite(() => {
    TestBed.configureTestingModule({
      providers: []
    });
  });

  beforeEach(() => {
    model = new FilterElementModel([{ Uid: 'uid', RequiredParameter: 'NAME' }],
      [], { AttestationSubType: 'uid', ParameterName: 'name', ParameterValue: 'value1', ParameterValue2: '' }, 'uid',
      ({ buildColumn: jasmine.createSpy('') } as unknown) as FilterElementColumnService
    );
  });

  it('should create', () => {
    model = new FilterElementModel([{ Uid: 'uid', RequiredParameter: 'NAME' }],
      ['display for uid'],
      { AttestationSubType: 'uid', ParameterName: 'name', ParameterValue: 'value1', ParameterValue2: '' },
      'uid',
      ({ buildColumn: jasmine.createSpy('') } as unknown) as FilterElementColumnService
    );
    expect(model).toBeTruthy();
  });

  it('updates columns', () => {
    model.updateColumn({ AttestationSubType: 'uid', ParameterName: 'UINT', ParameterValue: '1', ParameterValue2: '' }, ['One']);

    expect(model.attestationSubType).toEqual('uid');
    expect(model.parameterName).toEqual('UINT');
    expect(model.parameterValue).toEqual('1');
    expect(model.parameterValue2).toEqual('');
  });

  for (const testcase of [
    { description: 'existing uid', type: 'uid', expect: { Uid: 'uid', RequiredParameter: 'NAME' } },
    { description: 'not existing uid', type: 'uid2', expect: null }
  ]) {
    it(`gets parameter for ${testcase.description}`, () => {
      expect(model.getParameterData(testcase.type)).toEqual(testcase.expect);
    });
  };

  for (const testcase of [
    { parm: null, expect: '' },
    { parm: { RequiredParameter: 'UINT' }, expect: 'UINT' },
    { parm: { RequiredParameter: 'UID_ORIGIN' }, expect: 'UID_ORIGIN' },
    { parm: { RequiredParameter: 'UID_Department' }, expect: 'UID' }
  ]) {
    it(`gets required parameter types for type ${testcase.parm?.RequiredParameter}`, () => {
      expect(FilterElementModel.getRequiredParameterType(testcase.parm)).toEqual(testcase.expect);
    });
  }

  it('can use editedParameterRequires', () => {
    expect(model.policyFilterRequiresParameterName('NAME')).toBeTruthy();
    expect(model.policyFilterRequiresParameterName('UINT')).toBeFalsy();
  })


  for (const testcase of [
    { parm: { RequiredParameter: 'UINT', Uid: 'uid' }, expect: false },
    { parm: { RequiredParameter: 'UID_ORIGIN', Uid: 'uid' }, expect: false },
    { parm: { RequiredParameter: 'UID_Department', Uid: 'uid' }, expect: true },
    { parm: { RequiredParameter: 'DOMAIN', Uid: 'uid' }, expect: true }
  ]) {
    it(`checks fk for ${testcase.parm?.RequiredParameter}`, () => {
      model.parameterConfig = [testcase.parm];
      expect(model.hasFk()).toEqual(testcase.expect);
    });
  }

  for (const testcase of [
    { parameterName: 'UINT', forValue2: false, expect: '0' },
    { parameterName: 'UINT', forValue2: true, expect: '' },
    { parameterName: 'THRESHOLD', forValue2: false, expect: '0' },
    { parameterName: 'THRESHOLD', forValue2: true, expect: '1' },
    { parameterName: 'NAME', forValue2: false, expect: '' },
  ]) {
    it(`can get default value for parameter ${testcase.parameterName}`, () => {
      expect(FilterElementModel.getDefaultValue(testcase.parameterName, testcase.forValue2))
        .toEqual(testcase.expect);
    });
  }

  for (const testcase of [
    { string: '', expectWithoutConvert: [''], expect: [''] },
    { string: '\'test\'', expectWithoutConvert: ['\'test\''], expect: ['test'] },
    { string: '\'test\',\'test2\'', expectWithoutConvert: ['\'test\'', '\'test2\''], expect: ['test', 'test2'] }
  ]) {
    it(`can convert text ${testcase.string}`, () => {
      expect(testcase.string.split(',')).toEqual(testcase.expectWithoutConvert);
      expect(FilterElementModel.buildMultiValueSeparatedList(testcase.string)
        .split(MultiValueProperty.DefaultSeparator))
        .toEqual(testcase.expect);
    });
  }
});
