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

import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/compiler';
import { EuiSidesheetService, EuiLoadingService } from '@elemental-ui/core';
import { TranslateService } from '@ngx-translate/core';
import { MockBuilder, MockedComponentFixture, MockRender } from 'ng-mocks';
import { clearStylesFromDOM } from 'qbm';
import { BehaviorSubject } from 'rxjs';
import { GenericStatisticEntity, StatisticsDataService } from '../statistics-data.service';

import { FavoritesTabComponent } from './favorites-tab.component';

describe('FavoritesTabComponent', () => {
  let component: FavoritesTabComponent;
  let fixture: MockedComponentFixture<FavoritesTabComponent>;

  beforeEach(() => {
    return MockBuilder([FavoritesTabComponent, TranslateService])
    .mock(StatisticsDataService, {
      favStats$: new BehaviorSubject<GenericStatisticEntity[]>([]),
      searchFavStats$: new BehaviorSubject<GenericStatisticEntity[]>([]),
      isFavSearch$: new BehaviorSubject(false)
    })
    .mock(EuiLoadingService)
    .mock(EuiSidesheetService)
    .beforeCompileComponents(testBed => {
      testBed.configureTestingModule({
        schemas: [ CUSTOM_ELEMENTS_SCHEMA]
      })
    })
  });

  beforeEach(() => {
    fixture = MockRender(FavoritesTabComponent);
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
