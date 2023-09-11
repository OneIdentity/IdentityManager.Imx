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
import { BaseCdr } from 'qbm';

@Component({
  selector: 'imx-reason-sidesheet',
  templateUrl: './reason-sidesheet.component.html',
  styleUrls: ['./reason-sidesheet.component.scss']
})
export class ReasonSidesheetComponent {
  public readonly formGroup = new UntypedFormGroup({});

  constructor(
    public readonly sidesheetRef: EuiSidesheetRef,
    @Inject(EUI_SIDESHEET_DATA)
    public readonly data: {
      actionParameters: {
        justification: BaseCdr,
        reason: BaseCdr
      },
    }
  ) {}

  /**
   * Sends the reason back to the main component, where it was opened from
   */
  public sendReason(): void {
    this.sidesheetRef.close(this.formGroup.getRawValue().reason);
  }

}
