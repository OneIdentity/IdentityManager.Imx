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
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { CdkTableModule } from '@angular/cdk/table';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { configureTestSuite } from 'ng-bullet';
import { TranslateModule, TranslateLoader, TranslateFakeLoader } from '@ngx-translate/core';
import { LoggerTestingModule } from 'ngx-logger/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { ImxExpandableItem } from './imx-data-source';
import { Test } from './tableTestClasses.spec';
import { ImxTreeTableComponent } from './treeTable.component';
import { QbmModule } from '../qbm.module';

@Component({
  template: `
    <imx-tree-table [dataSource]="wrapperTableDataSource">
      <imx-column *ngFor="let id of columnIds" [field]="id"></imx-column>
    </imx-tree-table>
  `
})
class SimpleTestComponent {
  @ViewChild(ImxTreeTableComponent, { static: true}) table: ImxTreeTableComponent<any>;
  get wrapperTableDataSource() {
    return this.dataSource;
  }
  readonly columnIds = ['JobChainName', 'TaskName'];

  private dataSource: Test;
  getfirstColumn = (data: any) => data.FirstColumn;
  getsecondColumn = (data: any) => data.SecondColumn;

  public init(dataSource: Test): void {
    this.dataSource = dataSource;
  }
}

describe('TreeTableComponent', () => {
  let component: SimpleTestComponent;
  let fixture: ComponentFixture<SimpleTestComponent>;
  const treeItems = ['x', 'y', 'z'];

  configureTestSuite(() => {
    TestBed.configureTestingModule({
      imports: [
        LoggerTestingModule,
        RouterTestingModule,
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useClass: TranslateFakeLoader }
        }),
        QbmModule,
        NoopAnimationsModule,
        MatTableModule,
        MatPaginatorModule,
        CdkTableModule
      ],
      declarations: [
        SimpleTestComponent
      ]
    });
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SimpleTestComponent);
    component = fixture.componentInstance;
    component.init(new Test(treeItems));
  });

  it('should create', async () => {
    fixture.detectChanges();
    await fixture.whenStable();

    expect(component.wrapperTableDataSource.data.length).toBe(treeItems.length);
  });

  it('is calling events', async () => {
    fixture.detectChanges();
    await fixture.whenStable();

    const test = new ImxExpandableItem({ test: 'versuch' }, null, 0);
    const clickSpy = spyOn(component.table.rowClicked, 'emit');
    component.table.RowIsClicked(test);
    expect(clickSpy).toHaveBeenCalled();
  });

  it('expand and collapse nodes', async () => {
    fixture.detectChanges();

    await fixture.whenStable();

    const exp = spyOn(component.wrapperTableDataSource, 'LoadChildItems');
    const coll = spyOn(component.wrapperTableDataSource, 'RemoveChildItems');
    component.table.handleExpandEvent(component.wrapperTableDataSource.expandableData[0], true);

    expect(exp).toHaveBeenCalled();
    component.table.handleExpandEvent(component.wrapperTableDataSource.expandableData[0], false);
    expect(coll).toHaveBeenCalled();
  });

  it('expand and collapse nodes', async () => {
    fixture.detectChanges();

    await fixture.whenStable();

    const loadspy = spyOn(component.wrapperTableDataSource, 'LoadItems');
    component.wrapperTableDataSource.LoadItems();

    expect(loadspy).toHaveBeenCalled();
  });

  it('expand and collapse nodes when level=0', async () => {
    const data = {
      data: null,
      parent: null,
      level: 0,
      isExpanded: false,
      isRoot: false
    } as ImxExpandableItem<any>;

    fixture.detectChanges();

    await fixture.whenStable();

    const CollapseRoot = spyOn(component.wrapperTableDataSource, 'CollapseRoot');
    const ExpandRoot = spyOn(component.wrapperTableDataSource, 'ExpandRoot');
    const LoadChildItems = spyOn(component.wrapperTableDataSource, 'LoadChildItems');
    const RemoveChildItems = spyOn(component.wrapperTableDataSource, 'RemoveChildItems');
    component.table.handleExpandEvent(data, true);
    expect(CollapseRoot).toHaveBeenCalled();
    expect(LoadChildItems).toHaveBeenCalled();
    component.table.handleExpandEvent(data, false);
    expect(ExpandRoot).toHaveBeenCalled();
    expect(RemoveChildItems).toHaveBeenCalled();
  });

  it('provides proper CSS for the button', () => {
    fixture.detectChanges();

    spyOn(component.wrapperTableDataSource, 'CollapseRoot');

    expect(component.table.ButtonClass).toEqual('k-icon k-i-collapse');
    component.table.buttonClicked();
    expect(component.table.ButtonClass).toEqual('k-icon k-i-expand');
  });

  [
    {
      rootType: 'ColumnTemplate' as 'RootTemplate' | 'String' | 'ColumnTemplate' | 'None',
      isRoot: false,
      expected: false
    },
    {
      rootType: 'ColumnTemplate' as 'RootTemplate' | 'String' | 'ColumnTemplate' | 'None',
      isRoot: true,
      expected: false
    },
    {
      rootType: 'None' as 'RootTemplate' | 'String' | 'ColumnTemplate' | 'None',
      isRoot: true,
      expected: true
    }
  ].forEach(testcase =>
    it(`isExpansionDetailRow is correct when rootType=${testcase.rootType} and isRoot=${testcase.isRoot}`, () => {
      component.table.rootType = testcase.rootType;
      expect(
        component.table.isExpansionDetailRow(0, {
          data: null,
          parent: null,
          level: 0,
          isExpanded: false,
          isRoot: testcase.isRoot
        })
      ).toEqual(testcase.expected);
    })
  );

  it('toggles between collapsed and expanded when the button is clicked', () => {
    fixture.detectChanges();

    const CollapseRoot = spyOn(component.wrapperTableDataSource, 'CollapseRoot');
    const ExpandRoot = spyOn(component.wrapperTableDataSource, 'ExpandRoot');

    component.table.buttonClicked();
    expect(CollapseRoot).toHaveBeenCalled();
    component.table.buttonClicked();
    expect(ExpandRoot).toHaveBeenCalled();
  });

  function getNumOfObservers(): number {
    let numOfObservers = 0;
    component.table.simpleColumns.map(c => c.itemExpanded.observers.length + c.itemCollapsed.observers.length)
      .forEach(c => numOfObservers += c);
    return numOfObservers;
  }

  it('unsubscribes on destroy', async () => {
    fixture.detectChanges();

    await component.table.ngAfterContentInit()

    expect(component.table.simpleColumns.length).toEqual(component.columnIds.length);

    expect(getNumOfObservers()).toEqual(8);

    component.table.ngOnDestroy();

    expect(getNumOfObservers()).toEqual(0);
  });
});

@Component({
  template: `
    <imx-tree-table [dataSource]="wrapperTableDataSource"></imx-tree-table>
  `
})
class TestComponent {
  get wrapperTableDataSource() {
    return { hasChildrenProvider: false };
  }
}

describe('TreeTableComponent ErrorHandling', () => {

  configureTestSuite(() => {
    TestBed.configureTestingModule({
      imports: [
        LoggerTestingModule,
        RouterTestingModule,
        QbmModule
      ],
      declarations: [TestComponent]
    });
  });
});
