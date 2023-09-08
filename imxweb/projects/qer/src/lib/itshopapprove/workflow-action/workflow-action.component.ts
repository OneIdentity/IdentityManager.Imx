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

import { Component, Inject } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { EUI_SIDESHEET_DATA, EuiSidesheetRef } from '@elemental-ui/core';

import { WorkflowActionEdit } from './workflow-action-edit.interface';

/**
 * Component displayed in a sidesheet to make a decision for one or more requests.
 *
 * Uses two alternate views
 * <ul>
 * <li>a) a simple view for a single request</li>
 * <li>b) a complex view using bulk items for multiple requests.</li>
 * </ul>
 *
 * Currently depends on pre-calculation of important view-model properties
 * into a {@link WorkflowActionEdit} object.
 *
 * Therefore this component is not meant to be used directly but rather be called
 * from a service that does the pre-calculation and opens this component in a
 * sidesheet passing the pre-calculated values.
 *
 * An implementation of such a service is {@link WorkflowActionService}.
 */
@Component({
  selector: 'imx-workflow-action',
  templateUrl: './workflow-action.component.html',
  styleUrls: ['./workflow-action.component.scss']
})
export class WorkflowActionComponent {
  /**
   * The form group to which the created form controls will be added.
   */
  public readonly formGroup = new UntypedFormGroup({});

  /**
   * Creates a new WorkflowActionComponent
   * @param data The pre-calculated data object.
   * @param sideSheetRef A reference to the sidesheet containing this component.
   */
  constructor(
    @Inject(EUI_SIDESHEET_DATA) public readonly data: WorkflowActionEdit,
    public readonly sideSheetRef: EuiSidesheetRef
  ) {

    if (this.data.customValidation) {
      this.formGroup.setValidators(_ => this.data.customValidation.validate() ? null : ({ required: true }));
    }
  }
}
