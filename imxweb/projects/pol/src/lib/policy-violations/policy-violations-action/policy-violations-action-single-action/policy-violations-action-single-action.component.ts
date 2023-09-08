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

import { ColumnDependentReference } from 'qbm';
import { PolicyViolation } from '../../policy-violation';
import { PolicyViolationsAction } from '../policy-violations-action.interface';

/**
 * @ignore since this is only an internal component.
 *
 * Component for making a decision for a single policy violation.
 * There is an alternative component for the case of a decision for multiple policy violations as
 *  well: {@link PolicyViolationActionMultiActionComponent}.
 */
@Component({
  selector: 'imx-policy-violations-action-single-action',
  templateUrl: './policy-violations-action-single-action.component.html',
  styleUrls: ['./policy-violations-action-single-action.component.scss']
})
export class PolicyViolationsActionSingleActionComponent implements OnInit {

  /**
   * @ignore since this is only an internal component.
   *
   * Data coming from the service about the policy violation.
   */
  @Input() public data: PolicyViolationsAction;

  /**
   * @ignore since this is only an internal component.
   *
   * The form group to which the necessary form fields will be added.
   */
  @Input() public formGroup: UntypedFormGroup;

  /**
   * @ignore since this is only public because of databinding to the template
   *
   * The single policy violation taken from {@link data}
   */
  public policyViolation: PolicyViolation;

  /**
   * @ignore since this is only an internal component
   *
   * Sets up the {@link columns} to be displayed/edited during OnInit lifecycle hook.
   */
  public ngOnInit(): void {
    this.policyViolation = this.data.policyViolations[0];
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
