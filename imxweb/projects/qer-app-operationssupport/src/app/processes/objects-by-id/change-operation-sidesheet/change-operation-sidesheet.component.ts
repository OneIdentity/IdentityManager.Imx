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
import { EUI_SIDESHEET_DATA, EuiSidesheetRef } from '@elemental-ui/core';
import { HistoryOperation } from 'imx-api-qbm';
import { Subscription } from 'rxjs';

@Component({
  selector: 'imx-change-operation-sidesheet',
  templateUrl: './change-operation-sidesheet.component.html',
  styleUrls: ['./change-operation-sidesheet.component.scss']
})
export class ChangeOperationSidesheetComponent implements OnInit, OnDestroy {
  public isOpening = true;
  private openSub$: Subscription;

  constructor(
    @Inject(EUI_SIDESHEET_DATA) public data: HistoryOperation,
    private sidesheetRef: EuiSidesheetRef
  ) {}

  public get isMulti(): boolean {
    return this.data?.Columns && this.data.Columns.length > 1;
  }

  public ngOnInit(): void {
    this.openSub$ = this.sidesheetRef.componentInstance.onOpen().subscribe(_ => {
      this.isOpening = false;
    });
  }

  public ngOnDestroy(): void {
    this.openSub$.unsubscribe();
  }
}
