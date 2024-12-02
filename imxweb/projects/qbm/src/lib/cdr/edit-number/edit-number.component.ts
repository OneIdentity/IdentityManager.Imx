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

import { AfterViewInit, Component } from '@angular/core';
import { AbstractControl, UntypedFormControl, ValidatorFn } from '@angular/forms';

import { ValType } from '@imx-modules/imx-qbm-dbts';
import { ClassloggerService } from '../../classlogger/classlogger.service';
import { EditorBase } from '../editor-base';
import { NumberError } from './number-error.interface';
import { NumberValidatorService } from './number-validator.service';

/**
 * Provides a {@link CdrEditor | CDR editor} for editing / viewing number value columns.
 * 
 * To change the value, it uses an input field, that is typed as 'number'.
 * When set to read-only, it uses a {@link ViewPropertyComponent | view property component} to display the content.
 */
@Component({
  selector: 'imx-edit-number',
  templateUrl: './edit-number.component.html',
  styleUrls: ['./edit-number.component.scss'],
})
export class EditNumberComponent extends EditorBase<number> implements AfterViewInit {
  /**
   * The form control associated with the editor.
   */
  public readonly control = new UntypedFormControl(undefined, { updateOn: 'blur' });

  constructor(logger: ClassloggerService, private readonly numberValidator: NumberValidatorService) {
    super(logger);
  }

  /**
   * Sets the validators according to the data type, after the 'AfterViewInit' hook is triggered
   */
  public ngAfterViewInit(): void {
    if (
      this.columnContainer.type === ValType.Int ||
      this.columnContainer.type === ValType.Long ||
      this.columnContainer.type === ValType.Short
    ) {
      this.control.setValidators(this.control.validator ? [this.control.validator, this.checkIntegerValue()] : this.checkIntegerValue());
    }
  }

  private checkIntegerValue(): ValidatorFn {
    return (control: AbstractControl): NumberError | null => {
      if (control == null) {
        return null;
      }

      return this.numberValidator.validate(control.value, this.columnContainer.valueConstraint);
    };
  }
}
