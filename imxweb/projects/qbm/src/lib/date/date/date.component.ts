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

import { Component, Input } from '@angular/core';
import { AbstractControl } from '@angular/forms';

import { DbVal } from 'imx-qbm-dbts';

@Component({
  selector: 'imx-date',
  templateUrl: './date.component.html',
  styleUrls: ['./date.component.scss']
})
export class DateComponent {
  public get validationErrorText(): string {
    const errors = this.control.errors;

    if (errors?.matDatepickerMin || errors?.matDatepickerMax) {
      return '#LDS#The date you entered is outside of the allowed range.';
    }

    if (errors?.matDatepickerParse) {
      return '#LDS#The value you entered is not a valid date.';
    }

    if (errors?.required) {
      return '#LDS#This field is mandatory.';
    }

    return '';
  }

  public readonly dbValMinDate = DbVal.MinDate;

  @Input() public control: AbstractControl;
  @Input() public display: string;
  @Input() public min: Date;
  @Input() public max: Date;
  @Input() public imxIdentifierSuffix: string;
  @Input() public isValueRequired: boolean;
  @Input() public isReadonly: boolean;
  @Input() public isLoading: boolean;
}
