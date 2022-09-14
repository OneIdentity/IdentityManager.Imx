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
 * Copyright 2021 One Identity LLC.
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

import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import { DateDiffUnit } from 'imx-qbm-dbts';
import { SqlNodeView } from './SqlNodeView';
import { DateDiffOption, SqlWizardService } from './sqlwizard.service';

@Component({
  templateUrl: './date-picker.component.html',
  styleUrls: ['./sqlwizard.scss'],
  selector: 'imx-sqlwizard-datepicker'
})
export class DatePickerComponent implements OnInit {
  public absoluteError = false;


  get diffUnit(): DateDiffUnit {
    return this.diffValue.TimeUnit;
  }

  set diffUnit(d: DateDiffUnit) {
    this.diffValue.TimeUnit = d;
  }
  get relative(): boolean {
    return this._relative;
  }
  set relative(val: boolean) {
    this._relative = val;
    this.expr.Data.Value = val ? this.diffValue : null;
  }

  @Input() public expr: SqlNodeView;
  @Output() changes = new EventEmitter<any>();

  public diffValue: {
    Difference?: number,
    TimeUnit?: DateDiffUnit
  } = {};

  public diffUnits: DateDiffOption[];

  private _relative = false;

  constructor(svc: SqlWizardService) {
    this.diffUnits = svc.getDateDiffUnits();
  }

  public ngOnInit(): void {
    if (this.expr.Data.Value && this.expr.Data.Value.TimeUnit) {
      this._relative = true;
      this.diffValue = this.expr.Data.Value;
    }
  }

  public emitChanges(): void {
    this.changes.emit();
  }

  public onAbsoluteChange(date: MatDatepickerInputEvent<Date>): void {
    this.absoluteError = !date.value ? true : false;
    if (!this.absoluteError) {
      this.emitChanges();
    }
  }
}
