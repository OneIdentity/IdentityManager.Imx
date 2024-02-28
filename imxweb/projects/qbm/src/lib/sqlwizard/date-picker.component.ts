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

import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { DateDiffUnit } from 'imx-qbm-dbts';
import { SqlNodeView } from './SqlNodeView';
import { DateDiffOption, SqlWizardService } from './sqlwizard.service';
import { FormControl, FormGroup, ValidatorFn } from '@angular/forms';

@Component({
  templateUrl: './date-picker.component.html',
  styleUrls: ['./sqlwizard.scss'],
  selector: 'imx-sqlwizard-datepicker',
})
export class DatePickerComponent implements OnInit {
  @Input() public expr: SqlNodeView;
  @Output() public change = new EventEmitter<any>();

  public diffValue: {
    Difference?: number;
    TimeUnit?: DateDiffUnit;
  } = {};

  public diffUnits: DateDiffOption[];

  private datepickerValidator: ValidatorFn = (form: FormGroup) => {
    if (form.get('relative').value) {
      if (
        !(!!form.get('timeUnit')?.value || form.get('timeUnit')?.value === 0) ||
        !form.get('difference').value ||
        Number(form.get('difference').value) < 1
      ) {
        return { datepickerError: true };
      }
    }
    return null;
  };

  public form = new FormGroup(
    {
      relative: new FormControl<boolean>(null),
      difference: new FormControl<number>(null),
      timeUnit: new FormControl<DateDiffOption>(null),
      datepicker: new FormControl<Date>(null),
    },
    [this.datepickerValidator]
  );
  constructor(svc: SqlWizardService) {
    this.diffUnits = svc.getDateDiffUnits();
  }

  public ngOnInit(): void {
    if (this.expr.Data.Value && this.expr.Data.Value.Difference) {
      this.form.controls.relative.setValue(true);
      this.form.controls.difference.setValue(this.expr.Data.Value.Difference);
      this.form.controls.timeUnit.setValue(this.expr.Data.Value.TimeUnit);
    } else {
      this.form.controls.relative.setValue(false);
      this.form.controls.datepicker.setValue(this.expr.Data.Value);
    }
    this.emitChanges();
  }

  public emitChanges(): void {
    if (
      (this.form.controls.relative.value && this.form?.errors?.datepickerError) ||
      (!this.form.controls.relative.value && (this.form.controls.datepicker.invalid || !this.form.controls.datepicker.value))
    ) {
      this.expr.Data.Value = {};
    } else if (this.form.controls.relative.value) {
      this.expr.Data.Value = {
        Difference: this.form.controls.difference.value,
        TimeUnit: this.form.controls.timeUnit.value,
      };
    } else {
      this.expr.Data.Value = this.form.controls.datepicker.value;
    }
    this.change.emit();
  }

  public get isRelative(): boolean {
    return this.form.controls.relative.value;
  }
}
