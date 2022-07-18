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

import { Component, Input } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatCardModule } from '@angular/material/card';
import { EuiCoreModule, EUI_SIDESHEET_DATA } from '@elemental-ui/core';
import { configureTestSuite } from 'ng-bullet';

import { clearStylesFromDOM } from 'qbm';
import { PortalAttestationPolicy } from 'imx-api-att';
import { PolicyDetailsComponent } from './policy-details.component';

@Component({
  selector: 'imx-runs-grid',
  template: '<p>MockRunsGridComponent</p>'
})
class MockRunsGridComponent {
  @Input() public uidAttestationPolicy: any;
}



function dataFactory() {
  return {
    HubConnectionBuilder: () => {
      return {
        withUrl: (url) => {
          return {
            build: () => { }
          };
        }
      };
    }
  };
}

describe('PolicyDetailsComponent', () => {
  let component: PolicyDetailsComponent;
  let fixture: ComponentFixture<PolicyDetailsComponent>;

  const data = {
    policy: {
      CountCases: { value: 0 },
      CountOpenCases: { value: 0 },
      IsProcessing: { value: false },
      GetEntity: () => ({
        GetKeys: () => ['policyID'],
        GetDisplay: () => ''
      })
    } as PortalAttestationPolicy
  }


  configureTestSuite(() => {
    TestBed.configureTestingModule({
      imports: [
        MatCardModule,
        EuiCoreModule
      ],
      declarations: [
        MockRunsGridComponent,
        PolicyDetailsComponent
      ],
      providers: [
        { provide: EUI_SIDESHEET_DATA, useValue: data }
      ]
    });
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PolicyDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterAll(() => {
    clearStylesFromDOM();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  for (const testcase of [
    { isProcessing: false, cases: 0, openCases: 0, status: '#LDS#Not run yet' },
    { isProcessing: true, cases: 0, openCases: 0, status: '#LDS#Processing' },
    { isProcessing: true, cases: 1, openCases: 0, status: '#LDS#Processing' },
    { isProcessing: true, cases: 1, openCases: 1, status: '#LDS#Processing' },
    { isProcessing: false, cases: 1, openCases: 0, status: '#LDS#Completed' },
    { isProcessing: false, cases: 2, openCases: 1, status: '#LDS#Pending' },
  ]) {
    it(`calculates status ${testcase.status} if the run is ${testcase.isProcessing ? 'processing' : 'not processing'}, there a ${testcase.cases} cases and ${testcase.openCases} open cases`, async () => {
      component.data.policy = {
        CountCases: { value: testcase.cases },
        CountOpenCases: { value: testcase.openCases },
        IsProcessing: { value: testcase.isProcessing },
        GetEntity: () => ({
          GetKeys: () => ['policyID'],
          GetDisplay: () => ''
        })
      } as PortalAttestationPolicy

      fixture = TestBed.createComponent(PolicyDetailsComponent);
      component = fixture.componentInstance;
      expect(component).toBeTruthy();
      expect(component.policy).toBeDefined();
      expect(component.status).toEqual(testcase.status);
    })
  }

});
