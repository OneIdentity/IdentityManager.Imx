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

import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { HeatmapSummaryDto } from 'imx-api-qer';
import { MockBuilder, MockedComponentFixture, MockRender } from 'ng-mocks';

import { HeatmapTileComponent } from './heatmap-tile.component';

describe('HeatmapTileComponent', () => {
  let component: HeatmapTileComponent;
  let fixture: MockedComponentFixture<any>;

  const summaryStat: HeatmapSummaryDto = {
    CountGreen: 0,
    CountRed: 0,
    CountYellow: 0
  }

  beforeEach(() => {
    return MockBuilder(HeatmapTileComponent)
      .beforeCompileComponents(testBed => {
        testBed.configureTestingModule({
          schemas: [CUSTOM_ELEMENTS_SCHEMA]
        })
      })
    });

  beforeEach(() => {
    fixture = MockRender(HeatmapTileComponent, {
      summaryStat,
    });
    component = fixture.point.componentInstance;
    fixture.detectChanges();
  })

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
