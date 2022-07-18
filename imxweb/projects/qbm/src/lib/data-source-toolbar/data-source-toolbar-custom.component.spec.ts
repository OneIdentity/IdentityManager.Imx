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
import { Component, ViewChild } from '@angular/core';
import { configureTestSuite } from 'ng-bullet';

import { DataSourceToolbarCustomComponent } from './data-source-toolbar-custom.component'
import { clearStylesFromDOM } from '../testing/clear-styles.spec';

@Component({
  selector: 'imx-data-source-toolbar',
  template: '<p>MockDataSourceToolbarComponent</p>'
})
class MockDataSourceToolbarComponent {
}

@Component({
  template:
  `<imx-data-source-toolbar>
    <imx-data-source-toolbar-custom [customContentTemplate]="customToolbarTemplate"></imx-data-source-toolbar-custom>
  </imx-data-source-toolbar>

  <ng-template #customToolbarTemplate>
    <h1>I'm a title</h1>
    <button>I'm a pretty button in a custom toolbar template. Please, click me!</button>
  </ng-template>`
})
class TestHostComponent {
  @ViewChild(DataSourceToolbarCustomComponent, { static: true }) component: DataSourceToolbarCustomComponent;
  @ViewChild(MockDataSourceToolbarComponent, { static: true }) toolbar: MockDataSourceToolbarComponent;
}

describe('DataSourceToolbarCustomComponent', () => {
  let component: DataSourceToolbarCustomComponent;
  let testHostComponent: TestHostComponent;
  let fixture: ComponentFixture<TestHostComponent>;

  configureTestSuite(() => {
    TestBed.configureTestingModule({
      declarations: [
        DataSourceToolbarCustomComponent,
        MockDataSourceToolbarComponent,
        TestHostComponent
      ]
    });
  });


  beforeEach(() => {
    fixture = TestBed.createComponent(TestHostComponent);
    testHostComponent = fixture.componentInstance;
    component = testHostComponent.component;
    fixture.detectChanges();
  });

  afterAll(() => {
    clearStylesFromDOM();
  });

  it('should create a tmeplate and add it to the toolbar', () => {
    expect(component).toBeDefined();
  });
});
