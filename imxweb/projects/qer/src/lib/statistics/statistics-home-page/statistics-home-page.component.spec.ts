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
import { MatDialog } from '@angular/material/dialog';
import { EuiLoadingService } from '@elemental-ui/core';
import { MockBuilder, MockedComponentFixture, MockRender } from 'ng-mocks';
import { clearStylesFromDOM } from 'qbm';
import { of } from 'rxjs';

import { StatisticsConstantsService } from './statistics-constants.service';
import { StatisticsDataService } from './statistics-data.service';
import { StatisticsHomePageComponent } from './statistics-home-page.component';

describe('StatisticsHomePageComponent', () => {
  let component: StatisticsHomePageComponent;
  let fixture: MockedComponentFixture<StatisticsHomePageComponent>;

  beforeEach(() => {
    return MockBuilder([StatisticsHomePageComponent])
    .mock(StatisticsDataService)
    .mock(StatisticsConstantsService)
    .mock(EuiLoadingService)
    .mock(ElementRef)
    .beforeCompileComponents(testBed => {
      testBed.configureTestingModule({
        schemas: [CUSTOM_ELEMENTS_SCHEMA],
        providers: [
          {
            provide: MatDialog,
            useValue: {
              open: jasmine.createSpy('open').and.returnValue({ afterClosed: () => of() })
            }
          }
        ]
      });
    });
  });

  beforeEach(() => {
    fixture = MockRender(StatisticsHomePageComponent);
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
