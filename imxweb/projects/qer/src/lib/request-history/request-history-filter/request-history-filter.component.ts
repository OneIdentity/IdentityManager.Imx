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

import { PortalPersonReports } from 'imx-api-qer';
import { IEntity } from 'imx-qbm-dbts';

import { DataSourceToolbarComponent, DataSourceToolbarSelectedFilter } from 'qbm';
import { QerApiService } from '../../qer-api-client.service';

@Component({
  selector: 'imx-request-history-filter',
  templateUrl: './request-history-filter.component.html',
  styleUrls: ['./request-history-filter.component.scss']
})
export class RequestHistoryFilterComponent implements OnInit {

  @Input() public dst: DataSourceToolbarComponent;
  @Input() public hideFilter: boolean = false;
  @Output() public selectedFiltersChanged = new EventEmitter<string>();

  @ViewChild('personSelect', { static: false }) public tsSelect: EuiSelectComponent;

  public personData: PortalPersonReports[];
  public directReportsOptions: EuiSelectOption[] = [];
  public selectedUid: string;
  public dstFilterRef: DataSourceToolbarSelectedFilter;
  public pendingAsyncApiCall = false;

  private skipSelectionEmitMode = false;
  public customFilterFn = (option: EuiSelectOption, searchInputValue: string): boolean => {
    return option.display.toString().toUpperCase().indexOf(searchInputValue.toUpperCase()) !== -1;
  };

  constructor(
    private readonly qerClient: QerApiService,
  ) { }

  public async ngOnInit(): Promise<void> {
    if (!this.hideFilter) {
      await this.getDirectReports();
      this.setupSelectOptions(this.personData);
    }
  }

  public personSelected(selected: EuiSelectOption): void {
    this.selectedUid = selected.value;

    if (!this.selectedUid) {
      // We return here to avoid erroneous data calls, clearing is directly called elsewhere
      return;
    }


    if (this.dst) {
      // First clear any previosuly selected dst selectedFilter, but we do not emit this
      this.clearDstSelectedFilter(this.dstFilterRef, false);
      if (selected.value && selected.value.length > 0) {
        this.dstFilterRef = {
          selectedOption: { Value: selected.value, Display: selected.display },
          filter: { Name: 'UID_Person' },
          isCustom: true
        };
        this.dst.selectedFilters.push(this.dstFilterRef);
      }
    }
     if (!this.skipSelectionEmitMode) {
      // Trigger a new api call to reflect filter removal
      this.selectedFiltersChanged.emit(this.selectedUid);
    }
  }

  public clearPersonFilterSelection(clearSelectControl?: boolean, emit = true): void {
    if (clearSelectControl) {
      this.tsSelect?.searchInput.clearSearch();
      this.tsSelect?.clearSelectionsInside();
    }
    this.clearDstSelectedFilter(this.dstFilterRef, emit);
  }

  private async getDirectReports(): Promise<void> {
    this.personData = (await this.qerClient.typedClient.PortalPersonReports.Get({
      OnlyDirect: true, // direct reports only
      PageSize: 10000,
    })).Data;
  }

  private setupSelectOptions(persons: PortalPersonReports[]): void {
    this.directReportsOptions = persons.map(d => this.convertTsToEuiSelectOption(d));
  }

  private convertTsToEuiSelectOption(person: PortalPersonReports): EuiSelectOption {
    const option = this.convertEntityToEuiSelectOption(person.GetEntity());
    return option;
  }

  private convertEntityToEuiSelectOption(entity: IEntity): EuiSelectOption {
    return { display: entity.GetDisplay(), value: entity.GetKeys()[0] };
  }

  private clearDstSelectedFilter(selectedFilterRef: DataSourceToolbarSelectedFilter, emit = true): void {
    if (this.dst && selectedFilterRef) {
      // Remove the 'isCustom' property to avoid an event being triggered in dst code
      selectedFilterRef.isCustom = undefined;

      // We also have to remove the filter from the nav state as its custom, this isnt handled inside the dst for this case
      if (this.dst?.settings?.navigationState[selectedFilterRef.filter.Name]) {
        delete this.dst?.settings?.navigationState[selectedFilterRef.filter.Name];
      }
      // Then make call to remove selected filter
      this.dst.removeSelectedFilter(
        selectedFilterRef.filter,
        emit,
        selectedFilterRef.selectedOption.Value,
        selectedFilterRef
      );
    }
  }
}
