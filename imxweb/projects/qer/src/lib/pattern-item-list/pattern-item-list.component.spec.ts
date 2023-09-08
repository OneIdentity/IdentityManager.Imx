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

import { PortalItshopPatternRequestable } from 'imx-api-qer';
import { MockBuilder, MockedComponentFixture, MockRender } from 'ng-mocks';
import { clearStylesFromDOM } from 'qbm';

import { PatternItemListComponent } from './pattern-item-list.component';
import { PatternItemService } from './pattern-item.service';
import { PatternItemsModule } from './pattern-items.module';

describe('PatternItemListComponent', () => {
  let component: PatternItemListComponent;
  let fixture: MockedComponentFixture<PatternItemListComponent>;

  beforeEach(() => {
    return MockBuilder(PatternItemListComponent)
      .mock(PatternItemsModule)
      .mock(PatternItemService, {
        PortalShopPatternRequestableSchema: PortalItshopPatternRequestable.GetEntitySchema(),
        get: jasmine.createSpy('get'),
      } as unknown);
  });

  beforeEach(() => {
    fixture = MockRender(PatternItemListComponent);
    component = fixture.point.componentInstance;
  });

  afterAll(() => {
    clearStylesFromDOM();
  });

  it('should create', () => {
    expect(component).toEqual(jasmine.any(PatternItemListComponent));
  });
});
