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

import { Component, Input } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';

import { PolicyViolationsAction } from '../policy-violations-action.interface';

/**
 * @ignore since this is only an internal component.
 *
 * Component for making a decision for a multiple policy violations.
 * There is an alternative component for the case of a decision for a single policy violation as well
 * {@link  PolicyViolationsActionSingleActionComponent}
 */
@Component({
  selector: 'imx-policy-violations-action-multi-action',
  templateUrl: './policy-violations-action-multi-action.component.html',
  styleUrls: ['./policy-violations-action-multi-action.component.scss']
})
export class PolicyViolationsActionMultiActionComponent{

  /**
   * @ignore since this is only an internal component.
   *
   * Data coming from the service about the policy violations.
   */
  @Input() public data: PolicyViolationsAction;

  /**
   * @ignore since this is only an internal component.
   *
   * The form group to which the necessary form fields will be added.
   */
  @Input() public formGroup: UntypedFormGroup;
}
