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
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { EuiSelectOption } from '@elemental-ui/core';
import { IEntity } from 'imx-qbm-dbts';
import { TsbTestBed } from '../test/tsb-test-bed.spec';
import { TsbCommonTestData } from '../test/common-test-mocks.spec';
import { DataSourceToolbarComponent, DataSourceToolbarSelectedFilter } from 'qbm';
import { DeHelperService } from '../de-helper.service';
import { DataExplorerFiltersComponent, DataExplorerFilterTypes } from './data-explorer-filters.component';
import { ContainerTreeDatabaseWrapper } from '../container-list/container-tree-database-wrapper';

const mockService: any = {};
const selectClearSearchSpy = jasmine.createSpy('clearSearch');
const selectClearSelectionSpy = jasmine.createSpy('clearSelectionsInside');
const selectWriteValueSpy = jasmine.createSpy('writeValue');
const mockValue = 'test1';
const newValue: EuiSelectOption = { value: mockValue, display: 'Test 1' };
const newUndefinedValue: EuiSelectOption = { value: undefined, display: undefined };
const mockDst = { selectedFilters: [] } as DataSourceToolbarComponent;
const mockSelect: any = {
  searchInput: { clearSearch: selectClearSearchSpy },
  clearSelectionsInside: selectClearSelectionSpy,
  writeValue: selectWriteValueSpy
};

class MockTreeDbWrapper extends ContainerTreeDatabaseWrapper {
  constructor() {
    super(mockService, mockService);
  }
}

describe('DataExplorerFiltersComponent', () => {
  let component: DataExplorerFiltersComponent;
  let fixture: ComponentFixture<DataExplorerFiltersComponent>;
  let clearContainerFilterSelectionSpy: jasmine.Spy;
  let clearTsFilterSelectionSpy: jasmine.Spy;
  let selectedFiltersChangeEmitSpy: jasmine.Spy;
  let clearDstSelectedFilterSpy: jasmine.Spy;
  let getContainersSpy: jasmine.Spy;

  TsbTestBed.configureTestingModule({
    declarations: [DataExplorerFiltersComponent],
    imports: [NoopAnimationsModule],
    providers: [DeHelperService],
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DataExplorerFiltersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    clearContainerFilterSelectionSpy = spyOn(component, 'clearContainerFilterSelection');
    clearTsFilterSelectionSpy = spyOn(component, 'clearTargetSystemFilterSelection');
    selectedFiltersChangeEmitSpy = spyOn(component.selectedFiltersChanged, 'emit');
    clearDstSelectedFilterSpy = spyOn<any>(component, 'clearDstSelectedFilter');
    getContainersSpy = spyOn<any>(component, 'getContainers');
    clearContainerFilterSelectionSpy.calls.reset();
    clearTsFilterSelectionSpy.calls.reset();
    selectedFiltersChangeEmitSpy.calls.reset();
    clearDstSelectedFilterSpy.calls.reset();
    getContainersSpy.calls.reset();
    component['skipSelectionEmitMode'] = false;
    component.treeNodeSelected = false;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('getter() tests', () => {
    let dbHasDataAvailableSpy: jasmine.Spy;
    beforeEach(() => {
      component.treeDbWrapper = new MockTreeDbWrapper();
      dbHasDataAvailableSpy = spyOnProperty(component.treeDbWrapper.entityTreeDatabase, 'hasEntitiesAvailable');
    });
    describe('selectedTreeNodeFilterDisplay getter tests()', () => {
      it(`should retrun '' if 'selectedContainerUid' is undefined`, () => {
        component.selectedContainerUid = undefined;
        expect(component.selectedTreeNodeFilterDisplay).toEqual('');
      });
      it(`should retrun 'Container: {selected container display}' if 'selectedContainerUid' is set`, () => {
        component.selectedContainerUid = 'test1';
        component.dstContainerFilterRef = { selectedOption: { Display: 'Test Container 1' } } as DataSourceToolbarSelectedFilter;
        expect(component.selectedTreeNodeFilterDisplay).toEqual('Container: Test Container 1');
      });
    });

    describe('containerFilterWrapperTooltip getter tests()', () => {
      it(`should retrun '' if 'selection is enabled and there is data available on the containerTreeDb'`, () => {
        component.treeDbWrapper.selectionEnabled = true;
        dbHasDataAvailableSpy.and.returnValue(true);
        expect(component.containerFilterWrapperTooltip).toEqual('');
      });
      it(`should retrun '#LDS#Select a domain first' if 'selection is not enabled'`, () => {
        component.treeDbWrapper.selectionEnabled = false;
        expect(component.containerFilterWrapperTooltip).toEqual('#LDS#Select a domain first');
      });
      it(`should retrun '#LDS#No containers available' if 'selection is enabled' but
      there is no data available`, () => {
        component.treeDbWrapper.selectionEnabled = true;
        dbHasDataAvailableSpy.and.returnValue(false);
        expect(component.containerFilterWrapperTooltip).toEqual('#LDS#No containers available');
      });
    });

    describe('containerToggleTooltip getter tests()', () => {
      it(`should retrun '' if 'treeNodeSelected' is false, and selection is not enabled`, () => {
        component.treeNodeSelected = false;
        component.treeDbWrapper.selectionEnabled = false;
        expect(component.containerToggleTooltip).toEqual('');
      });
      it(`should retrun '#LDS#Clear' if 'treeNodeSelected' is 'true'`, () => {
        component.treeNodeSelected = true;
        expect(component.containerToggleTooltip).toEqual('#LDS#Clear');
      });
      it(`should retrun '#LDS#Toggle search' if 'treeNodeSelected' is 'false', selection is enabled
      and there is data available`, () => {
        component.treeNodeSelected = false;
        component.treeDbWrapper.selectionEnabled = true;
        dbHasDataAvailableSpy.and.returnValue(true);
        expect(component.containerToggleTooltip).toEqual('#LDS#Toggle search');
      });
    });

    describe('showTsSyncStatus getter tests()', () => {
      it(`should retrun 'false' if there is no selected target system option`, () => {
        component.selectedTsOption = undefined;
        expect(component.showTsSyncStatus).toEqual(false);
      });
      it(`should retrun 'false' if there is a selected target system but its hasData is 'true'`, () => {
        component.selectedTsOption = { value: 'test1', display: 'test 1', hasData: true };
        expect(component.showTsSyncStatus).toEqual(false);
      });
      it(`should retrun 'true' if there is a selected target system and its hasData is 'false'`, () => {
        component.selectedTsOption = { value: 'test2', display: 'test 2', hasData: false };
        expect(component.showTsSyncStatus).toEqual(true);
      });
    });

    describe('showTsSyncAlert getter tests()', () => {
      it(`should retrun 'false' if there is no selected target system option`, () => {
        component.selectedTsOption = undefined;
        expect(component.showTsSyncAlert).toEqual(false);
      });
      it(`should retrun 'false' if there is a selected target system but hasData is false`, () => {
        component.selectedTsOption = { value: 'test1', display: 'test 1', hasData: false};
        expect(component.showTsSyncAlert).toEqual(false);
      });
      it(`should retrun 'false' if there is a selected target system that hasData but hasSync is 'true'`, () => {
        component.selectedTsOption = { value: 'test2', display: 'test 2', hasData: true, hasSync: true };
        expect(component.showTsSyncAlert).toEqual(false);
      });
      it(`should retrun 'true' if there is a selected target system that hasData but hasSync is 'false'`, () => {
        component.selectedTsOption = { value: 'test3', display: 'test 3', hasData: true, hasSync: false };
        expect(component.showTsSyncAlert).toEqual(true);
      });
    });
  })

  describe('targetSystemSelected() tests', () => {
    let updateDataSyncStateForTsSpy: jasmine.Spy;
    beforeEach(() => {
      component.selectedTargetSystemUid = undefined;
      updateDataSyncStateForTsSpy = spyOn<any>(component, 'updateDataSyncStateForTs');
    });

    it(`should set the 'selectedTargetSystemUid' and emit the selection changed event
    when 'skipSelectionEmitMode' is 'false'`, () => {
      component.targetSystemSelected(newValue);
      expect(updateDataSyncStateForTsSpy).toHaveBeenCalledWith(newValue);
      expect(component.selectedTargetSystemUid).toEqual(mockValue);
      expect(selectedFiltersChangeEmitSpy).toHaveBeenCalledWith(mockValue);
    });
    it(`should set the 'selectedTargetSystemUid' and NOT emit the selection changed event
    when 'skipSelectionEmitMode' is 'true', `, () => {
      component['skipSelectionEmitMode'] = true;
      component.targetSystemSelected(newValue);
      expect(updateDataSyncStateForTsSpy).toHaveBeenCalledWith(newValue);
      expect(component.selectedTargetSystemUid).toEqual(mockValue);
      expect(selectedFiltersChangeEmitSpy).not.toHaveBeenCalledWith(mockValue);

    });
    describe('when there is a `containerTreeDb` input supplied', () => {
      beforeEach(() => {
        component.treeDbWrapper = new MockTreeDbWrapper();
        component.treeDbWrapper.targetSystemFilterValue = undefined;
      });
      it(`should also set the selected value on the 'containerTreeDb and call 'reloadData()` , () => {
        component.targetSystemSelected(newValue);
        expect(component.treeDbWrapper.selectionEnabled).toEqual(true);
        expect(component.treeDbWrapper.targetSystemFilterValue).toEqual(mockValue);
      });
      it(`should set 'selectionEnabled' on the 'containerTreeDb' to 'false' if no value is selected` , () => {
        component.targetSystemSelected(newUndefinedValue);
        expect(component.treeDbWrapper.selectionEnabled).toEqual(false);
        expect(component.treeDbWrapper.targetSystemFilterValue).toBeUndefined();
      });
    });
    describe('when there is a `dst` input supplied', () => {
      beforeEach(() => {
        component.dst = mockDst;
        component.dst.selectedFilters = [];
      });
      it(`should make a call to clear any existing targetsystem filter selection, and push the new selection onto
      the 'selectedFilters' of the dst` , () => {
        component.targetSystemSelected(newValue);
        expect(clearTsFilterSelectionSpy).toHaveBeenCalledWith(false);
        expect(mockDst.selectedFilters.length).toEqual(1);
        expect(mockDst.selectedFilters[0].selectedOption.Value).toEqual(mockValue);
      });
      it(`should not push a new value to the dst selectedFilters if the supplied value is undefined, instead
      it should just clear the exisiting value` , () => {
        component.targetSystemSelected(newUndefinedValue);
        expect(clearTsFilterSelectionSpy).toHaveBeenCalledWith(false);
        expect(mockDst.selectedFilters.length).toEqual(0);
      });
    });
  });

  describe('onSearchChange() tests', () => {
    let getTsOptionsSpy: jasmine.Spy;
    beforeEach(() => {
      getTsOptionsSpy = spyOn<any>(component, 'getTargetSystemOptions');
      getTsOptionsSpy.calls.reset();
    });
    it('should make a call to `getTargetSystemOptions()` when the supplied filter type matches `targetsystem`', async() => {
      component.onSearchChange(DataExplorerFilterTypes.TargetSystem);
      expect(getTsOptionsSpy).toHaveBeenCalledTimes(1);
      expect(getContainersSpy).not.toHaveBeenCalled();
    });
    it('should make a call to `getContainers()` when the supplied filter type matches `container`', async() => {
      component.onSearchChange(DataExplorerFilterTypes.Container);
      expect(getContainersSpy).toHaveBeenCalledTimes(1);
      expect(getTsOptionsSpy).not.toHaveBeenCalled();
    });
  });

  describe('clearTargetSystemFilterSelection() tests', () => {
    beforeEach(() => {
      component.tsSelect = mockSelect;
      component.dstTargetSystemFilterRef = { mock: 'test' } as any;
      selectClearSearchSpy.calls.reset();
      selectClearSelectionSpy.calls.reset();
      // Make sure the clearTsFilterSelectionSpy calls the real method for this test
      clearTsFilterSelectionSpy.and.callThrough();
    });
    it(`should clear the search input and selection of the euiSelect when 'clearSelectControl' is true
    and call 'clearDstSelectedFilter()'`, () => {
      component.clearTargetSystemFilterSelection(true);
      expect(selectClearSearchSpy).toHaveBeenCalled();
      expect(selectClearSelectionSpy).toHaveBeenCalled();
      expect(clearDstSelectedFilterSpy).toHaveBeenCalledWith(component.dstTargetSystemFilterRef);
    });
    it(`should not clear the selects properties when 'clearSelectControl' is 'false' but it should still
    call 'clearDstSelectedFilter()'`, () => {
      component.clearTargetSystemFilterSelection(false);
      expect(selectClearSearchSpy).not.toHaveBeenCalled();
      expect(selectClearSelectionSpy).not.toHaveBeenCalled();
      expect(clearDstSelectedFilterSpy).toHaveBeenCalledWith(component.dstTargetSystemFilterRef);

    });
    it(`should also make a call to clear the container selection
    when the selectedContainerUid is defined`, () => {
      component.selectedContainerUid = 'testContainerId';
      component.clearTargetSystemFilterSelection(false);
      expect(clearContainerFilterSelectionSpy).toHaveBeenCalledWith(true);
      expect(clearDstSelectedFilterSpy).toHaveBeenCalledWith(component.dstTargetSystemFilterRef);
    });

  });

  describe('clearContainerFilterSelection() tests', () => {
    beforeEach(() => {
      component.containerSelect = mockSelect;
      selectClearSearchSpy.calls.reset();
      selectClearSelectionSpy.calls.reset();
    });
    it ('should not make any calls if `clearSelectControl` is false', () => {
      component.clearContainerFilterSelection(false);
      expect(selectClearSearchSpy).not.toHaveBeenCalled();
      expect(selectClearSelectionSpy).not.toHaveBeenCalled();

    });
    it('should clear the properties on the container select when `clearSelectControl` is `true`', () => {
      clearContainerFilterSelectionSpy.and.callThrough();
      component.clearContainerFilterSelection(true);
      expect(selectClearSearchSpy).toHaveBeenCalled();
      expect(selectClearSelectionSpy).toHaveBeenCalled();
    });

  });

  describe('clearAllSelectedFilters() tests', () => {
    it(`should make calls to 'clearContainerFilterSelection' and 'clearTargetSystemFilterSelection'
    and then emit the 'selectedFiltersChanged' event`, () => {
      component.clearAllSelectedFilters();
      expect(clearContainerFilterSelectionSpy).toHaveBeenCalledWith(true);
      expect(clearTsFilterSelectionSpy).toHaveBeenCalledWith(true);
      expect(selectedFiltersChangeEmitSpy).toHaveBeenCalledTimes(1);
    });

  });

  describe('onTreeNodeSelected() tests', () => {
    it(`should call 'writeValue' on the containerSelect component
    and then make a call to 'setSelectedContainer()'`, () => {
      const setSelectedContainerSpy = spyOn(component, 'setSelectedContainer');
      const mockParentEntities = TsbCommonTestData.mockEntity;
      component.containerSelect = mockSelect;
      component.onTreeNodeSelected(mockParentEntities);
      expect(selectWriteValueSpy).toHaveBeenCalledWith('1');
      expect(setSelectedContainerSpy).toHaveBeenCalledWith({ value: '1', display: 'Display value' });
      expect(component.treeNodeSelected).toEqual(true);
    });

  });

  describe('setSelectedContainer() tests', () => {
    it(`should set the 'selectedContainerUid' as supplied value and emit the selection changed event
    when 'skipSelectionEmitMode' is 'false'`, () => {
      component.setSelectedContainer(newValue);
      expect(component.selectedContainerUid).toEqual(mockValue);
      expect(selectedFiltersChangeEmitSpy).toHaveBeenCalledWith(mockValue);
    });

    it(`should set the 'selectedContainerUid' as supplied value and NOT emit the selection changed event
    when 'skipSelectionEmitMode' is 'true'`, () => {
      component['skipSelectionEmitMode'] = true;
      component.setSelectedContainer(newValue);
      expect(component.selectedContainerUid).toEqual(mockValue);
      expect(selectedFiltersChangeEmitSpy).not.toHaveBeenCalledWith(mockValue);
    });

    describe('when there is a `dst` input supplied', () => {
      beforeEach(() => {
        component.dst = mockDst;
        component.dst.selectedFilters = [];
      });
      it(`should make a call to clear any existing container filter selection, and push the new selection onto
      the 'selectedFilters' of the dst` , () => {
        component.setSelectedContainer(newValue);
        expect(clearDstSelectedFilterSpy).toHaveBeenCalledTimes(1);
        expect(mockDst.selectedFilters.length).toEqual(1);
        expect(mockDst.selectedFilters[0].selectedOption.Value).toEqual(mockValue);
      });

      it(`should not push a new value to the dst selectedFilters if the supplied value is undefined, instead
      it should just clear any exisiting value` , () => {
        component.setSelectedContainer(newUndefinedValue);
        expect(clearDstSelectedFilterSpy).toHaveBeenCalledTimes(1);
        expect(mockDst.selectedFilters.length).toEqual(0);
      });
    });

  });

  describe('toggleContainerSearch() tests', () => {
    beforeEach(() => {
      component.containerSearchMode = false;
    });
    it (`should only call 'clearContainerFilterSelection()' when 'treeNodeSelected'
    is 'true' to clear the selected value and not allow search mode to be enabled yet`, () => {
      component.treeNodeSelected = true;
      component.toggleContainerSearch();
      expect(clearContainerFilterSelectionSpy).toHaveBeenCalledWith(true);
      expect(component.containerSearchMode).toEqual(false);
    });
    it(`should invert 'containerSearchMode' when called`, () => {
      component.toggleContainerSearch();
      expect(component.containerSearchMode).toEqual(true);
    });

    describe('when `containerSearchMode` is `true`', () => {
      let convertEntityToEuiSelectOptionSpy: jasmine.Spy;
      beforeEach(() => {
        component.containerSelectOptions = [];
        convertEntityToEuiSelectOptionSpy = spyOn<any>(component, 'convertEntityToEuiSelectOption');
        convertEntityToEuiSelectOptionSpy.calls.reset();
      });
      it(`and 'containerTreeDb' input is supplied with topLevelEntities it should set the
      'containerSelectOptions' based on that data`, () => {
        component.treeDbWrapper = new MockTreeDbWrapper();
        const mockTopLevelEntities = [
          { GetDisplay: () => 'Display 1', GetKeys: () => ['value1'] } as IEntity,
          { GetDisplay: () => 'Display 2', GetKeys: () => ['value2'] } as IEntity,
        ];
        spyOnProperty(component.treeDbWrapper.entityTreeDatabase, 'topLevelEntities').and.returnValue(mockTopLevelEntities);
        component.toggleContainerSearch();
        expect(convertEntityToEuiSelectOptionSpy).toHaveBeenCalledTimes(2);
        expect(component.containerSelectOptions.length).toEqual(2);
        expect(getContainersSpy).not.toHaveBeenCalled();
      });
      it(`and 'containerTreeDb' is undefined it should make a call to getContainers()
      to set the 'containerSelectOptions'`, () => {
        component.toggleContainerSearch();
        expect(getContainersSpy).toHaveBeenCalledTimes(1);
        expect(convertEntityToEuiSelectOptionSpy).not.toHaveBeenCalled();

      });
    });
    describe('when `containerSearchMode` is `false`', () => {
      beforeEach(() => {
        component.containerSearchMode = true;
      });
      it(`and there is a 'selectedContainerUid' set, it should make a call to 'clearContainerFilterSelection()'
      to clear any set filter value when toggling out of search mode`, () => {
        component.selectedContainerUid = 'testValue';
        component.toggleContainerSearch();
        expect(clearContainerFilterSelectionSpy).toHaveBeenCalledWith(true);
      });
      it(`and 'selectedContainerUid' is undefined, it should NOT call 'clearContainerFilterSelection()'`, () => {
        component.selectedContainerUid = undefined;
        component.toggleContainerSearch();
        expect(clearContainerFilterSelectionSpy).not.toHaveBeenCalled();
      });
    });

  });

  describe('onCustomFilterClearedExternally() tests', () => {
    let clearAllSelectedFiltersSpy: jasmine.Spy;
    beforeEach(() => {
      clearAllSelectedFiltersSpy = spyOn(component, 'clearAllSelectedFilters');
      clearAllSelectedFiltersSpy.calls.reset();
    });
    it('should make a call to `clearAllSelectedFilters()` when no parameter us supplied', fakeAsync(() => {
      component.onCustomFilterClearedExternally();
      // simulate the setTimeout() before making assertion
      tick();
      expect(clearAllSelectedFiltersSpy).toHaveBeenCalledTimes(1);
      expect(clearTsFilterSelectionSpy).not.toHaveBeenCalled();
      expect(clearContainerFilterSelectionSpy).not.toHaveBeenCalled();
    }));
    it(`should make a call to 'clearTargetSystemFilterSelection()' when supplied with a filter that
    has a name matching 'targetsystem'`, fakeAsync(() => {
      const mockTsFilter = { filter: { Name: DataExplorerFilterTypes.TargetSystem} } as DataSourceToolbarSelectedFilter;
      component.onCustomFilterClearedExternally(mockTsFilter);
      // simulate the setTimeout() before making assertion
      tick();
      expect(clearAllSelectedFiltersSpy).not.toHaveBeenCalled();
      expect(clearTsFilterSelectionSpy).toHaveBeenCalledWith(true);
      expect(clearContainerFilterSelectionSpy).not.toHaveBeenCalled();
    }));
    it(`should make a call to 'clearContainerFilterSelection()' when supplied with a filter that
    has a name matching 'container'`, fakeAsync(() => {
      const mockTsFilter = { filter: { Name: DataExplorerFilterTypes.Container} } as DataSourceToolbarSelectedFilter;
      component.onCustomFilterClearedExternally(mockTsFilter);
      // simulate the setTimeout() before making assertion
      tick();
      expect(clearAllSelectedFiltersSpy).not.toHaveBeenCalled();
      expect(clearTsFilterSelectionSpy).not.toHaveBeenCalled();
      expect(clearContainerFilterSelectionSpy).toHaveBeenCalledWith(true);
    }));
  });

  describe('updateDataSyncStateForTs() tests', () => {
    beforeEach(() => {
      component.selectedTsOption = { display: 'initial-test', value: 'init', hasData: false, hasSync: false };
    });
    it(`should set clear the 'selectedTsOption' and reset 'tsIssueMode' when called without an option`, () => {
      component['updateDataSyncStateForTs']();
      expect(component.selectedTsOption).toBeUndefined();

    });
    it(`should set the 'selectedTsOption' and update 'tsIssueMode' to 'no-sync' when
    there is no data and no sync on selected option`, () => {
      const mockNoSyncSelectOption = { display: 'ts 1', value: 'ts1', hasData: false, hasSync: false }
      component['updateDataSyncStateForTs'](mockNoSyncSelectOption);
      expect(component.selectedTsOption).toEqual(mockNoSyncSelectOption);
      expect(component.tsIssueMode).toEqual('no-sync');
    });
    it(`should set the 'selectedTsOption' and update 'tsIssueMode' to 'no-data' when
    there is no data but there is a sync on selected option`, () => {
      const mockNoDataSelectedOption = { display: 'ts 2', value: 'ts2', hasData: false, hasSync: true }
      component['updateDataSyncStateForTs'](mockNoDataSelectedOption);
      expect(component.selectedTsOption).toEqual(mockNoDataSelectedOption);
      expect(component.tsIssueMode).toEqual('no-data');
    });
  });

});
