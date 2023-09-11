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
 * Copyright 2023 One Identity LLC.
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

import { CUSTOM_ELEMENTS_SCHEMA, ElementRef } from '@angular/core';
import { MockBuilder, MockedComponentFixture, MockRender } from 'ng-mocks';
import { StatisticsChartHandlerService } from '../statistics-chart-handler.service';

import { ChartDto } from 'imx-api-qer';
import { ChartTileComponent } from './chart-tile.component';
import { PointStatVisualService } from './point-stat-visual/point-stat-visual.service';

describe('ChartTileComponent', () => {
  let component: ChartTileComponent;
  let fixture: MockedComponentFixture<any>;

  const summaryStat: ChartDto = {
    AggregateFunction: 0,
    AggregateFunctionTotal: 0,
    ErrorThreshold: 0,
    HistoryLength: 0,
    NegateThresholds: false,
    TimeScaleUnit: 0,
    WarningThreshold: 0,
    Data: []
  }

  beforeEach(() => {
    return MockBuilder(ChartTileComponent)
      .mock(StatisticsChartHandlerService)
      .mock(PointStatVisualService)
      .beforeCompileComponents(testBed => {
        testBed.configureTestingModule({
          schemas: [CUSTOM_ELEMENTS_SCHEMA]
        })
      })
    });

  beforeEach(() => {
    fixture = MockRender(ChartTileComponent, {
      summaryStat,
    });
    component = fixture.point.componentInstance;
    fixture.detectChanges();
  })

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
