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

import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { EuiSelectComponent, EuiSelectOption } from '@elemental-ui/core';
import { PortalTargetsystemUnsSystem } from 'imx-api-tsb';
import { IEntity } from 'imx-qbm-dbts';
import { DataSourceToolbarComponent, DataSourceToolbarSelectedFilter } from 'qbm';
import { ContainerTreeDatabaseWrapper } from '../container-list/container-tree-database-wrapper';
import { DeHelperService } from '../de-helper.service';

export enum DataExplorerFilterTypes {
  TargetSystem = 'targetsystem',
  Container = 'container'
}

@Component({
  selector: 'imx-target-system-filter',
  templateUrl: './data-explorer-filters.component.html',
  styleUrls: ['./data-explorer-filters.component.scss'],
})
export class DataExplorerFiltersComponent implements OnInit {

  public targetSystemOptions: EuiSelectOption[] = [];
  public selectedTargetSystemUid: string;
  public dstTargetSystemFilterRef: DataSourceToolbarSelectedFilter;
  public selectedContainerUid: string;
  public dstContainerFilterRef: DataSourceToolbarSelectedFilter;
  public containerSelectOptions: EuiSelectOption[] = [];
  public DataExplorerFilterTypes = DataExplorerFilterTypes;
  public pendingAsyncApiCall = false;
  public containerSearchMode = false;
  public treeNodeSelected = false;
  public selectedTsOption: EuiSelectOption;
  public tsIssueMode = '';

  @ViewChild('tsSelect', { static: false }) public tsSelect: EuiSelectComponent;
  @ViewChild('containerSelect', { static: false }) public containerSelect: EuiSelectComponent;
  @Input() public targetSystemData: PortalTargetsystemUnsSystem[];
  @Input() public dst?: DataSourceToolbarComponent;
  @Input() public treeDbWrapper: ContainerTreeDatabaseWrapper;
  @Output() public selectedFiltersChanged = new EventEmitter<string>();

  private skipSelectionEmitMode = false;

  constructor(private readonly dataHelper: DeHelperService) { }

  public get selectedTreeNodeFilterDisplay(): string {
    let display = '';
    if (this.selectedContainerUid) {
      display = `Container: ${this.dstContainerFilterRef.selectedOption.Display}`;
    }
    return display;
  }
  public get containerFilterWrapperTooltip(): string {
    let display = '';
    if (!this.treeDbWrapper?.selectionEnabled) {
      display = '#LDS#Select a domain first';
    } else if (this.treeDbWrapper?.selectionEnabled && !this.treeDbWrapper.entityTreeDatabase.hasEntitiesAvailable) {
      display = '#LDS#No containers available';
    }
    return display;
  }

  public get containerToggleTooltip(): string {
    let display = '';
    if (this.treeNodeSelected) {
      display = '#LDS#Clear';
    } else if (this.treeDbWrapper?.selectionEnabled && this.treeDbWrapper.entityTreeDatabase.hasEntitiesAvailable) {
      display = '#LDS#Toggle search';
    }
    return display;
  }

  public get showTsSyncStatus(): boolean {
    let show = false;
    if (this.selectedTsOption && this.selectedTsOption.value) {
      show = !this.selectedTsOption.hasData;
    }
    return show;
  }

  public get showTsSyncAlert(): boolean {
    let show = false;
    if (this.selectedTsOption && this.selectedTsOption.value) {
      show = this.selectedTsOption.hasData && !this.selectedTsOption.hasSync;
    }
    return show;
  }

  public ngOnInit(): void {
    if (this.targetSystemData) {
      this.setupTsSelectOptions(this.targetSystemData);
    } else {
      this.getTargetSystemOptions();
    }
  }

  public targetSystemSelected(selected: EuiSelectOption): void {
    this.selectedTargetSystemUid = selected.value;
    this.updateDataSyncStateForTs(selected);
    if (this.treeDbWrapper) {
      this.treeDbWrapper.selectionEnabled = this.selectedTargetSystemUid?.length > 0 ? true : false;
      this.treeDbWrapper.targetSystemFilterValue = this.selectedTargetSystemUid;
    }

    if (this.dst) {
      // First clear any previosuly selected dst selectedFilter
      this.clearTargetSystemFilterSelection(false);
      if (selected.value && selected.value.length > 0) {
        this.dstTargetSystemFilterRef = {
          selectedOption: { Value: selected.value, Display: selected.display },
          filter: { Name: DataExplorerFilterTypes.TargetSystem },
          isCustom: true
        };
        this.dst.selectedFilters.push(this.dstTargetSystemFilterRef);
      }
    }
    if (!this.skipSelectionEmitMode) {
      // Trigger a new api call to reflect filter removal
      this.selectedFiltersChanged.emit(this.selectedTargetSystemUid);
    }
  }

  /**
   * Used to override the eui-select's default filtering
   * Filtering is provided through an async api call
   */
  public paramListFilter(): boolean {
    return true;
  }

  public async onSearchChange(filterType: DataExplorerFilterTypes, search?: string): Promise<void> {
    const method = filterType === DataExplorerFilterTypes.TargetSystem ? this.getTargetSystemOptions : this.getContainers;
    this.pendingAsyncApiCall = true;
    try {
      await method.call(this, search);
    } finally {
      this.pendingAsyncApiCall = false;
    }
  }

  public clearTargetSystemFilterSelection(clearSelectControl?: boolean): void {
    if (clearSelectControl) {
      this.tsSelect.searchInput.clearSearch();
      this.tsSelect.clearSelectionsInside();
    }
    // Also clear container selection if a value is set
    if (this.selectedContainerUid) {
      // Don't emit a change to container un-select in this context because it
      // will be emitted as part of target system change anyway
      this.skipSelectionEmitMode = true;
      this.clearContainerFilterSelection(true);
      this.skipSelectionEmitMode = false;
    }
    this.clearDstSelectedFilter(this.dstTargetSystemFilterRef);
  }

  public clearContainerFilterSelection(clearSelectControl?: boolean): void {
    if (this.containerSelect && clearSelectControl) {
      this.containerSelect.searchInput.clearSearch();
      this.containerSelect.clearSelectionsInside();
    }
    this.treeNodeSelected = false;
  }

  public clearAllSelectedFilters(): void {
    this.skipSelectionEmitMode = true;
    this.clearContainerFilterSelection(true);
    this.clearTargetSystemFilterSelection(true);
    this.skipSelectionEmitMode = false;
    this.selectedFiltersChanged.emit();
  }

  /**
   * @ignore Used internally.
   * Is called when a value is selection on the optional filter tree structure
   * Updates and emits the new navigationState to include any filter query params.
   */
  public async onTreeNodeSelected(entity: IEntity): Promise<void> {
    this.treeNodeSelected = true;
    const selectedValue: string = entity.GetKeys()[0];
    // Set the selected value on the search control as well
    this.containerSelect.writeValue(selectedValue);
    this.setSelectedContainer({value: selectedValue, display: entity.GetDisplay()});
  }

  public setSelectedContainer(selected: EuiSelectOption): void {
    this.selectedContainerUid = selected.value;

    if (this.dst) {
      // First clear any previosuly selected dst selectedFilter
      this.clearDstSelectedFilter(this.dstContainerFilterRef);
      if (selected.value && selected.value.length > 0) {
        this.dstContainerFilterRef = {
          selectedOption: { Value: selected.value, Display: selected.display},
          filter: { Name: DataExplorerFilterTypes.Container },
          isCustom: true
        };
        this.dst.selectedFilters.push(this.dstContainerFilterRef);
      }
    }
    if (!this.skipSelectionEmitMode) {
      this.selectedFiltersChanged.emit(this.selectedContainerUid);
    }
  }

  public toggleContainerSearch(): void {
    if (this.treeNodeSelected) {
      this.clearContainerFilterSelection(true);
      return;
    }
    this.containerSearchMode = !this.containerSearchMode;
    if (this.containerSearchMode) {
      if (this.treeDbWrapper?.entityTreeDatabase?.topLevelEntities) {
        this.containerSelectOptions = this.treeDbWrapper.entityTreeDatabase.topLevelEntities.map(d =>
          this.convertEntityToEuiSelectOption(d)
        );
      } else {
        this.getContainers();
      }
    } else if (this.selectedContainerUid) {
      // If a value is set then clear it when toggling out of search mode
      this.clearContainerFilterSelection(true);
    }
  }

  /**
   * Responds to a custom filter (or all filters) being removed from outside of the context of
   * this component
   */
  public onCustomFilterClearedExternally(sf?: DataSourceToolbarSelectedFilter): void {
    setTimeout(() => {
      if (!sf) {
        // If no singular filter is supplied, then all have been cleared
        this.clearAllSelectedFilters();
      } else if (sf.filter.Name === DataExplorerFilterTypes.TargetSystem) {
        this.clearTargetSystemFilterSelection(true);
      } else if (sf.filter.Name === DataExplorerFilterTypes.Container) {
        this.clearContainerFilterSelection(true);
      }
    });
  }

  private updateDataSyncStateForTs(selectedOption?: EuiSelectOption): void {
    this.selectedTsOption = selectedOption;
    this.tsIssueMode = '';
    if (this.showTsSyncStatus) {
      if (!this.selectedTsOption.hasSync) {
        this.tsIssueMode = 'no-sync';
      } else if (!this.selectedTsOption.hasData) {
        this.tsIssueMode = 'no-data';
      }
    }
  }

  private clearDstSelectedFilter(selectedFilterRef: DataSourceToolbarSelectedFilter): void {
    if (this.dst && selectedFilterRef) {
      // Remove the 'isCustom' property to avoid an event being triggered in dst code
      selectedFilterRef.isCustom = undefined;
      // Then make call to remove selected filter
      this.dst.removeSelectedFilter(
        selectedFilterRef.filter,
        false,
        selectedFilterRef.selectedOption.Value,
        selectedFilterRef
      );
    }
  }

  private async getTargetSystemOptions(search?: string): Promise<void> {
    const data = await this.dataHelper.getAuthorityData(search, true);
    this.setupTsSelectOptions(data.authorities);
  }

  private async getContainers(search?: string): Promise<void> {
    const navState: any = { PageSize: 1000, StartIndex: 0, ParentKey: '' };
    navState.search = search ? search : undefined;
    navState.system = this.selectedTargetSystemUid ? this.selectedTargetSystemUid : undefined;
    const data = await this.dataHelper.getContainers(navState);
    this.containerSelectOptions = data?.Data.map(d => this.convertEntityToEuiSelectOption(d.GetEntity()));
  }

  private setupTsSelectOptions(targetSystems: PortalTargetsystemUnsSystem[]): void {
    this.targetSystemOptions = targetSystems.map(d => this.convertTsToEuiSelectOption(d));
  }

  private convertTsToEuiSelectOption(tEntity: PortalTargetsystemUnsSystem): EuiSelectOption {
    const option = this.convertEntityToEuiSelectOption(tEntity.GetEntity());
    option.hasSync = tEntity.HasSync?.value;
    option.hasData = tEntity.HasData?.value;
    return option;
  }

  private convertEntityToEuiSelectOption(entity: IEntity): EuiSelectOption {
    return { display: entity.GetDisplay(), value: entity.GetKeys()[0] };
  }

}
