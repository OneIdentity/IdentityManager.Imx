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

import { Component, Input, OnInit } from '@angular/core';
import { AbstractControl, UntypedFormGroup } from '@angular/forms';

import { RulesViolationsAction } from '../rules-violations-action.interface';
import { ColumnDependentReference } from 'qbm';

/**
 * @ignore since this is only an internal component.
 *
 * Component for making a decision for a multiple rules violations.
 * There is an alternative component for the case of a decision for a single rules
 * violation as well: {@link RulesViolationsSingleActionComponent}.
 */
@Component({
  selector: 'imx-rules-violations-multi-action',
  templateUrl: './rules-violations-multi-action.component.html',
  styleUrls: ['./rules-violations-multi-action.component.scss']
})
export class RulesViolationsMultiActionComponent implements OnInit {

  /**
   * @ignore since this is only an internal component.
   *
   * Data coming from the service about the rules violations.
   */
  @Input() public data: RulesViolationsAction;

  /**
   * @ignore since this is only an internal component.
   *
   * The form group to which the necessary form fields will be added.
   */
  @Input() public formGroup: UntypedFormGroup;

  /**
   * @ignore since this is only public because of databinding to the template
   *
   * The references depending on the columns of the rules violations that are displayed/edited during the decision.
   *
   */
  public readonly columns: ColumnDependentReference[] = [];

  /**
   * @ignore since this is only an internal component
   *
   * Sets up the {@link columns} to be displayed/edited during OnInit lifecycle hook.
   */
  public ngOnInit(): void {

    if (this.data.actionParameters.validUntil) {
      this.columns.push(this.data.actionParameters.validUntil);
    }

    if (this.data.actionParameters.justification) {
      this.columns.push(this.data.actionParameters.justification);
    }

    this.columns.push(this.data.actionParameters.reason);
  }

  /**
   * @ignore since this is only public because of databinding to the template
   *
   * Handles the event emitted when a cdr editor created a new form control.
   *
   * @param name The name of the form control
   * @param control The form control
   */
  public onFormControlCreated(name: string, control: AbstractControl): void {
    // use setTimeout to make addControl asynchronous in order to avoid "NG0100: Expression has changed after it was checked"
    setTimeout(() =>
      this.formGroup.addControl(name, control)
    );
  }
}
