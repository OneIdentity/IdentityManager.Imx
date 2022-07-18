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
import { EuiCoreModule } from '@elemental-ui/core';
import { configureTestSuite } from 'ng-bullet';

import { PortalAttestationRun } from 'imx-api-att';
import { IValueMetadata } from 'imx-qbm-dbts';
import { clearStylesFromDOM } from 'qbm';
import { CaseChartComponent } from './case-chart.component';


function createProperty(value?) {
  return {
    value,
    GetMetadata: () => ({ GetDisplay: () => value } as unknown as IValueMetadata)
  };
}

describe('CaseChartComponent', () => {
  let component: CaseChartComponent;
  let fixture: ComponentFixture<CaseChartComponent>;

  configureTestSuite(() => {
    TestBed.configureTestingModule({
      declarations: [CaseChartComponent],
      imports: [
        EuiCoreModule
      ]
    });
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CaseChartComponent);
    component = fixture.componentInstance;
  });

  afterAll(() => {
    clearStylesFromDOM();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  for (const testcase of [
    { run: null, isInitialized: false, data: null },
    {
      run: {
        PendingCases: createProperty(3),
        GrantedCases: createProperty(2),
        DeniedCases: createProperty(6),
        CasesAbortedBySystem: createProperty(5),
      }
      , isInitialized: true, data: [
        ['open', 3],
        ['granted', 2],
        ['denied', 1],
        ['abort', 5]]
    },
  ]) {
    it('inits data', () => {
      component.run = testcase.run as PortalAttestationRun;
      component.ngOnInit();

      if (testcase.isInitialized) {
        expect(component.chartData).toBeDefined();
        expect(component.chartData.data.columns).toEqual(testcase.data);
      } else {
        expect(component.chartData).toBeUndefined();
      }
    });
  }

});
