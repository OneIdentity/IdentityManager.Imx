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
import { EuiSidesheetRef, EuiSidesheetService, EUI_SIDESHEET_DATA } from '@elemental-ui/core';
import { TranslateModule } from '@ngx-translate/core';
import { MockBuilder, MockedComponentFixture, MockRender } from 'ng-mocks';
import { clearStylesFromDOM } from 'qbm';
import { HeatmapSidesheetService } from './heatmap-sidesheet.service';

import { HeatmapSidesheetComponent } from './heatmap-sidesheet.component';
import { Subject } from 'rxjs';

describe('SidesheetComponent', () => {
  let component: HeatmapSidesheetComponent;
  let fixture: MockedComponentFixture<HeatmapSidesheetComponent>;

  beforeEach(() => {
    return MockBuilder([HeatmapSidesheetComponent, TranslateModule.forRoot()])
    .mock(HeatmapSidesheetService)
    .mock(ElementRef)
    .mock(EuiSidesheetService)
    .mock(EuiSidesheetRef, {
      close: () => {},
      closeClicked: () => new Subject()
    })
    .mock(EUI_SIDESHEET_DATA, {
      isFavorite: false
    })
    .beforeCompileComponents(testBed => {
      testBed.configureTestingModule({
        schemas: [CUSTOM_ELEMENTS_SCHEMA]
      });
    });
  });

  beforeEach(() => {
    fixture = MockRender(HeatmapSidesheetComponent);
    component = fixture.point.componentInstance;
    fixture.detectChanges();
  });

  afterAll(() => {
    clearStylesFromDOM();
  })

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
