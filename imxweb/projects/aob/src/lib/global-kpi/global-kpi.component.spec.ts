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
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { EuiLoadingService, EuiCoreModule } from '@elemental-ui/core';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { TranslateModule, TranslateLoader, TranslateFakeLoader } from '@ngx-translate/core';
import { configureTestSuite } from 'ng-bullet';
import { LoggerTestingModule } from 'ngx-logger/testing';

import { clearStylesFromDOM } from 'qbm';
import { GlobalKpiComponent } from './global-kpi.component';
import { GlobalKpiService } from './global-kpi.service';
import { KpiData } from './kpi-data.interface';
import { ChartData, ChartDto } from 'imx-api-aob';

const mockMatDialog = {
  open: jasmine.createSpy('open').and.returnValue({})
};

const euiLoadingServiceStub = {
  hide: jasmine.createSpy('hide'),
  show: jasmine.createSpy('show')
};

const mockKpiOverviewService = {
  get: jasmine.createSpy('get').and.returnValue(Promise.resolve([
    { Display: 'test', ErrorThreshold: 0, Data: [{ Points: [{ value: 1 }] }] },
    { Display: 'test2', ErrorThreshold: 2, Data: [{ Points: [{ value: 1 }] }] },
    { Display: 'test3', ErrorThreshold: 2, Data: [{ Points: [{ value: 1 }] }] },
    { Display: 'test4', ErrorThreshold: 2, Data: [{ Points: [{ value: 1 }] }] },
    { Display: 'test5', ErrorThreshold: 2, Data: [{ Points: [{ value: 1 }] }] },
    { Display: 'test6', ErrorThreshold: 2, Data: [{ Points: [{ value: 1 }] }] },
    { Display: 'test7', ErrorThreshold: 2, Data: [{ Points: [{ value: 1 }] }] },
    { Display: 'test8', ErrorThreshold: 2, Data: [{ Points: [{ value: 1 }] }] },
    { Display: 'test9', ErrorThreshold: 2, Data: [] },
  ]))
};
describe('GlobalKpiComponent', () => {
  let component: GlobalKpiComponent;
  let fixture: ComponentFixture<GlobalKpiComponent>;

  configureTestSuite(() => {
    TestBed.configureTestingModule({
      imports: [
        MatCardModule,
        NoopAnimationsModule,
        LoggerTestingModule,
        MatButtonModule,
        EuiCoreModule,
        TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useClass: TranslateFakeLoader
          }
        })
      ], declarations: [GlobalKpiComponent],
      providers: [{
        provide: GlobalKpiService,
        useValue: mockKpiOverviewService
      },
      {
        provide: MatDialog,
        useValue: mockMatDialog
      },
      {
        provide: EuiLoadingService,
        useValue: euiLoadingServiceStub
      }]
    });
  });

  beforeEach(() => {
    mockMatDialog.open.calls.reset();

    fixture = TestBed.createComponent(GlobalKpiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterAll(() => {
    clearStylesFromDOM();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('can init data', async () => {
    await component.ngOnInit();
    expect(component.kpiData.length).toBeGreaterThan(0);
  })

  it('can show dialog', () => {
    const test = { chartData: { Data: [] } };
    component.showDetails(test as KpiData);
    expect(mockMatDialog.open).not.toHaveBeenCalled();
  });

  it('can show dialog', () => {
    const test = {
      chartData: { Data: [{ Points: [{ value: 2 }] }] as ChartData },
      names: ['Series 1']
    };
    component.showDetails(test as KpiData);
    expect(mockMatDialog.open).toHaveBeenCalled();
  });

  [
    { chartData: undefined, expectedHasKpis: false },
    { chartData: [], expectedHasKpis: false },
    { chartData: [{}], expectedHasKpis: true },
  ].forEach(testcase =>
    it('can determine, if there are kpis or not', () => {
      component.kpiData = testcase.chartData as KpiData[];
      expect(component.hasKpis()).toEqual(testcase.expectedHasKpis);
    })
  );

  [
    { chart: {}, expect: false },
    { chart: { Data: [] }, expect: false },
    { chart: { Data: [{ Points: [{ value: 2 }] }] }, expect: true }
  ].forEach(testcase =>
    it('isCalculated', () => {
      expect(component.isCalculated(testcase.chart as unknown as ChartDto)).toEqual(testcase.expect)
    }))
});
