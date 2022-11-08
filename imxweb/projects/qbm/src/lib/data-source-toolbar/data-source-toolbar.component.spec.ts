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
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { EuiCoreModule, EuiMaterialModule } from '@elemental-ui/core';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { configureTestSuite } from 'ng-bullet';
import { TypedEntity, DataModelFilterOption, IClientProperty, IEntity, ValType } from 'imx-qbm-dbts';
import { DataSourceToolbarComponent } from './data-source-toolbar.component';
import { clearStylesFromDOM } from '../testing/clear-styles.spec';
import { DataSourceToolbarFilter, DataSourceToolbarSelectedFilter } from './data-source-toolbar-filters.interface';
import { DataSourceToolBarGroup } from './data-source-toolbar-groups.interface';
import { MatTableDataSource } from '@angular/material/table';

describe('DataSourceToolbarComponent', () => {
  let component: DataSourceToolbarComponent;
  let fixture: ComponentFixture<DataSourceToolbarComponent>;

  const settings = {
    dataSource: { totalCount: 1, Data: [{}] as TypedEntity[] },
    navigationState: { StartIndex: 1, PageSize: 1 },
    entitySchema: { Columns: {} },
    displayedColumns: [],
    filters: []
  };

  const startIndex = 500;
  const pageSize = 250;

  const navigationState = {
    StartIndex: startIndex,
    PageSize: pageSize
  };

  configureTestSuite(() => {
    TestBed.configureTestingModule({
      declarations: [DataSourceToolbarComponent],
      imports: [
        NoopAnimationsModule,
        EuiCoreModule,
        EuiMaterialModule,
        MatFormFieldModule,
        MatMenuModule,
        MatIconModule,
        MatTooltipModule
      ]
    });
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DataSourceToolbarComponent);
    component = fixture.componentInstance;
  });

  afterAll(() => {
    clearStylesFromDOM();
  });

  [
    { views: ['view1'], expectedViewsCount: 1 },
    { views: ['view1', 'view2'], expectedViewsCount: 2 },
    { views: ['view1', 'view2', 'view3'], expectedViewsCount: 2 }
  ].forEach(testcase =>
    it(`sets its views (view count: ${testcase.views.length})`, () => {
      component.views = testcase.views;
      component.ngOnInit();
      fixture.detectChanges();
      expect(component.views.length).toEqual(testcase.expectedViewsCount);
    })
  );

  it('binds toolbars settings and emits those settings', async () => {
    const changes = {
      settings: {
        currentValue: settings,
        previousValue: {},
        firstChange: null,
        isFirstChange: null
      },
    };
    spyOn(component.settingsChanged, 'emit');
    component.settings = settings;
    await component.ngOnChanges(changes);
    fixture.detectChanges();

    expect(component.settingsChanged.emit).toHaveBeenCalledWith(settings);
  });

  it('sets the navigation state', () => {
    spyOn(component.navigationStateChanged, 'emit');
    component.settings = settings;
    component.navigationChanged(navigationState);
    fixture.detectChanges();

    expect(component.navigationStateChanged.emit).toHaveBeenCalledWith(navigationState);
    expect(component.settings.navigationState.StartIndex).toEqual(startIndex);
    expect(component.settings.navigationState.PageSize).toEqual(pageSize);
  });

  it('sets the search keyword and emits that value', () => {
    component.settings = settings;
    const keyword = 'lion';
    spyOn(component.search, 'emit');
    component.onSearch(keyword);
    fixture.detectChanges();

    expect(component.search.emit).toHaveBeenCalledWith(keyword);
  });

  xit('sets the preselected search keyword', () => {
    component.settings = settings;
    component.keywords = 'lion dragons unicorns';
    fixture.detectChanges();
    const htmlElem: HTMLElement = fixture.nativeElement;
    const searchInput = (htmlElem.querySelector('input.eui-search-input') as HTMLInputElement).value;
    expect(component.keywords).toEqual(searchInput);
  });

  describe('Data state getter tests', () => {
    const mockSettings: any = {
      dataSource: { totalCount: 1, Data: [{}] as TypedEntity[] },
      navigationState: { StartIndex: 1, PageSize: 25, search: '' },
    };
    beforeEach(() => {
      component.settings = mockSettings;
    });
    describe('showDataSourceToolbar', () => {
      let dsHasDataSpy: jasmine.Spy;
      let searchAppliedSpy: jasmine.Spy;
      let filterAppliedSpy: jasmine.Spy;
      beforeEach(() => {
        dsHasDataSpy = spyOnProperty(component, 'dataSourceHasData');
        searchAppliedSpy = spyOnProperty(component, 'searchCurrenltyApplied');
        filterAppliedSpy = spyOnProperty(component, 'filtersCurrentlyApplied');
      });
      it('should return true when there is a search or filter applied', () => {
        component.alwaysVisible = true;
        dsHasDataSpy.and.returnValue(false);
        searchAppliedSpy.and.returnValue(false);
        expect(component.showDataSourceToolbar).toEqual(true);
        component.alwaysVisible = false;
        searchAppliedSpy.and.returnValue(true);
        filterAppliedSpy.and.returnValue(false);
        expect(component.showDataSourceToolbar).toEqual(true);
        component.alwaysVisible = false;
        searchAppliedSpy.and.returnValue(false);
        filterAppliedSpy.and.returnValue(true);
        expect(component.showDataSourceToolbar).toEqual(true);
      });
      it('should return true when `dataSourceHasData` is true', () => {
        component.alwaysVisible = true;
        searchAppliedSpy.and.returnValue(false);
        filterAppliedSpy.and.returnValue(false);
        dsHasDataSpy.and.returnValue(true);
        expect(component.showDataSourceToolbar).toEqual(true);
      });
      it('should return false when `dataSourceHasData` is false ', () => {
        component.alwaysVisible = false;
        dsHasDataSpy.and.returnValue(false);
        searchAppliedSpy.and.returnValue(false);
        filterAppliedSpy.and.returnValue(false);
        expect(component.showDataSourceToolbar).toEqual(false);
      });
    });
    describe('dataSourceHasData', () => {
      // TODO: Ist beim Upgrade auf Angular v11 kaputgegangrn. Reactivate
      // it('should return true when the datasource has a totalCount greater than 0', () => {
      //   expect(component.dataSourceHasData).toEqual(true);
      // });
      it('should return false when the datasource has a totalCount is 0', () => {
        mockSettings.dataSource.totalCount = 0;
        expect(component.dataSourceHasData).toEqual(false);
      });
    });
    describe('searchCurrenltyApplied', () => {
      it('should return true when the navigationState search property has a value', () => {
        mockSettings.navigationState.search = 'testSearch';
        expect(component.searchCurrenltyApplied).toEqual(true);
      });
      it('should return false when the navigationState search property is empty or undefined', () => {
        mockSettings.navigationState.search = '';
        expect(component.searchCurrenltyApplied).toEqual(false);
        mockSettings.navigationState.search = undefined;
        expect(component.searchCurrenltyApplied).toEqual(false);
      });
    });
    describe('filtersCurrentlyApplied', () => {
      it('should return true when the selectedFilters array is not empty', () => {
        component.selectedFilters = [ { selectedOption: { Value: '' }, filter: {} } ];
        expect(component.filtersCurrentlyApplied).toEqual(true);
      });
      it('should return false when the selectedFilters array is empty', () => {
        component.selectedFilters = [];
        expect(component.filtersCurrentlyApplied).toEqual(false);
      });
    });
  });

  describe('Filtering tests', () => {
    let updateNavigateStateWithFiltersSpy: jasmine.Spy;
    let removeSelectedFilterSpy: jasmine.Spy;
    let rebuildSelectedDelimitedSpy: jasmine.Spy;
    const mockOption1: DataModelFilterOption = { Display: 'option 1', Value: '0' };
    const mockOption2: DataModelFilterOption = { Display: 'option 2', Value: '1' };
    const mockFilter: DataSourceToolbarFilter = { Name: 'filter-test', Options: [mockOption1, mockOption2] };

    beforeEach(() => {
      updateNavigateStateWithFiltersSpy = spyOn<any>(component, 'updateNavigateStateWithFilters');
      removeSelectedFilterSpy = spyOn(component, 'removeSelectedFilter').and.callThrough();
      rebuildSelectedDelimitedSpy = spyOn<any>(component, 'rebuildSelectedDelimitedValue').and.callThrough();
      component = fixture.componentInstance;
      component.settings = settings;
    });

    describe('onCheckboxFilterChanged() tests', () => {
      it(`should add the selected option to 'selectedFilters' when the checkbox is checked`, () => {
        component.onCheckboxFilterChanged(mockFilter, mockOption1, { source: undefined, checked: true});
        expect(component.selectedFilters.length).toEqual(1);
        expect(component.selectedFilters).toEqual([{ filter: mockFilter, selectedOption: mockOption1 }]);
        expect(removeSelectedFilterSpy).not.toHaveBeenCalled();
        expect(updateNavigateStateWithFiltersSpy).toHaveBeenCalled();

      });

      it(`should remove the selected option from 'selectedFilters' and clear the 'currentValue' when the checkbox is unchecked`, () => {
        component.selectedFilters.push({ selectedOption: mockOption2, filter: { ...mockFilter, 'CurrentValue': '1' }});
        component.onCheckboxFilterChanged(mockFilter, mockOption2, { source: undefined, checked: false });
        expect(component.selectedFilters.length).toEqual(0);
        expect(removeSelectedFilterSpy).toHaveBeenCalledWith(mockFilter, false, '1');
        expect(updateNavigateStateWithFiltersSpy).toHaveBeenCalled();
      });
    });

    describe('onRadioFilterChanged() tests', () => {
      it(`should add the selected option to 'selectedFilters' when the filter doesn't already have a value set`, () => {
        component.selectedFilters = [];
        component.onRadioFilterChanged(mockFilter, mockOption1);
        expect(component.selectedFilters.length).toEqual(1);
        expect(component.selectedFilters).toEqual([{ filter: mockFilter, selectedOption: mockOption1 }]);
        expect(updateNavigateStateWithFiltersSpy).toHaveBeenCalled();
      });

      it(`should update the selected option in 'selectedFilters' when a different option is selected`, () => {
        component.selectedFilters.push({selectedOption: mockOption2, filter: { ...mockFilter, 'CurrentValue': '0' }});
        component.onRadioFilterChanged(mockFilter, mockOption2);
        expect(component.selectedFilters.length).toEqual(1);
        expect(component.selectedFilters).toEqual([{ filter: mockFilter, selectedOption: mockOption2 }]);
        expect(updateNavigateStateWithFiltersSpy).toHaveBeenCalled();
      });
    });

    describe('selectFilterValueChanged() tests', () => {
      it(`should find the matching filter option based on the value selected and call 'onRadioFilterChanged()' to handle the changes`, () => {
        const onRadioFilterChangedSpy = spyOn(component, 'onRadioFilterChanged');
        component.selectFilterValueChanged(mockFilter, { source: undefined, value: '1'});
        expect(onRadioFilterChangedSpy).toHaveBeenCalledWith(mockFilter, mockOption2);
      });
    });

    describe('multiSelectFilterValueChange() tests', () => {
      it(`should clear existing selected values for the filter and all new values selected then make relevant calls to handle the changes`, () => {
        const mockOption3: DataModelFilterOption = { Display: 'option 3', Value: '2' };
        const delimitedFilter: DataSourceToolbarFilter = { Name: 'filter-test', Delimiter: ',', Options: [mockOption1, mockOption2, mockOption3], CurrentValue: '1,2' };
        component.selectedFilters = [
          {selectedOption: mockOption2, filter: delimitedFilter},
          {selectedOption: mockOption3, filter: delimitedFilter}
        ];
        component.multiSelectFilterValueChange(delimitedFilter, { source: undefined, value: ['0', '2']});
        expect(rebuildSelectedDelimitedSpy).toHaveBeenCalledWith(delimitedFilter);
        expect(updateNavigateStateWithFiltersSpy).toHaveBeenCalled();
        expect(delimitedFilter.CurrentValue).toEqual('0,2');
      });
    });

    describe('getMultiSelectCurrentValue() tests', () => {
      it('should take the filters currentValue string property and retrun and array of the delimited values', () => {
        const mockDelimitedFilter: DataSourceToolbarFilter = { Name: 'filter-test', Delimiter: ',', Options: [], CurrentValue: 'test1,test2,test3' };
        expect(component.getMultiSelectCurrentValue(mockDelimitedFilter)).toEqual(['test1', 'test2', 'test3']);
      });
    });

    describe('clearFilters() tests', () => {
      it(`should reset 'selectedFilters' to empty and clear all 'CurrentValue' properties on the filters` , () => {
        component.settings.filters = [{ ...mockFilter, CurrentValue: '1' }];
        component.selectedFilters.push({ selectedOption: mockOption1, filter: { ...mockFilter, 'CurrentValue': '0' }});
        component.selectedFilters.push({ selectedOption: mockOption2, filter: { ...mockFilter, 'CurrentValue': '1' }});
        component.clearFilters();
        expect(component.selectedFilters.length).toEqual(0);
        expect(component.settings.filters).toEqual([ { ...mockFilter, CurrentValue: undefined }]);
      });
    });

    describe('removeSelectedFilter() tests', () => {
      let mockFilter2: DataSourceToolbarFilter;
      let mockSelectedFilters: DataSourceToolbarSelectedFilter[];
      beforeEach(() => {
        mockFilter2 = { Name: 'filter-test-2', Options: [ mockOption1 ] }
        mockSelectedFilters = [{ selectedOption: mockOption2, filter: mockFilter }, { selectedOption: mockOption1, filter: mockFilter2 }];
        component.selectedFilters = mockSelectedFilters;
      });
      it(`should find and remove the entry matching the supplied filter from the 'selectedFilters' list when there is a matching filter`, () => {
        component.removeSelectedFilter(mockFilter, true);
        expect(component.selectedFilters.length).toEqual(1);
        expect(component.selectedFilters).toEqual([{ selectedOption: mockOption1, filter: mockFilter2 }]);
        expect(updateNavigateStateWithFiltersSpy).toHaveBeenCalled();
      });

      it(`should find and remove the entry matching the supplied filter from the 'selectedFilters' list when there is a matching filter
      but not emit the change when 'emitChange' is supplied as 'false'`, () => {
        component.removeSelectedFilter(mockFilter, false);
        expect(component.selectedFilters.length).toEqual(1);
        expect(component.selectedFilters).toEqual([{ selectedOption: mockOption1, filter: mockFilter2 }]);
        expect(updateNavigateStateWithFiltersSpy).not.toHaveBeenCalled();
      });

      it (`should find and remove the matching supplied filter from the list,
      and when the filter has a Delimiter it should call to rebuild currentValue`, () => {
        component.removeSelectedFilter({ ...mockFilter, Delimiter: ',' }, false);
        expect(component.selectedFilters.length).toEqual(1);
        expect(component.selectedFilters).toEqual([{ selectedOption: mockOption1, filter: mockFilter2 }]);
        expect(rebuildSelectedDelimitedSpy).toHaveBeenCalled();
        expect(updateNavigateStateWithFiltersSpy).not.toHaveBeenCalled();
      });

      it(`should do nothing when the supplied filter does not match a filter in 'selectedFilters' list`, () => {
        const unSelectedFilter: DataSourceToolbarFilter = { Name: 'filter=test-unknown', Options: [ mockOption2 ] };
        component.removeSelectedFilter(unSelectedFilter);
        expect(component.selectedFilters.length).toEqual(2);
        expect(component.selectedFilters).toEqual(mockSelectedFilters);
        expect(updateNavigateStateWithFiltersSpy).not.toHaveBeenCalled();
      });

      it(`should find and remove the specific value for the matching supplied filter from the 'selectedFilters' list
      when a 'optionValue' is supplied as well`, () => {
        const mockOpt3 = { Display: 'option 3', Value: '2' };
        mockFilter2.CurrentValue = '1,2';
        mockFilter2.Delimiter = ',';
        mockFilter2.Options.push(mockOpt3);
        component.selectedFilters.push({ selectedOption: mockOpt3, filter: mockFilter2 });
        expect(component.selectedFilters.length).toEqual(3);
        component.removeSelectedFilter(mockFilter2, false, '2');
        expect(component.selectedFilters.length).toEqual(2);
        expect(mockFilter2.CurrentValue).toEqual('0');
      });
    });
  });

  describe('Grouping tests', () => {

    const mockGroup = { property: { Display: 'group name' }, getData: () => Promise.resolve([]) } as DataSourceToolBarGroup;
    let settingsChangedEmitSpy: jasmine.Spy;

    beforeEach(() => {
      settingsChangedEmitSpy = spyOn(component.settingsChanged, 'emit');
      component.settings = settings;
      component.settings.groupData = {
        groups: [],
        currentGrouping: undefined
      };
    });

    describe('onGroupSelected() tests', () => {
      it('should assign the currentGrouping to the groupData object on the settings and emit settingsChanged event', () => {

        expect(component.settings.groupData.currentGrouping).toBeUndefined();
        component.onGroupSelected(mockGroup);
        expect(component.settings.groupData.currentGrouping.display).toEqual(mockGroup.property.Display);
        expect(settingsChangedEmitSpy).toHaveBeenCalledWith(component.settings);
      });
    });

    describe('clearGroupedBy()', () => {
      it('should remove the currentGrouping from the groupData and emit settingsChanged event', () => {
        component.settings.groupData.currentGrouping = { display: '', getData: () => Promise.resolve([]) };
        component.clearGroupedBy();
        expect(component.settings.groupData.currentGrouping).toBeUndefined;
        expect(settingsChangedEmitSpy).toHaveBeenCalledWith(component.settings);
      });
    });

    describe('getGroupColumnDisplay DataModelProperty', () => {
      it('should get  display by schema', () => {
        component.entitySchema = {Columns: { IdentityType: {Type: ValType.String,ColumnName:'IdentityType'}}}
        const property = { Property: { ColumnName: 'IdentityType',Display: 'the Display' } as IClientProperty };
        expect(component.getGroupColumnDisplay({ property } as DataSourceToolBarGroup)).toEqual('the Display');
      });
    });

    describe('getGroupColumnDisplay DataModelGroupInfo', () => {
      it('should use Display', () => {
        const property = { Display: 'IdentityType' };
        expect(component.getGroupColumnDisplay({ property } as DataSourceToolBarGroup)).toEqual(property.Display);
      });
    });
  });

  describe('Selection tests', () => {
    class SomeTypedEntity extends TypedEntity {
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

    const entities = entityKeys.map(keys => new SomeTypedEntity(keys));

    it('should check how many items on the current page are selected', () => {
      fixture.detectChanges();

      component.internalDataSource = new MatTableDataSource(entities);

      expect(component.numOfSelectedItemsOnPage()).toEqual(0);

      const entity = entities[0];

      component.checked(entity);

      expect(component.numOfSelectedItemsOnPage()).toEqual(1);

      component.unChecked(entity);

      expect(component.numOfSelectedItemsOnPage()).toEqual(0);
    });

    it('should select all rows and deselect them', () => {
      fixture.detectChanges();

      component.internalDataSource = new MatTableDataSource(entities);

      expect(component.allSelected()).toEqual(false);
      component.toggleSelection();
      expect(component.allSelected()).toEqual(true);
      expect(component.numOfSelectedItems).toEqual(entities.length);
      component.toggleSelection();
      expect(component.allSelected()).toEqual(false);
      expect(component.numOfSelectedItems).toEqual(0);
    });

    it('should select and unselect an item', () => {
      component.internalDataSource = new MatTableDataSource(entities);

      const entity = entities[0];

      component.toggle(entity);
      expect(component.isChecked(entity)).toEqual(true);

      component.toggle(entity);
      expect(component.isChecked(entity)).toEqual(false);
    })
  });
});

