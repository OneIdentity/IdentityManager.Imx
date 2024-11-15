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

import { Component, Inject } from '@angular/core';
import { AbstractControl, UntypedFormGroup } from '@angular/forms';
import { EUI_SIDESHEET_DATA, EuiSidesheetRef } from '@elemental-ui/core';

import { CdrSidesheetConfig } from './cdr-sidesheet-config';

/**
 * Provides a side sheet, that displays a form with {@link CdrEditor | cdr editors}.
 *
 * Writeable properties can be edited.
 */
@Component({
  templateUrl: './cdr-sidesheet.component.html',
})
export class CdrSidesheetComponent {
  /**
   * The form, that stores the editors.
   */
  public readonly cdrFormGroup = new UntypedFormGroup({});

  /**
   * Creates an instance of this component.
   * @param config Information about the cdr and the caption of the 'close' button.
   * @param sidesheetRef a reference of the sidesheet.
   */
  constructor(
    @Inject(EUI_SIDESHEET_DATA) public readonly config: CdrSidesheetConfig,
    public readonly sidesheetRef: EuiSidesheetRef,
  ) {}

  /**
   * Adds the form control of an editor to the form group.
   * @param name The name of the control.
   * @param control The form control that should be added.
   */
  public addFormControl(name: string, control: AbstractControl): void {
    this.cdrFormGroup.addControl(name, control);
  }
}
