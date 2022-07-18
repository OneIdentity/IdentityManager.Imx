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

import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter, ViewChild, QueryList } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatToolbarModule } from '@angular/material/toolbar';
import { BrowserModule } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { EuiCoreModule, EuiMaterialModule } from '@elemental-ui/core';
import { configureTestSuite } from 'ng-bullet';

import { ValType, IClientProperty, TypedEntity, GroupInfo, IEntity } from 'imx-qbm-dbts';
import { DataSourceToolbarSettings } from 'qbm';
import { DataTableComponent } from './data-table.component';
import { ImxTranslationProviderService } from '../translation/imx-translation-provider.service';
import { mockDSTColumns } from '../testing/dst-mock-help.spec';
import { clearStylesFromDOM } from '../testing/clear-styles.spec';
import { DataTableGroupedData } from './data-table-groups.interface';
import { SelectionModelWrapper } from '../data-source-toolbar/selection-model-wrapper';
import { Subject } from 'rxjs';

class MockDSTTypedEntity extends TypedEntity {
  constructor(keys?: string[]) {
    super({
      GetColumn: __ => ({
        GetDisplayValue: () => 'Display value'
      }),
      GetKeys: () => keys
    } as IEntity);
  }
}

const entityKeys = [
  ['key1', 'key11'],
  ['key1', 'key12'],
];
const entities = entityKeys.map(keys => new MockDSTTypedEntity(keys));

@Component({
  selector: 'imx-data-source-toolbar',
  template: '<p>MockDataSourceToolbarComponent</p>'
})
class MockDataSourceToolbarComponent {
  @Input() public settings: DataSourceToolbarSettings;
  @Output() public settingsChanged = new EventEmitter<DataSourceToolbarSettings>();
  @Output() public shownColumnsSelectionChanged = new EventEmitter<IClientProperty[]>();

  selectionChanged = new Subject();

  numOfSelectedItemsOnPage = () => 0;

  public internalDataSource: MatTableDataSource<MockDSTTypedEntity> = new MatTableDataSource<MockDSTTypedEntity>(entities);
}
@Component({
  template: `
  <imx-data-source-toolbar #dst [settings]="settings"></imx-data-source-toolbar>
  <imx-data-table [dst]="dst" [selectable]="true"></imx-data-table>
  `
})
class TestHostComponent {
  private readonly cols: IClientProperty[] = mockDSTColumns;

  public settings: DataSourceToolbarSettings = {
    dataSource: {
      totalCount: entities.length,
      Data: entities
    },
    navigationState: { StartIndex: 1, PageSize: 25 },
    entitySchema: {
      Columns: {
        'AutoUpdateLevel': this.cols[0],
        'BaseURL': this.cols[1],
        'IsDebug': this.cols[2],
        'IsPrivate': this.cols[3],
        'UID_DialogProduct': this.cols[4]
      }
    },
    displayedColumns: [this.cols[0], this.cols[1], this.cols[4]]
  };
  @ViewChild(DataTableComponent, { static: true }) public component: DataTableComponent<any>;
  @ViewChild(MockDataSourceToolbarComponent, { static: true }) public toolbar: MockDataSourceToolbarComponent;
}

describe('DataTableComponent', () => {
  let component: DataTableComponent<any>;
  let testHostComponent: TestHostComponent;
  let fixture: ComponentFixture<TestHostComponent>;
  let getDisplayValueSpy: jasmine.Spy;

  configureTestSuite(() => {
    TestBed.configureTestingModule({
      imports: [
        CommonModule,
        BrowserModule,
        NoopAnimationsModule,
        EuiCoreModule,
        EuiMaterialModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        MatPaginatorModule,
        MatSortModule,
        MatTableModule,
        MatButtonModule,
        MatMenuModule,
        MatDividerModule,
        MatSidenavModule,
        MatCardModule,
        MatToolbarModule
      ],
      declarations: [
        DataTableComponent,
        MockDataSourceToolbarComponent,
        TestHostComponent],
      providers: [
        {
          provide: ImxTranslationProviderService,
          useClass: class {
            GetColumnDisplay = jasmine.createSpy('GetColumnDisplay');
          }
        }
      ]
    });
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TestHostComponent);
    testHostComponent = fixture.componentInstance;
    component = testHostComponent.component;
    getDisplayValueSpy = spyOn(component, 'getDisplayValue').and.callFake(() => 'displayValue');
  });

  afterAll(() => {
    clearStylesFromDOM();
  });

  // TODO #227277 fix unittests after update on Angular V9
  xit('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
    expect(getDisplayValueSpy).toHaveBeenCalled();
  });

  // TODO #227277 fix unittests after update on Angular V9
  xit('should initialize', () => {
    fixture.detectChanges();
    expect(component.settings).toEqual(testHostComponent.settings);
  });

  it('should have 1 subscription and unsubscribe when destroyed', () => {
    fixture.detectChanges();
    expect(component.dst.settingsChanged.observers.length).toEqual(1);
    component.ngOnDestroy();
    expect(component.dst.settingsChanged.observers.length).toEqual(0);
  });

  it('should return the names of the displayed columns', () => {
    fixture.detectChanges();
    component.selectable = true;
    fixture.detectChanges();
    expect(component.getNamesOfDisplayedColumns().length - 1).toEqual(component.displayedColumns.length);
    component.selectable = false;
    fixture.detectChanges();
    expect(component.getNamesOfDisplayedColumns().length).toEqual(component.displayedColumns.length);
  });

  // TODO #227277 fix unittests after update on Angular V9
  xit('should emit the highlighted entity', () => {
    fixture.detectChanges();
    const highlightedEntity: TypedEntity = component.dataSource.data[0];
    spyOn(component.highlightedEntityChanged, 'emit');
    component.highlightRow(highlightedEntity);
    expect(component.highlightedEntityChanged.emit).toHaveBeenCalledWith(highlightedEntity);
  });

  it('should return display value of a column', () => {
    fixture.detectChanges();
    const entity: TypedEntity = component.dataSource.data[0];
    const property: IClientProperty = {
      Type: ValType.String,
      ColumnName: 'UID_DialogProduct',
      IsValidColumnForFiltering: true,
    }
    expect(component.getDisplayValue(entity, property)).toEqual('displayValue');
  });

  describe('onGroupExpanded() tests', () => {
    let propagateNavSettingsSpy: jasmine.Spy;
    let groupDataChangedSpy: jasmine.Spy;
    const groupKey = 'TestGroup';
    const mockGroup: GroupInfo = { Display: [{Display: groupKey}], Filters: [], Count: 5 };
    beforeEach(() => {
      propagateNavSettingsSpy = spyOn<any>(component, 'propagateNavigationSettingsToGroups');
      groupDataChangedSpy = spyOn(component.groupDataChanged, 'emit');
      component.groupData = {};
    });
    it(`should initialise the groupData entry for the given group if an entry does not exist, make a call to
    propagate the nav settings, init the group changed event and toggle the expanded state on the group`, () => {
      component.onGroupExpanded(mockGroup)
      expect(component.groupData[groupKey]).toEqual({
        data: undefined,
        settings: undefined,
        navigationState: { PageSize: 25, StartIndex: 0, filter: mockGroup.Filters, withProperties:undefined },
        isExpanded: true
      });
      expect(propagateNavSettingsSpy).toHaveBeenCalledWith(true);
      expect(groupDataChangedSpy).toHaveBeenCalledWith(groupKey);
    });

    it(`should not change the groupData entry when it exists with data, but should call to propagate nav settings
    and toggle the 'isExpanded' state of the group`, () => {
      component.groupData[groupKey] = {
        data: {},
        settings: {} as DataSourceToolbarSettings,
        navigationState: { PageSize: 25, StartIndex: 0, filter: mockGroup.Filters },
        isExpanded: true
      };
      component.onGroupExpanded(mockGroup);
      expect(propagateNavSettingsSpy).toHaveBeenCalledWith(true);
      expect(groupDataChangedSpy).not.toHaveBeenCalled();
      expect(component.groupData[groupKey].isExpanded).toEqual(false);

    })
  });

  describe('onNavigationStateChanged() tests', () => {
    it(`should set the newState on the groupData entry and emit the groupData changed event`, () => {
      const groupKey = 'TestGroup2';
      const newState = { PageSize: 25, StartIndex: 0, filter: [] };
      const groupDataChangedSpy = spyOn(component.groupDataChanged, 'emit');
      component.groupData[groupKey] = { data: {}, settings: undefined, navigationState: undefined };
      component.onNavigationStateChanged(groupKey, newState);
      expect(component.groupData[groupKey].navigationState).toEqual(newState);
      expect(groupDataChangedSpy).toHaveBeenCalledWith(groupKey);
    })
  });

  describe('dstHasChanged() Grouping tests', () => {
    const mockColumns: any[] = [
      { columnDef: { name: 'testCol1' } },
      { columnDef: { name: 'testCol2' } },
    ];
    const mockGenericColumns: any[] = [ { columnDef: { name: 'testGenericCol3' } }];
    const expectedColumnDefs: any[] = [
      { name: 'testCol1' }, { name: 'testCol2' }, { name: 'testGenericCol3' }
    ];
    const matTableMock = {
      addColumnDef: jasmine.createSpy('addColumnDef'),
      removeColumnDef: jasmine.createSpy('removeColumnDef')
    } as any;
    beforeEach(() => {
      component.dst = { clearSelection: () => {} } as any;
      component.dst.dataSourceChanged = {} as any;
      component.mode = 'manual';
      matTableMock.addColumnDef.calls.reset();
      component.table = matTableMock;
    });
    it(`should make a call to propagate the nav settings and initialise the groupedDataSource when
    the settings have a 'currentGrouping' on the groupedData`, () => {
      const propagateNavSettingsSpy = spyOn<any>(component, 'propagateNavigationSettingsToGroups');
      const mockGroupingData = { Display: [{Display: 'Group1'}], Filters: [], Count: 5 };
      component.settings = {
        groupData: { groups: [],
          currentGrouping: {
            display: 'some group name',
            getData: () => Promise.resolve([ mockGroupingData ])
          }}
      } as DataSourceToolbarSettings;
      component['dstHasChanged']();
      expect(propagateNavSettingsSpy).toHaveBeenCalled();
      expect(component.groupedDataSource).toBeDefined();
    });

    it(`should setup the columnsDefs array and push them to the table if the mode is set to 'manual'`,() => {
      component.manualColumns = mockColumns as any;
      component.manualGenericColumns = mockGenericColumns as any;
      component['dstHasChanged']();
      expect(component['columnDefs']).toEqual(expectedColumnDefs);
      expect(component.table.addColumnDef).toHaveBeenCalledTimes(3);
    });

    it(`should use the 'parentManualColumns' and 'parentManualGenericColumns' inputs if available and
    the 'manualColumns' and 'manualGenericColumns' queryLists don't have any entries to support 'manual'
    mode in a groupedBy context`, () => {
      component.manualColumns = new QueryList<any>();
      component.manualGenericColumns = new QueryList<any>();
      component.parentManualColumns = mockColumns as any;
      component.parentManualGenericColumns = mockGenericColumns as any;
      component['dstHasChanged']();
      expect(component['columnDefs']).toEqual(expectedColumnDefs);
      expect(component.table.addColumnDef).toHaveBeenCalledTimes(3);
    });
  });

  describe('selectionInGroupChanged(items: TypedEntity[], groupKey: string)', () => {
    function toEntities(keys) {
      return keys.map(key => ({
        GetEntity: () => ({ GetKeys: () => [key]})
      })) as TypedEntity[];
    }

    function toKeys(entities) {
      return entities.map(item => item.GetEntity().GetKeys().join(','));
    }

    it('organizes selected items in separate entries for each group and propagates all selected items to the parent selection', fakeAsync(() => {
      component.dst = new class {
        selection = new SelectionModelWrapper();
        checked = item => this.selection.checked(item);
        unChecked = item => this.selection.unChecked(item);
      }() as any;

      const selection = component.dst['selection'];

      const groupDataKey1 = 'someKey1';
      const groupDataKey2 = 'someKey2';
      component.groupData[groupDataKey1] = {} as DataTableGroupedData;
      component.groupData[groupDataKey2] = {} as DataTableGroupedData;

      // Select in group 1 and 2:
      const selectInGroup1 = ['item1.1', 'item1.2'];
      const selectInGroup2 = ['item2.1', 'item2.2'];

      component.selectionInGroupChanged(toEntities(selectInGroup1), groupDataKey1);
      component.selectionInGroupChanged(toEntities(selectInGroup2), groupDataKey2);
      tick();

      expect(toKeys(selection.selected)).toEqual(selectInGroup1.concat(selectInGroup2));
      expect(toKeys(component.groupData[groupDataKey1].selected)).toEqual(selectInGroup1);
      expect(toKeys(component.groupData[groupDataKey2].selected)).toEqual(selectInGroup2);

      // Select in group 1 (new selection):
      const selectInGroup1NewSelection = ['item1.3'];

      component.selectionInGroupChanged(toEntities(selectInGroup1NewSelection), groupDataKey1);
      tick();

      expect(toKeys(selection.selected)).toEqual(selectInGroup2.concat(selectInGroup1NewSelection));
      expect(toKeys(component.groupData[groupDataKey1].selected)).toEqual(selectInGroup1NewSelection);
      expect(toKeys(component.groupData[groupDataKey2].selected)).toEqual(selectInGroup2);
    }));
  });
});
