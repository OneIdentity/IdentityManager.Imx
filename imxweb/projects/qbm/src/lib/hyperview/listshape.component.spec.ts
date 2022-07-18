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

import { TestBed } from '@angular/core/testing';
import { MatBadgeModule } from '@angular/material/badge';
import { configureTestSuite } from 'ng-bullet';

import { ListShapeComponent } from './listshape.component';
import { ShapeComponent } from './shape.component';
import { clearStylesFromDOM } from '../testing/clear-styles.spec';
import { ModelCssService } from '../model-css/model-css.service';

describe('ListShapeComponent', () => {

  configureTestSuite(() => {
    TestBed.configureTestingModule({
      imports: [
        MatBadgeModule
      ],
      providers: [
        {
          provide: ModelCssService,
          useValue: class { loadModelCss() { } }
        }
      ],
      declarations: [
        ListShapeComponent,
        ShapeComponent
      ]
    });
  });

  afterAll(() => {
    clearStylesFromDOM();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(ListShapeComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('click', () => {
    const fixture = TestBed.createComponent(ListShapeComponent);
    fixture.componentInstance.click(null);
    expect(() => fixture.componentInstance.click(null)).not.toThrow();
  });

  it('click observers', () => {
    const fixture = TestBed.createComponent(ListShapeComponent);
    fixture.componentInstance.selected.subscribe(() => { });
    expect(() => fixture.componentInstance.click({})).not.toThrow();
  });
});
