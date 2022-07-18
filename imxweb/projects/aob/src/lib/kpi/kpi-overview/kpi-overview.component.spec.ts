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
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { EuiCoreModule, EuiLoadingService } from '@elemental-ui/core';
import { configureTestSuite } from 'ng-bullet';
import { TranslateModule, TranslateLoader, TranslateFakeLoader } from '@ngx-translate/core';

import { PortalApplication, ChartDto } from 'imx-api-aob';
import { KpiOverviewComponent } from './kpi-overview.component';
import { KpiOverviewService } from './kpi-overview.service';
import { ClassloggerService, clearStylesFromDOM } from 'qbm';

describe('KpiOverviewComponent', () => {
  let component: KpiOverviewComponent;
  let fixture: ComponentFixture<KpiOverviewComponent>;

  const mockKpiOverviewService = {
    get: jasmine.createSpy('get').and.returnValue(Promise.resolve([
      {Display: 'test', ErrorThreshold: 0, Data:[{Points: [{value: 1}]}]},
      {Display: 'test2', ErrorThreshold: 2, Data:[{Points: [{value: 1}]}]},
      {Display: 'test3', ErrorThreshold: 0, Data:[]}
    ]))
  };

  const mockMatDialog = {
    open: jasmine.createSpy('open').and.returnValue({})
  };

  const euiLoadingServiceStub = {
    hide: jasmine.createSpy('hide'),
    show: jasmine.createSpy('show')
  };

  configureTestSuite(() => {
    TestBed.configureTestingModule({
      imports: [
        MatCardModule,
        NoopAnimationsModule,
        MatButtonModule,
        MatTooltipModule,
        EuiCoreModule,
        TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useClass: TranslateFakeLoader
          }
        })
      ],
      providers: [
        {
          provide: KpiOverviewService,
          useValue: mockKpiOverviewService
        },
        {
          provide: MatDialog,
          useValue: mockMatDialog
        },
        {
          provide: EuiLoadingService,
          useValue: euiLoadingServiceStub
        },
        {
          provide: ClassloggerService,
          useValue: {
            debug: jasmine.createSpy('debug').and.callThrough()
          }
        },
      ],
      declarations: [
        KpiOverviewComponent
      ]
    });
  });

  beforeEach(waitForAsync(() => {
    mockKpiOverviewService.get.calls.reset();
    mockMatDialog.open.calls.reset();
    euiLoadingServiceStub.hide.calls.reset();
    euiLoadingServiceStub.show.calls.reset();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(KpiOverviewComponent);
    component = fixture.componentInstance;
    component.application = { UID_AOBApplication: { value: 'uid' } } as PortalApplication;
    fixture.detectChanges();
  });

  afterAll(() => {
    clearStylesFromDOM();
  });

  it('should create', () => {
    expect(component).toBeDefined();
  });

  it('can show dialog', () => {
    let test = { Display: 'Test', Data: [] };
    component.showDetails(test as ChartDto, false);
    expect(mockMatDialog.open).not.toHaveBeenCalled();

    test = { Display: 'Test', Data: [{ Points: [{ Value: 1 }] }] };
    component.showDetails(test as ChartDto, false);
    expect(mockMatDialog.open).toHaveBeenCalled();
  });

  [
    { chartDataFail: undefined, chartDataPass: undefined, expectedHasKpis: false },
    { chartDataFail: [], chartDataPass: [], expectedHasKpis: false },
    { chartDataFail: [{}], chartDataPass: [], expectedHasKpis: true },
    { chartDataFail: [], chartDataPass: [{}], expectedHasKpis: true },
    { chartDataFail: [{}], chartDataPass: [{}], expectedHasKpis: true }
  ].forEach(testcase =>
    it('can determine, if there are kpis or not', () => {
      component.chartDataFail = testcase.chartDataFail as ChartDto[];
      component.chartDataPass = testcase.chartDataPass as ChartDto[];
      expect(component.hasKpis()).toEqual(testcase.expectedHasKpis);
    })
  );

  it('updates the kpis on component change', async () => {
    expect(component.chartDataFail).toBeUndefined();
    expect(component.chartDataPass).toBeUndefined();

    await component.ngOnChanges();

    expect(mockKpiOverviewService.get).toHaveBeenCalled();
    expect(component.chartDataFail).toBeDefined();
    expect(component.chartDataPass).toBeDefined();
  });
});
