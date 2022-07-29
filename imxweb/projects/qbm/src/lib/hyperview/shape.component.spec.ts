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
import * as TypeMoq from 'typemoq';

import { ShapeComponent } from './shape.component';
import { ShapeData } from 'imx-api-qbm';
import { ModelCssService } from '../model-css/model-css.service';

describe('ShapeComponent', () => {

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
        ShapeComponent
      ]
    })
  });

  it('should create', () => {
    expect(() => {
      const fixture = TestBed.createComponent(ShapeComponent);
      expect(fixture.componentInstance).toBeTruthy();
    }).not.toThrowError();
  });

  it('should return -1 if the no shapes exists', () => {
    const fixture = TestBed.createComponent(ShapeComponent);
    const shapeComponent = fixture.componentInstance;

    expect(shapeComponent.ObjectCount).toBe(-1);
  });

  [1, 2, 3].forEach((numberOfElements: number) => {
    it('should return the number of all shapes', () => {
      const fixture = TestBed.createComponent(ShapeComponent);
      const shapeComponent = fixture.componentInstance;

      // second push one item to the shapeList
      const list = [];

      for (let i = 0; i < numberOfElements; i++) {
        list.push({});
      }

      const shapeDataMock = TypeMoq.Mock.ofType<ShapeData>();
      shapeDataMock.setup(s => s.Elements).returns(() => list);
      shapeComponent.shape = shapeDataMock.object
      expect(shapeComponent.ObjectCount).toBe(numberOfElements);
    });
  });

});
