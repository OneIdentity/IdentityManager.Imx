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
 * Copyright 2024 One Identity LLC.
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

import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, UntypedFormControl, Validators } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import {
  EuiDatePickerComponent,
  EuiLoadingService,
  EuiSelectFeedbackMessages,
  EuiSelectOption,
  EuiSidesheetService,
} from '@elemental-ui/core';
import { TranslateService } from '@ngx-translate/core';
import moment from 'moment';

import { ChangeType as ChangeTypeEnum, HistoryOperation } from '@imx-modules/imx-api-qbm';
import { BusyService, calculateSidesheetWidth, SettingsService } from 'qbm';
import { DataChangesSidesheetComponent } from './data-changes-sidesheet/data-changes-sidesheet.component';
import { DataChangesService } from './data-changes.service';

export interface Column {
  name: string;
  title: string;
  value: (row: HistoryOperation) => string | undefined;
}

export interface SearchType {
  name: string;
  value: string;
}

@Component({
  selector: 'imx-data-changes',
  templateUrl: './data-changes.component.html',
  styleUrls: ['./data-changes.component.scss'],
})
export class DataChangesComponent implements OnInit {
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild('fromDateControl') fromDateControl: EuiDatePickerComponent;
  @ViewChild('toDateControl') toDateControl: EuiDatePickerComponent;

  public paginatorConfigurations: { size: number; sizeOptions: number[]; showFirstLastButtons: boolean };
  public dataSource: MatTableDataSource<HistoryOperation>;
  public columns: Column[];
  public displayedColumns: string[];
  public feedbackMessages: EuiSelectFeedbackMessages;

  public searchForm = new FormGroup({
    usernameFormControl: new UntypedFormControl('', Validators.required),
    changeTypeFormControl: new UntypedFormControl(['']),
    fromDateFormControl: new UntypedFormControl('', { updateOn: 'blur', validators: Validators.required }),
    toDateFormControl: new UntypedFormControl('', { updateOn: 'blur' }),
  });
  public selectedSearchType: string;

  public busyService: BusyService;

  public changeTypes: EuiSelectOption[];
  public badgeColor = {
    Insert: 'green',
    Update: 'orange',
    Delete: 'red',
  };

  public today: moment.Moment;
  public yesterday: moment.Moment;

  public get changeTypeEnum(): typeof ChangeTypeEnum {
    return ChangeTypeEnum;
  }

  public get isEnabledUsername(): boolean {
    return this.selectedSearchType === 'UserName';
  }

  public get isEnabledChangeType(): boolean {
    return this.selectedSearchType === 'ChangeType';
  }

  constructor(
    private translateService: TranslateService,
    private euiLoadingService: EuiLoadingService,
    private sidesheet: EuiSidesheetService,
    private dataChangesService: DataChangesService,
    public readonly settings: SettingsService,
    private readonly changeDetector: ChangeDetectorRef,
  ) {
    this.paginatorConfigurations = {
      size: this.settings.DefaultPageSize,
      sizeOptions: this.settings.DefaultPageOptions,
      showFirstLastButtons: true,
    };
    this.today = moment();
    this.yesterday = moment().subtract(1, 'days');
    this.busyService = new BusyService();
  }

  public async ngOnInit(): Promise<void> {
    this.selectedSearchType = 'UserName';
    this.changeTypes = this.dataChangesService.loadChangeTypes();
    let culture = this.translateService.getBrowserCultureLang();
    this.columns = [
      {
        name: 'ChangeTime',
        title: '#LDS#Operation performed on',
        value: (row: HistoryOperation) => new Date(row.ChangeTime)?.toLocaleString(culture),
      },
      {
        name: 'ChangeType',
        title: '#LDS#Type of operation',
        value: (row: HistoryOperation) => this.dataChangesService.changeTypeString(row.ChangeType),
      },
      { name: 'DisplayType', title: '#LDS#Object type', value: (row: HistoryOperation) => row.DisplayType },
      { name: 'ObjectDisplay', title: '#LDS#Object name', value: (row: HistoryOperation) => row.ObjectDisplay },
      { name: 'ProcessId', title: '#LDS#Process ID', value: (row: HistoryOperation) => row.ProcessId },
      { name: 'User', title: '#LDS#Operation performed by', value: (row: HistoryOperation) => row.User },
    ];
    this.displayedColumns = this.columns.map((c) => c.name);
    this.translateService.onLangChange.subscribe(() => {
      this.loadFeedbackMessages();
      this.changeTypes = this.dataChangesService.loadChangeTypes();
    });

    this.initSearchForm();
    this.manageSearchState();
    this.updateUserNameControls();
    this.loadFeedbackMessages();
  }

  public searchTypeChange(): void {
    this.dataSource = new MatTableDataSource<HistoryOperation>();
    this.dataSource.paginator = this.paginator;
    // update validators when changing search type, because only visible elements can be mandatory
    this.searchForm.controls.usernameFormControl?.setValidators(
      this.selectedSearchType.toUpperCase() === 'ChangeType'.toUpperCase() ? null : Validators.required,
    );
    this.searchForm.controls.toDateFormControl?.setValidators(
      this.selectedSearchType.toUpperCase() === 'ChangeType'.toUpperCase() ? Validators.required : null,
    );
    this.searchForm.controls.changeTypeFormControl?.setValidators(
      this.selectedSearchType.toUpperCase() === 'UserName'.toUpperCase() ? null : Validators.required,
    );
    this.manageSearchState();
  }

  public manageSearchState(): void {
    this.searchForm.controls.usernameFormControl.reset();
    this.searchForm.controls.changeTypeFormControl.reset();
    switch (this.selectedSearchType) {
      case 'UserName':
        this.updateUserNameControls();
        break;
      case 'ChangeType':
        this.updateChangeTypeControls();
        break;
    }
  }

  public async loadHistoryOperationsData(): Promise<void> {
    if (this.selectedSearchType === 'UserName') await this.loadHistoryOperationsDataByUserName();
    else if (this.selectedSearchType === 'ChangeType') await this.loadHistoryOperationsDataByChangeType();
  }

  public async loadHistoryOperationsDataByUserName(): Promise<void> {
    const isBusy = this.busyService.beginBusy();
    try {
      this.dataSource = new MatTableDataSource<HistoryOperation>();
      this.dataSource.paginator = this.paginator;

      if (!this.searchForm.controls.usernameFormControl.value) {
        return;
      }

      const historyOperationsData = await this.dataChangesService.getHistoryOperationsDataByUserName(
        this.searchForm.controls.usernameFormControl.value,
        { backto: this.searchForm.controls.fromDateFormControl.value },
      );

      if (historyOperationsData) {
        this.dataSource = new MatTableDataSource<HistoryOperation>(historyOperationsData.Events);
        this.dataSource.paginator = this.paginator;
      }
    } finally {
      isBusy.endBusy();
    }
  }

  public async loadHistoryOperationsDataByChangeType(): Promise<void> {
    const isBusy = this.busyService.beginBusy();
    try {
      this.dataSource = new MatTableDataSource<HistoryOperation>();
      this.dataSource.paginator = this.paginator;

      if (
        !this.searchForm.controls.changeTypeFormControl.value ||
        !this.searchForm.controls.fromDateFormControl.value ||
        !this.searchForm.controls.toDateFormControl.value
      ) {
        return;
      }

      await this.loadHistoryDataByChangeType();
    } finally {
      isBusy.endBusy();
    }
  }

  public displayChangedPropertyListSidesheet(row: HistoryOperation): void {
    if (row.Columns && row.Columns.length > 0) {
      let changeType = this.dataChangesService.changeTypeString(row.ChangeType);
      let title = this.translateService.instant('#LDS#Heading View Operation Details') + ' (' + changeType + ')';
      let headerColour = this.badgeColor[ChangeTypeEnum[row.ChangeType]] ?? 'primary';

      this.sidesheet.open(DataChangesSidesheetComponent, {
        title: title,
        subTitle: row.ObjectDisplay,
        width: calculateSidesheetWidth(700, 0.4),
        data: row,
        testId: 'data-change-details-sidesheet',
        headerColour,
      });
    }
  }

  private initSearchForm(): void {
    this.searchForm.controls.fromDateFormControl.valueChanges.subscribe((val: moment.Moment) => {
      //if a valid date is set, update min and max date for the other picker
      if (this.toDateControl && val <= this.searchForm.controls.toDateFormControl.value) {
        this.toDateControl.min = val;
        this.toDateControl.max = this.today;
      }
      this.changeDetector.detectChanges();
    });

    this.searchForm.controls.toDateFormControl.valueChanges.subscribe((val: moment.Moment) => {
      //if a valid date is set, update min and max date for the other picker
      if (this.fromDateControl && val >= this.searchForm.controls.fromDateFormControl.value) {
        this.fromDateControl.max = val;
        this.fromDateControl.min = moment(new Date('1970-01-01Z00:00:00:000'));
        this.changeDetector.detectChanges();
      }
    });
  }

  private async loadHistoryDataByChangeType(): Promise<void> {
    const backFrom = moment(this.searchForm.controls.toDateFormControl.value)
      .set('hours', 23)
      .set('minutes', 59)
      .set('seconds', 59)
      .toDate();
    const backTo = moment(this.searchForm.controls.fromDateFormControl.value).toDate();

    const sum = this.searchForm.controls.changeTypeFormControl.value.reduce((aggregate, currentValue) => aggregate + currentValue, 0);
    if (sum === 0) {
      return;
    }

    const historyOperationsData = await this.dataChangesService.getHistoryOperationsDataByChangeType({
      backto: backTo,
      backfrom: backFrom,
      types: sum,
    });

    if (historyOperationsData) {
      this.dataSource = new MatTableDataSource<HistoryOperation>(historyOperationsData.Events);
      this.dataSource.paginator = this.paginator;
    }
  }

  private loadFeedbackMessages(): void {
    this.feedbackMessages = {
      selected: this.translateService.instant('#LDS#{{value}} selected'),
      clear: this.translateService.instant('#LDS#Clear selection'),
      search: this.translateService.instant('#LDS#Search'),
      plusOther: this.translateService.instant('#LDS#and 1 more'),
      plusOtherPlural: this.translateService.instant('#LDS#and {{value}} more'),
      unsupportedCharacter: this.translateService.instant('#LDS#You are using unsupported characters.'),
      noResults: this.translateService.instant('#LDS#There is no data matching your search.'),
      clearAll: this.translateService.instant('#LDS#Clear selection'),
      ok: this.translateService.instant('#LDS#OK'),
      keyboardOptionsListAria: this.translateService.instant('#LDS#Use the arrow keys to select items.'),
    };
  }

  /**
   * Updates the form, so it fits the requirements for a search by user name, by initializing the values of the date picker and assuring, that the toDateControl will be valid (because it is not used).
   */
  private updateUserNameControls() {
    this.searchForm.controls.toDateFormControl.setValue(this.today);
    this.searchForm.controls.fromDateFormControl.setValue(this.today);
    if (this.toDateControl) {
      this.toDateControl.min = this.today;
      this.toDateControl.max = this.today;
    }
  }

  /**
   * Updates the form, so it fits the requirements for a search by change type, by initializing the values of the date picker.
   */
  private updateChangeTypeControls() {
    this.searchForm.controls.toDateFormControl.setValue(this.today);
    this.searchForm.controls.fromDateFormControl.setValue(this.yesterday);
  }
}
