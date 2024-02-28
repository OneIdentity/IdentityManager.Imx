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

import { Component, OnInit, ViewChild } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup, ValidatorFn, Validators } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { EuiBadgeComponent, EuiLoadingService, EuiSidesheetService } from '@elemental-ui/core';
import { TranslateService } from '@ngx-translate/core';
import { OverlayRef } from '@angular/cdk/overlay';
import moment from 'moment';

import { ChangeType as ChangeTypeEnum, HistoryOperation } from 'imx-api-qbm';
import { DataChangesSidesheetComponent } from './data-changes-sidesheet/data-changes-sidesheet.component';
import { DataChangesService } from './data-changes.service';

export interface Column {
  name: string;
  title: string;
  value: (row: HistoryOperation) => string;
}

export interface SearchType {
  name: string;
  value: string;
}

export interface ChangeType {
  name: string;
  title: string;
  value: number;
}

const searchFormValidator: ValidatorFn = (searchForm: UntypedFormGroup) => {
  if (searchForm.get('backToDateFormControl').enabled && searchForm.get('backFromDateFormControl').enabled) {
    if (searchForm.get('backToDateFormControl').value && searchForm.get('backFromDateFormControl').value) {
      let backToDate: Date = searchForm.get('backToDateFormControl').value;
      let backFromDate: Date = searchForm.get('backFromDateFormControl').value;

      if (backToDate >= backFromDate) return { isValid: false };
    }
  }

  return null;
};

@Component({
  selector: 'imx-data-changes',
  templateUrl: './data-changes.component.html',
  styleUrls: ['./data-changes.component.scss'],
})
export class DataChangesComponent implements OnInit {
  @ViewChild(MatPaginator) paginator: MatPaginator;

  public paginatorConfigurations = {
    size: 20,
    sizeOptions: [20, 50, 100],
    showFirstLastButtons: false,
  };
  public dataSource: MatTableDataSource<HistoryOperation>;
  public columns: Column[];
  public displayedColumns: string[];

  public searchForm = new UntypedFormGroup(
    {
      usernameFormControl: new UntypedFormControl('', [Validators.required]),
      backToDateFormControl: new UntypedFormControl('', [Validators.required]),
      backFromDateFormControl: new UntypedFormControl('', [Validators.required]),
      changeTypeFormControl: new UntypedFormControl('', [Validators.required]),
    },
    { validators: searchFormValidator },
  );
  public selectedSearchType: string;

  public changeTypes: ChangeType[];
  public badgeColor = {
    Insert: 'green',
    Update: 'orange',
    Delete: 'red',
  };

  public get changeTypeEnum(): typeof ChangeTypeEnum {
    return ChangeTypeEnum;
  }

  public get isEnabledUsername(): boolean {
    return this.searchForm.get('usernameFormControl').enabled;
  }

  public get isEnabledChangeType(): boolean {
    return this.searchForm.get('changeTypeFormControl').enabled;
  }

  public get isEnabledBackTo(): boolean {
    return this.searchForm.get('backToDateFormControl').enabled;
  }

  public get isEnabledBackFrom(): boolean {
    return this.searchForm.get('backFromDateFormControl').enabled
  }


  constructor(
    private translateService: TranslateService,
    private euiLoadingService: EuiLoadingService,
    private sidesheet: EuiSidesheetService,
    private dataChangesService: DataChangesService
  ) {}

  public async ngOnInit(): Promise<void> {
    this.selectedSearchType = 'UserName';
    this.changeTypes = this.dataChangesService.changeTypes;
    let culture = this.translateService.getBrowserCultureLang();
    this.columns = [
      {
        name: 'ChangeTime',
        title: '#LDS#Operation performed on',
        value: (row: HistoryOperation) => row.ChangeTime?.toLocaleString(culture),
      },
      { name: 'ChangeType', title: '#LDS#Type of operation', value: (row: HistoryOperation) => this.dataChangesService.changeTypeString(row.ChangeType) },
      { name: 'DisplayType', title: '#LDS#Object type', value: (row: HistoryOperation) => row.DisplayType },
      { name: 'ObjectDisplay', title: '#LDS#Object name', value: (row: HistoryOperation) => row.ObjectDisplay },
      { name: 'ProcessId', title: '#LDS#Process ID', value: (row: HistoryOperation) => row.ProcessId },
      { name: 'User', title: '#LDS#Operation performed by', value: (row: HistoryOperation) => row.User },
    ];
    this.displayedColumns = this.columns.map((c) => c.name);
    this.manageSearchState();
  }

  public searchTypeChange(): void {
    this.dataSource = new MatTableDataSource<HistoryOperation>();
    this.dataSource.paginator = this.paginator;
    this.manageSearchState();
  }

  public manageSearchState(): void {
    this.searchForm.get('usernameFormControl').reset();
    this.searchForm.get('backFromDateFormControl').reset();
    this.searchForm.get('backToDateFormControl').reset();
    this.searchForm.get('changeTypeFormControl').reset();

    let now = new Date();
    now.setHours(0, 0, 0, 0);

    if (this.selectedSearchType.toUpperCase() === 'UserName'.toUpperCase()) {
      this.searchForm.get('usernameFormControl').enable();
      this.searchForm.get('backToDateFormControl').enable();
      this.searchForm.get('backFromDateFormControl').disable();
      this.searchForm.get('changeTypeFormControl').disable();

      this.searchForm.get('backToDateFormControl').setValue(moment(new Date(now.getTime() - 24 * 60 * 60 * 1000))); // 24 hours back from now
    } else if (this.selectedSearchType.toUpperCase() === 'ChangeType'.toUpperCase()) {
      this.searchForm.get('usernameFormControl').disable();
      this.searchForm.get('backToDateFormControl').enable();
      this.searchForm.get('backFromDateFormControl').enable();
      this.searchForm.get('changeTypeFormControl').enable();

      this.searchForm.get('backToDateFormControl').setValue(moment(new Date(now.getTime() - 24 * 60 * 60 * 1000)));
      this.searchForm.get('backFromDateFormControl').setValue(moment(now));
    }
  }

  public async loadHistoryOperationsData(): Promise<void> {
    if (this.selectedSearchType.toUpperCase() === 'UserName'.toUpperCase()) await this.loadHistoryOperationsDataByUserName();
    else if (this.selectedSearchType.toUpperCase() === 'ChangeType'.toUpperCase()) await this.loadHistoryOperationsDataByChangeType();
  }

  public async loadHistoryOperationsDataByUserName(): Promise<void> {
    let overlayRef: OverlayRef;
    setTimeout(() => (overlayRef = this.euiLoadingService.show()));
    try {
      this.dataSource = new MatTableDataSource<HistoryOperation>();
      this.dataSource.paginator = this.paginator;

      if (!this.searchForm.get('usernameFormControl').value) {
        return;
      }

      const historyOperationsData = await this.dataChangesService.getHistoryOperationsDataByUserName(
        this.searchForm.get('usernameFormControl').value,
        { backto: this.searchForm.get('backToDateFormControl').value }
      );

      if (historyOperationsData) {
        this.dataSource = new MatTableDataSource<HistoryOperation>(historyOperationsData.Events);
        this.dataSource.paginator = this.paginator;
      }
    } finally {
      setTimeout(() => this.euiLoadingService.hide(overlayRef));
    }
  }

  public async loadHistoryOperationsDataByChangeType(): Promise<void> {
    let overlayRef: OverlayRef;
    setTimeout(() => (overlayRef = this.euiLoadingService.show()));

    try {
      this.dataSource = new MatTableDataSource<HistoryOperation>();
      this.dataSource.paginator = this.paginator;

      if (
        !this.searchForm.get('backFromDateFormControl').value ||
        !this.searchForm.get('backToDateFormControl').value ||
        !this.searchForm.get('changeTypeFormControl').value
      ) {
        return;
      }

      await this.loadHistoryDataByChangeType();
    } finally {
      setTimeout(() => this.euiLoadingService.hide(overlayRef));
    }
  }

  public displayChangedPropertyListSidesheet(row: HistoryOperation): void {
    if (row.Columns && row.Columns.length > 0) {
      let changeType = this.dataChangesService.changeTypeString(row.ChangeType);
      let title = this.translateService.instant('#LDS#Heading View Operation Details') + ' (' + changeType + ')';
      let headerColour = this.badgeColor[ChangeTypeEnum[row.ChangeType]];

      this.sidesheet.open(DataChangesSidesheetComponent,
        {
          title: title,
          subTitle: row.ObjectDisplay,
          width: 'max(400px, 40%)',
          data: row,
          testId: 'data-change-details-sidesheet',
          headerColour: headerColour
        }
      );
    }
  }

  private async loadHistoryDataByChangeType(): Promise<void> {
    const backFrom = this.searchForm.get('backFromDateFormControl').value.toDate() as Date;

    backFrom.setHours(23);
    backFrom.setMinutes(59);
    backFrom.setSeconds(59);

    const sum = this.searchForm.get('changeTypeFormControl').value.reduce((aggregate, currentValue) => aggregate + currentValue, 0);
    if (sum === 0) {
      return;
    }

    const historyOperationsData = await this.dataChangesService.getHistoryOperationsDataByChangeType({
      backto: this.searchForm.get('backToDateFormControl').value,
      backfrom: backFrom,
      types: sum,
    });

    if (historyOperationsData) {
      this.dataSource = new MatTableDataSource<HistoryOperation>(historyOperationsData.Events);
      this.dataSource.paginator = this.paginator;
    }
  }
}
