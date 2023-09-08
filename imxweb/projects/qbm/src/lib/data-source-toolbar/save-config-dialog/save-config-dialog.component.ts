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
import {FormControl, Validators} from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';


@Component({
  selector: 'imx-save-config-dialog',
  templateUrl: './save-config-dialog.component.html',
  styleUrls: ['./save-config-dialog.component.scss']
})
export class SaveConfigDialogComponent {

  public formControl = new FormControl<string>('', Validators.required)

  public get displayName(): string {
    return this.formControl.value;
  }

  constructor(
    private dialogRef: MatDialogRef<SaveConfigDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data?: {
      currentName: string
    }
  ) {
    if (data?.currentName) {
      this.formControl.reset(data.currentName);
    }
  }

  public get isValid(): boolean {
    return this.formControl.valid;
  }

  public get isNew(): boolean {
    return this.data?.currentName ? this.formControl.value !== this.data.currentName: true;
  }

}
