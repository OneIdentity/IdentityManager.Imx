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

import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { FormControl } from '@angular/forms';
import { EuiDownloadOptions, EuiSelectOption, EuiTheme, EUI_SIDESHEET_DATA, EuiSelectFeedbackMessages } from '@elemental-ui/core';
import { DataSourceToolbarSettings } from '../data-source-toolbar/data-source-toolbar-settings';
import { ElementalUiConfigService } from '../configuration/elemental-ui-config.service';
import { AppConfigService } from '../appConfig/appConfig.service';
import { DSTExportState, ExportColumnsService, FilteredColumnOption } from './export-columns.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'imx-data-export',
  templateUrl: './data-export.component.html',
  styleUrls: ['./data-export.component.scss'],
})
export class DataExportComponent implements OnInit, OnDestroy {
  public state: DSTExportState;
  public downloadOptions: EuiDownloadOptions;
  public filteredColumnOptions: FilteredColumnOption[] = [];
  public feedbackMessages: EuiSelectFeedbackMessages;

  constructor(
    public columnExportService: ExportColumnsService,
    @Inject(EUI_SIDESHEET_DATA) public readonly settings: DataSourceToolbarSettings,
    private readonly config: AppConfigService,
    private readonly elementalUiConfigService: ElementalUiConfigService,
    private readonly translateService: TranslateService
    ) {
      this.feedbackMessages = {
        ...this.feedbackMessages,
        clear: this.translateService.instant('#LDS#Clear'),
        search :this.translateService.instant('#LDS#Search'),
      }
    }

  public get controlsCount(): number {
    return this.state?.columns.length;
  }

  public get uniqueControlsCount(): number {
    return new Set(this.state?.columns.map(column => column.value)).size;
  }

  public get canAddMore(): boolean {
    return this.controlsCount < this.state?.columnOptions.length;
  }

  public get canExport(): boolean {
    return this.controlsCount > 0 &&
      this.state?.columns.map(control => control.valid).every(value => value) &&
      this.uniqueControlsCount === this.controlsCount;
  }

  public get currentDataCount(): number {
    return this.settings.dataSource.Data.length;
  }

  public get allDataCount(): number {
    return this.settings.dataSource.totalCount;
  }

  public get theme(): string {
    const bodyClasses = document.body.classList;
    return bodyClasses.contains(EuiTheme.LIGHT) ? EuiTheme.LIGHT : (bodyClasses.contains(EuiTheme.DARK) ? EuiTheme.DARK : (bodyClasses.contains(EuiTheme.CONTRAST) ? EuiTheme.CONTRAST : ''));
  }

  public ngOnInit(): void {
    this.columnExportService.setupExport(this.settings);
    this.state = this.columnExportService?.stashedState;
    this.setDownloadOptions();
    this.setUrl();
  }

  public ngOnDestroy(): void {
    this.columnExportService.stashState();
  }

  // Initialize the download options
  public setDownloadOptions(): void {
    this.downloadOptions = {
      ...this.elementalUiConfigService.Config.downloadOptions,
      fileMimeType: this.state.selectedExport.value,
      requestOptions: {
        headers: {
          'Accept': this.state.selectedExport.value
        },
        withCredentials: true
      },
    }
  }

  // Update the request url
  public setUrl(): void {
    const withProperties = '-' + this.state.columns.map(column => column.value).join(',');
     const method = this.settings.exportMethod.getMethod(withProperties, this.state.isAllData ? this.allDataCount : null);
    this.downloadOptions = {
      ...this.downloadOptions,
      url: this.config.BaseUrl + method.path
    };
    this.updateFilteredColumnOptions();
  }

  // Calculate all valid options for all select (remove selected ones)
  public updateFilteredColumnOptions():void{
    this.filteredColumnOptions = this.state.columns.map(
      form => (
        {
          value: form.value,
          options: this.state.columnOptions.filter(option => !this.state.columns.filter(columnForm => columnForm.value !== form.value).map(columnForm => columnForm.value).includes(option.value))
        }
      )
    );
  }

  // Return all available options
  public getFilteredOptions(value:string): EuiSelectOption[]{
    return this.filteredColumnOptions.filter(columnOption => columnOption.value === value)[0]?.options;
  }

  // Drag & drop order of columns
  public drop(event: CdkDragDrop<FormControl[]>): void {
    moveItemInArray(this.state.columns, event.previousIndex, event.currentIndex);
    this.setUrl();
  }

  // Remove a column from the export list
  public deleteColumn(ind: number): void {
    this.state.columns.splice(ind, 1);
    this.setUrl();
  }

  // Add a column to the export list
  public addNewColumn(value?: EuiSelectOption): void {
    this.state.columns.push(
      this.columnExportService.createColumn(value)
    );
    this.updateFilteredColumnOptions();
  }

  // Change the download type
  public changeType(type: EuiSelectOption): void {
    this.downloadOptions = {
      ...this.downloadOptions,
      fileMimeType: type.value,
      requestOptions: {
        headers: {
          accept: type.value
        },
        withCredentials: true
      }
    };
  }
}
