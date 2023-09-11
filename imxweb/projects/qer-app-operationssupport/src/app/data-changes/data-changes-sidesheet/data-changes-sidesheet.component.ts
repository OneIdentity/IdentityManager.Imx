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

import { Component, Inject, OnInit } from '@angular/core';
import { EUI_SIDESHEET_DATA, EuiSidesheetRef } from '@elemental-ui/core';
import { TranslateService } from '@ngx-translate/core';
import { HistoryOperation, HistoryOperationColumn } from 'imx-api-qbm';
import { IEntityColumn, ValType } from 'imx-qbm-dbts';
import { BaseReadonlyCdr, ColumnDependentReference, EntityService } from 'qbm';
import { Subscription } from 'rxjs';

@Component({
  selector: 'imx-data-changes-sidesheet',
  templateUrl: './data-changes-sidesheet.component.html',
  styleUrls: ['./data-changes-sidesheet.component.scss'],
})
export class DataChangesSidesheetComponent implements OnInit {
  public isOpening = true;
  private openSub$: Subscription;
  public cdrList: ColumnDependentReference[] = [];

  constructor(
    @Inject(EUI_SIDESHEET_DATA) public data: HistoryOperation,
    private sidesheetRef: EuiSidesheetRef,
    private entityService: EntityService,
    private translate: TranslateService
  ) {}

  public get isMulti(): boolean {
    return this.data?.Columns && this.data.Columns.length > 1;
  }

  public ngOnInit(): void {
    this.openSub$ = this.sidesheetRef.componentInstance.onOpen().subscribe((_) => {
      this.isOpening = false;
    });
  }

  public ngOnDestroy(): void {
    this.openSub$.unsubscribe();
  }

  public getCdrList(column: HistoryOperationColumn): ColumnDependentReference[] {
    return [
      this.buildEntiyColumn('name', this.translate.instant('#LDS#Column name'), column.ColumnDisplay),
      this.buildEntiyColumn('old', this.translate.instant('#LDS#Old value'), column.OldValueDisplay),
      this.buildEntiyColumn('new', this.translate.instant('#LDS#New value'), column.NewValueDisplay),
    ].map((col) => new BaseReadonlyCdr(col));
  }

  private buildEntiyColumn(name: string, display: string, displayValue: string): IEntityColumn {
    return this.entityService.createLocalEntityColumn({ Type: ValType.String, ColumnName: name, Display: display }, undefined, {
      DisplayValue: displayValue,
    });
  }
}
