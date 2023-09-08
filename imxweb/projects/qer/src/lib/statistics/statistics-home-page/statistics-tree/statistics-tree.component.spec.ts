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
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MockBuilder, MockedComponentFixture, MockRender } from 'ng-mocks';
import { clearStylesFromDOM } from 'qbm';
import { BehaviorSubject, Subject } from 'rxjs';
import { GenericStatisticNode, StatisticsDataService } from '../statistics-data.service';

import { StatisticsTreeComponent } from './statistics-tree.component';

describe('StatisticsTreeComponent', () => {
  let component: StatisticsTreeComponent;
  let fixture: MockedComponentFixture<StatisticsTreeComponent>;

  beforeEach(() => {
    return MockBuilder([StatisticsTreeComponent])
    .mock(StatisticsDataService, {
      tree$: new Subject<GenericStatisticNode[]>(),
      selectedNodeAncestors$: new Subject<GenericStatisticNode[]>(),
      isSearch$: new BehaviorSubject<boolean>(false),
      sideNavExpanded$: new Subject<boolean>()
    })
    .beforeCompileComponents(testBed => {
      testBed.configureTestingModule({
        schemas: [ CUSTOM_ELEMENTS_SCHEMA ],
        imports: [BrowserAnimationsModule ]
      })
    })
  });

  beforeEach(() => {
    fixture = MockRender(StatisticsTreeComponent);
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
