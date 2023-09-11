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
import { EuiSidesheetRef, EUI_SIDESHEET_DATA } from '@elemental-ui/core';

import { RulesViolationsAction } from './rules-violations-action.interface';

/**
 * Component displayed in a sidesheet to make a decision for one or more rules violations.
 *
 * Uses two alternate views
 * <ul>
 * <li>a) a simple view for a single rules violation</li>
 * <li>b) a complex view using bulk items for multiple rules violations.</li>
 * </ul>
 */
@Component({
  selector: 'imx-rules-violations-action',
  templateUrl: './rules-violations-action.component.html',
  styleUrls: ['./rules-violations-action.component.scss']
})
export class RulesViolationsActionComponent {

  /**
   * The form group to which the created form controls will be added.
   */
  public readonly formGroup = new UntypedFormGroup({});

  /**
   * Creates a new RulesViolationsActionComponent
   * @param data The pre-calculated data object.
   * @param sideSheetRef A reference to the sidesheet containing this component.
   */
  constructor(
    @Inject(EUI_SIDESHEET_DATA) public readonly data: RulesViolationsAction,
    public readonly sideSheetRef: EuiSidesheetRef
  ) { }
}
