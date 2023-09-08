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

import { ChangeDetectorRef, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { EuiSidesheetRef } from '@elemental-ui/core';
import { TranslateModule } from '@ngx-translate/core';
import { MockBuilder, MockedComponentFixture, MockRender } from 'ng-mocks';
import { clearStylesFromDOM } from 'qbm';
import { ItshopPatternService } from '../itshop-pattern.service';

import { ItshopPatternItemEditComponent } from './itshop-pattern-item-edit.component';

describe('ItshopPatternItemEditComponent', () => {
  let component: ItshopPatternItemEditComponent;
  let fixture: MockedComponentFixture<ItshopPatternItemEditComponent>;

  beforeEach(() => {
    return MockBuilder([ItshopPatternItemEditComponent, TranslateModule.forRoot()])
    .mock(ItshopPatternService)
    .mock(EuiSidesheetRef)
    .beforeCompileComponents(testBed => {
      testBed.configureTestingModule({
        schemas: [CUSTOM_ELEMENTS_SCHEMA]
      });
    });
  });

  beforeEach(() => {
    fixture = MockRender(ItshopPatternItemEditComponent);
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
