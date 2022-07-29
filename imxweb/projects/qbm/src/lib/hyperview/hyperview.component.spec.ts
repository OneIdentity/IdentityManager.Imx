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

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, Input } from '@angular/core';
import { MatBadgeModule } from '@angular/material/badge';
import { By } from '@angular/platform-browser';
import { configureTestSuite } from 'ng-bullet';
import { LoggerTestingModule } from 'ngx-logger/testing';

import { HyperviewComponent, ShapeType } from './hyperview.component';
import { DeviceStateService } from '../services/device-state.service';
import { ListShapeComponent } from './listshape.component';
import { PropertyShapeComponent } from './propertyshape.component';
import { SimpleShapeComponent } from './simpleshape.component';
import { ShapeComponent } from './shape.component';
import { HyperviewLayoutVertical } from './hyperview-layout-vertical';
import { HyperviewLayoutHierarchical } from './hyperview-layout-hierarchical';
import { clearStylesFromDOM } from '../testing/clear-styles.spec';

@Component({
  template: `
    <imx-hyperview [layout]="layout">
      <div imx-layout="MiddleCenter">Shape1</div>
      <div>Shape2</div>
    </imx-hyperview>`,
  selector: 'hyperviewtest'
})
class HyperviewTestComponent {
  @Input() layout: string;
}

function testInstance(fixture: ComponentFixture<HyperviewTestComponent>, expectedLayout: string): void {
  const hv = fixture.debugElement.query(By.directive(HyperviewComponent));
  expect(hv).toBeDefined();
  const inst = hv.componentInstance as HyperviewComponent;
  expect(inst.connectors).toBeDefined();
  expect(inst.connectors.connectorList.length).toEqual(1);
  expect(inst.layout).toEqual(expectedLayout);
}

describe('HyperviewComponent', () => {

  configureTestSuite(() => {
    TestBed.configureTestingModule({
      imports: [
        LoggerTestingModule,
        MatBadgeModule
      ],
      declarations: [
        HyperviewComponent,
        HyperviewTestComponent,
        ListShapeComponent,
        PropertyShapeComponent,
        SimpleShapeComponent,
        ShapeComponent
      ],
      providers: [
        {
          provide: DeviceStateService,
          useClass: class {
            isPhoneDevice = jasmine.createSpy('isPhoneDevice');
          }
        }
      ]
    });
  });

  afterAll(() => {
    clearStylesFromDOM();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(HyperviewComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('create hierarchical', () => {
    const fixture = TestBed.createComponent(HyperviewTestComponent);
    fixture.detectChanges();

    testInstance(fixture, 'Hierarchical');
  });

  it('create vertical', () => {
    const fixture = TestBed.createComponent(HyperviewTestComponent);
    fixture.componentInstance.layout = 'Vertical';
    fixture.detectChanges();

    testInstance(fixture, 'Vertical');
  });

  it('create horizontal', () => {
    const fixture = TestBed.createComponent(HyperviewTestComponent);
    fixture.componentInstance.layout = 'Horizontal';
    fixture.detectChanges();

    testInstance(fixture, 'Horizontal');
  });

  [
    {
      shape: {
        Elements: null,
        Properties: null
      },
      expected: ShapeType.SimpleShape
    },
    {
      shape: {
        Elements: [],
        Properties: null
      },
      expected: ShapeType.ListShape
    },
    {
      shape: {
        Elements: null,
        Properties: []
      },
      expected: ShapeType.PropertyShape
    }
  ].forEach(testcase => it('evaluates the shapetype', () => {
    const fixture = TestBed.createComponent(HyperviewComponent);
    expect(fixture.componentInstance.GetShapeType({
      IsDeleted: false,
      Elements: testcase.shape.Elements,
      Properties: testcase.shape.Properties
    })).toEqual(testcase.expected);
  }));

  [
    {
      color: null,
      expected: '#'
    },
    {
      color: '12345678',
      expected: '#345678'
    }
  ].forEach(testcase => it('gets the effective color', () => {
    const fixture = TestBed.createComponent(HyperviewComponent);
    expect(fixture.componentInstance.GetShapeEffectiveColor({
      IsDeleted: false,
      ElementColor: testcase.color
    })).toEqual(testcase.expected);
  }));

  it('should deliver height and width of the hyperview corresponding to the maximum values auf their connectors', () => {
    const fixture = TestBed.createComponent(HyperviewTestComponent);
    fixture.componentInstance.layout = 'Horizontal';
    fixture.detectChanges();

    const hv = fixture.debugElement.query(By.directive(HyperviewComponent));
    expect(hv).toBeDefined();
    const hyperview = hv.componentInstance as HyperviewComponent;

    hyperview.connectors.maxValue.X = 100;
    hyperview.connectors.maxValue.Y = 200;

    expect(hyperview.getWidth()).toBe('100px');
    expect(hyperview.getHeight()).toBe('200px');
  });

  it('should use custom settings', () => {
    const fixture = TestBed.createComponent(HyperviewTestComponent);
    fixture.componentInstance.layout = 'Hierarchical';
    fixture.detectChanges();

    const hv = fixture.debugElement.query(By.directive(HyperviewComponent));
    expect(hv).toBeDefined();
    const hyperview = hv.componentInstance as HyperviewComponent;

    const buildLayouterSpy = spyOn<any>(hyperview, 'buildLayouter').and.callThrough();

    hyperview.ngAfterViewChecked();
    expect(buildLayouterSpy.calls.first().returnValue).toEqual(jasmine.any(HyperviewLayoutHierarchical));

    // test enforcing vertical layout
    const customSettings = {
      enforceVerticalLayout: true,
      elements: {}
    };

    spyOn<any>(hyperview, 'buildSettings').and.returnValue(customSettings);

    hyperview.ngAfterViewChecked();
    expect(buildLayouterSpy.calls.mostRecent().returnValue).toEqual(jasmine.any(HyperviewLayoutVertical));
  });
});
