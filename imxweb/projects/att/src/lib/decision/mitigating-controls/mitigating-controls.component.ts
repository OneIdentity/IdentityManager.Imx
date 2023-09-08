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
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { IEntityColumn } from 'imx-qbm-dbts';
import { BaseCdr, ColumnDependentReference } from 'qbm';

@Component({
  selector: 'imx-mitigating-controls',
  templateUrl: './mitigating-controls.component.html',
  styleUrls: ['./mitigating-controls.component.scss']
})
export class MitigatingControlsComponent {

  public mitigatingControlCdr: ColumnDependentReference;
  public formGroup = new UntypedFormGroup({});
  constructor(
    @Inject(MAT_DIALOG_DATA) public readonly data: {
      column: IEntityColumn
    },
    public dialogRef: MatDialogRef<MitigatingControlsComponent>
  ) {
    this.mitigatingControlCdr = new BaseCdr(this.data.column);
  }

}
