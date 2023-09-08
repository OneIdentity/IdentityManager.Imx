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

import { Injectable } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { EuiSelectOption } from '@elemental-ui/core';
import { DataModel, DataModelProperty } from 'imx-qbm-dbts';
import _ from 'lodash';
import { DataSourceToolbarSettings } from '../data-source-toolbar/data-source-toolbar-settings';

export interface DSTExportState {
  dataModel?: DataModel,
  selectedExport?: FormControl,
  exportOptions?: EuiSelectOption[],
  isAllData?: boolean,
  columns?: FormControl[],
  columnOptions?: EuiSelectOption[]
}
export interface FilteredColumnOption{
  value: string; options: EuiSelectOption[];
}

@Injectable({
  providedIn: 'root'
})
export class ExportColumnsService {
  public columnOptions: EuiSelectOption[];
  public stashedState: DSTExportState;

  public isAllData = false;
  public exportOptions: EuiSelectOption[] = [
    {
      display: 'CSV',
      value: 'text/csv',
    },
    {
      display: 'JSON',
      value: 'application/json',
    },
    {
      display: 'PDF',
      value: 'application/pdf',
    }
  ];
  public exportOptionsFilter = (option: EuiSelectOption, searchInputValue: string) => option.display.toLowerCase().includes(searchInputValue.toLowerCase());

  public columnOptionsFilter = (option: EuiSelectOption, searchInputValue: string) => {
    const sanitizedInput = searchInputValue.toLowerCase();
    return option.display.toLowerCase().includes(sanitizedInput) || option?.displayDetail?.toLowerCase().includes(sanitizedInput);
  }

  // This function will check if the incoming data model is different from what exists.
  public setupExport(settings?: DataSourceToolbarSettings): void {
    if (this.stashedState && this.checkDataModel(settings.dataModel)) {
      // This is the same data model, don't need to do anything
      return;
    }

    // If we made it here, this data is different and we neeed to make new options
    this.createInitialState(settings);
  }

  public checkDataModel(dataModel: DataModel): boolean {
    const stashedProperties = this.stashedState.dataModel.Properties.map(column => column.Property.ColumnName);
    const properties = dataModel.Properties.map(column => column.Property.ColumnName);
    return _.isEqual(stashedProperties, properties);
  }

  // Saves the column options internally
  public createInitialState(settings: DataSourceToolbarSettings): void {
    // Column Options sorted alphebetically, not filtering by IsAdditional - this leads to empty exports
    const columnOptions = settings.dataModel.Properties.map(prop => {
      return this.makeOption(prop);
    });
    columnOptions.sort((a, b) => a.display >= b.display ? 1: -1);
    const selectedExport = new FormControl('text/csv');

    // Check for initial columns, or try to use displayed columns
    const columns: FormControl[] = [];
    if (settings.exportMethod?.initialColumns) {
      settings.exportMethod.initialColumns.forEach(column => {
        const option = columnOptions.find(prop => prop.value === column);
        if (option) {
          columns.push(this.createColumn(option));
        }
      })
    } else if (settings?.displayedColumns) {
      settings.displayedColumns.forEach(column => {
        const option = columnOptions.find(prop => prop.value === column.ColumnName);
        if (option) {
          columns.push(this.createColumn(option));
        }
      });
    }

    // If no columns, init an empty one
    if (columns.length === 0) {
      columns.push(this.createColumn());
    }

    this.stashedState = {
      dataModel: settings.dataModel,
      columnOptions,
      columns,
      isAllData: this.isAllData,
      selectedExport,
      exportOptions: this.exportOptions
    }
  }

  // Setup an option for column export
  public makeOption(property: DataModelProperty): EuiSelectOption {
    const display = property.Property?.Display ?? property.Property?.ColumnName;
    return {
      display,
      value: property.Property.ColumnName,
      displayDetail: property.Property?.Description
    }
  }

  // Create a new column for export
  public createColumn(value?: EuiSelectOption): FormControl {
    return new FormControl(value?.value, Validators.required);
  }

  // Stash the state of the sidesheet for later use
  public stashState(): void {
    // Filter out all invalid columns, leave one if all are invalid
    if (this.stashedState.columns.every(column => column.invalid)) {
      this.stashedState.columns = [this.createColumn()];
    } else {
      this.stashedState.columns = this.stashedState.columns.filter(column => column.valid);
    }
  }
}
