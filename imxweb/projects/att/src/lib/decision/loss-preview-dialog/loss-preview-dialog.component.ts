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
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { LossPreview } from '../loss-preview.interface';

@Component({
  selector: 'imx-loss-preview-dialog',
  templateUrl: './loss-preview-dialog.component.html',
  styleUrls: ['./loss-preview-dialog.component.scss']
})
export class LossPreviewDialogComponent implements OnInit {
  public lossPreview: LossPreview;

  constructor(
    public dialogRef: MatDialogRef<LossPreviewDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public readonly data: LossPreview,
  ) {
  }
  public ngOnInit(): void {
      this.lossPreview = this.data;
  }

  public onDeny(): void {
    this.dialogRef.close(true);
  }
}
