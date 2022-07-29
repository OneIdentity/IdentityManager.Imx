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

import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ArcGovernanceTestBed } from '../../test/arc-governance-test-bed';
import { ReportsComponent } from './reports.component';
import { ReportsService } from './reports.service';
import { IdentitiesReportsService } from 'qer';
import { AccountsReportsService, GroupsReportsService } from 'tsb'
import { ElementalUiConfigService } from 'qbm';

describe('ReportsComponent', () => {
  let component: ReportsComponent;
  let fixture: ComponentFixture<ReportsComponent>;

  const personDataSpy = jasmine.createSpy('personData').and.returnValue(Promise.resolve({}));

  ArcGovernanceTestBed.configureTestingModule({
    declarations: [ReportsComponent],
    providers: [
      ReportsService,
      {
        provide: IdentitiesReportsService,
        useValue: {
          personData: personDataSpy
        }
      },
      {
        provide: AccountsReportsService,
        useValue: {}
      },
      {
        provide: GroupsReportsService,
        useValue: {}
      },
      {
        provide: ElementalUiConfigService,
        useValue: { 
          Config: jasmine.createSpy('Config').and.returnValue({ downloadOptions: {} })
        }
      }
    ]
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ReportsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('GET reportParam() tests', () => {
    it(`should return "person" when the report type matches: "persons", "personsManaged",
    "accountsOwnedByPerson", "accountsOwnedByManaged", "groupsOwnedByPerson"`, () => {
      const expectedResult = 'person';
      component.reportType = 'persons';
      expect(component.reportParam).toEqual(expectedResult);
      component.reportType = 'personsManaged';
      expect(component.reportParam).toEqual(expectedResult);
      component.reportType = 'accountsOwnedByPerson';
      expect(component.reportParam).toEqual(expectedResult);
      component.reportType = 'accountsOwnedByManaged';
      expect(component.reportParam).toEqual(expectedResult);
      component.reportType = 'groupsOwnedByPerson';
      expect(component.reportParam).toEqual(expectedResult);
    });
    it(`should return "account" when the report type matches: "accounts"`, () => {
      component.reportType = 'accounts';
      expect(component.reportParam).toEqual('account');
    });
    it(`should return "authority" when the report type matches: "accountsByRoot", "groupsByRoot"`, () => {
      const expectedResult = 'authority';
      component.reportType = 'accountsByRoot';
      expect(component.reportParam).toEqual(expectedResult);
      component.reportType = 'groupsByRoot';
      expect(component.reportParam).toEqual(expectedResult);
    });
    it(`should return "container" when the report type matches: "accountsByContainer", "groupsByContainer"`, () => {
      const expectedResult = 'container';
      component.reportType = 'accountsByContainer';
      expect(component.reportParam).toEqual(expectedResult);
      component.reportType = 'groupsByContainer';
      expect(component.reportParam).toEqual(expectedResult);
    });
    it(`should return "group" when the report type matches: "groupsByGroup"`, () => {
      component.reportType = 'groupsByGroup';
      expect(component.reportParam).toEqual('group');
    });
  });

  describe('GET paramSelectLabel() tests', () => {
    let reportParamSpy: jasmine.Spy;
    beforeEach(() => {
      reportParamSpy = spyOnProperty(component, 'reportParam');
    });
    it(`should return "#LDS#Select an identity" when the report param is 'person'`, () => {
      reportParamSpy.and.returnValue('person');
      expect(component.paramSelectLabel).toEqual('#LDS#Select an identity');
    });
    it(`should return "#LDS#Select a user account" when the report param is 'account'`, () => {
      reportParamSpy.and.returnValue('account');
      expect(component.paramSelectLabel).toEqual('#LDS#Select a user account');
    });
    it(`should return "#LDS#Select a domain" when the report param is 'authority'`, () => {
      reportParamSpy.and.returnValue('authority');
      expect(component.paramSelectLabel).toEqual('#LDS#Select a domain');
    });
    it(`should return "#LDS#Select a container" when the report param is 'container'`, () => {
      reportParamSpy.and.returnValue('container');
      expect(component.paramSelectLabel).toEqual('#LDS#Select a container');
    });
    it(`should return "#LDS#Select a system entitlement" when the report param is 'group'`, () => {
      reportParamSpy.and.returnValue('group');
      expect(component.paramSelectLabel).toEqual('#LDS#Select a system entitlement');
    });
  });

  it('reportCategoryChange() will set reportTypeOptions based on choice', () => {
    component.reportCategory = 'accounts';
    component.reportCategoryChange();

    expect(component.reportTypeOptions.length).toEqual(5);
  });

  it('reportTypeChange() will make relevant data request', () => {
    component.reportCategory = 'accounts';
    component.reportType = 'accountsOwnedByPerson';

    component.reportTypeChange();

    expect(personDataSpy).toHaveBeenCalled();
  });
});
