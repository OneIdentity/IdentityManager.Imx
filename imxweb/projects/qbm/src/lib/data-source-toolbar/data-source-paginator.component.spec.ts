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

import { Component, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { configureTestSuite } from 'ng-bullet';

import { DataSourcePaginatorComponent } from './data-source-paginator.component';
import { DataSourceToolbarSettings } from './data-source-toolbar-settings';
import { TypedEntity } from 'imx-qbm-dbts';
import { clearStylesFromDOM } from '../testing/clear-styles.spec';

@Component({
  selector: 'imx-data-source-toolbar',
  template: '<p>MockDataSourceToolbarComponent</p>'
})
class MockDataSourceToolbarComponent {
  @Input() settings: any;
  @Output() settingsChanged = new EventEmitter<DataSourceToolbarSettings>();
  navigationChanged = jasmine.createSpy('navigationChanged');
}

@Component({
  template: `
  <imx-data-source-toolbar #dst [settings]="settings"></imx-data-source-toolbar>
  <imx-data-source-paginator [dst]="dst"></imx-data-source-paginator>
  `
})
class TestHostComponent {
  settings: DataSourceToolbarSettings;
  @ViewChild(DataSourcePaginatorComponent, { static: true }) component: DataSourcePaginatorComponent;
  @ViewChild(MockDataSourceToolbarComponent, { static: true }) toolbar: MockDataSourceToolbarComponent;
}

describe('DataSourcePaginatorComponent', () => {
  let component: DataSourcePaginatorComponent;
  let testHostComponent: TestHostComponent;
  let fixture: ComponentFixture<TestHostComponent>;

  configureTestSuite(() => {
    TestBed.configureTestingModule({
      declarations: [
        DataSourcePaginatorComponent,
        MockDataSourceToolbarComponent,
        TestHostComponent
      ],
      imports: [
        MatPaginatorModule,
        NoopAnimationsModule
      ]
    });
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TestHostComponent);
    testHostComponent = fixture.componentInstance;
    component = testHostComponent.component;
  });

  afterAll(() => {
    clearStylesFromDOM();
  });

  it('sets paginator on changes', () => {
    const settings = {
      dataSource: { totalCount: 1, Data: [{}] as TypedEntity[] },
      navigationState: { StartIndex: 1, PageSize: 1 },
      entitySchema: { Columns: {} },
      displayedColumns: []
    };

    testHostComponent.settings = settings;

    fixture.detectChanges();

    expect(component.paginator.length).toEqual(settings.dataSource.totalCount);
    expect(component.paginator.pageSize).toEqual(settings.navigationState.PageSize);
    expect(component.paginator.pageIndex).toEqual(1);
  });

  it('subscribes to DataSourceToolbarComponent settingsChanged on changes, adds only 1 observer', () => {
    expect(testHostComponent.toolbar.settingsChanged.observers.length).toEqual(0);

    fixture.detectChanges();

    expect(testHostComponent.toolbar.settingsChanged.observers.length).toEqual(1);

    testHostComponent.settings = {
      dataSource: { totalCount: 0, Data: [] },
      navigationState: { },
      entitySchema: { Columns: {} },
      displayedColumns: []
    };

    fixture.detectChanges();

    expect(testHostComponent.toolbar.settingsChanged.observers.length).toEqual(1);
  });

  it('sets paginator on subscription events', () => {
    const settings = {
      dataSource: { totalCount: 1, Data: [{}] as TypedEntity[] },
      navigationState: { StartIndex: 1, PageSize: 1 },
      entitySchema: { Columns: {} },
      displayedColumns: []
    };

    fixture.detectChanges();

    testHostComponent.toolbar.settingsChanged.emit(settings);

    expect(component.paginator.length).toEqual(settings.dataSource.totalCount);
    expect(component.paginator.pageSize).toEqual(settings.navigationState.PageSize);
    expect(component.paginator.pageIndex).toEqual(1);
  });

  it('calls DataSourceToolbarComponent navigationChanged on paginator state changed', () => {
    const settings = {
      dataSource: { totalCount: 1, Data: [{}] as TypedEntity[] },
      navigationState: { StartIndex: 1, PageSize: 1 },
      entitySchema: { Columns: {} },
      displayedColumns: []
    };

    testHostComponent.settings = settings;

    fixture.detectChanges();

    component.onPaginatorStateChanged({} as PageEvent);

    expect(testHostComponent.toolbar.navigationChanged).toHaveBeenCalled();
  });

  it('unsubscribes on destroy', () => {
    fixture.detectChanges();

    expect(testHostComponent.toolbar.settingsChanged.observers.length).toEqual(1);

    component.ngOnDestroy();

    expect(testHostComponent.toolbar.settingsChanged.observers.length).toEqual(0);
  });
});
