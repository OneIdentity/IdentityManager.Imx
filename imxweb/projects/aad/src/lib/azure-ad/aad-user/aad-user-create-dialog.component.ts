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

import { Component, Inject, OnInit } from '@angular/core';
import { UntypedFormArray, UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { IWriteValue } from 'imx-qbm-dbts';
import { BaseCdr, ColumnDependentReference } from 'qbm';

export interface AadUserCreateDialogData {
  property: IWriteValue<string>;
  title: string;
}

@Component({
  selector: 'imx-aad-user-create-dialog',
  templateUrl: './aad-user-create-dialog.component.html',
  styleUrls: ['./aad-user-create-dialog.component.scss']
})
export class AadUserCreateDialogComponent implements OnInit {

  public readonly detailsFormGroup: UntypedFormGroup;
  public cdrList: ColumnDependentReference[] = [];

  constructor(
    formBuilder: UntypedFormBuilder,
    public dialogRef: MatDialogRef<AadUserCreateDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: AadUserCreateDialogData
  ) {
    this.detailsFormGroup = new UntypedFormGroup({ formArray: formBuilder.array([]) });
  }

  get formArray(): UntypedFormArray {
    return this.detailsFormGroup.get('formArray') as UntypedFormArray;
  }

  public ngOnInit(): void {
    this.setup();
  }

  public create(): void {
    this.dialogRef.close(this.data);
  }

  private setup(): void {
    this.cdrList = [
      new BaseCdr(this.data.property.Column)
    ];
  }

}
