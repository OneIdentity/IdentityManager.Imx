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
import { CallsAttachmentActionType, CallsAttachmentDialogData } from './../calls-attachment.model';
import { FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'imx-calls-attachment-dialog',
  templateUrl: './calls-attachment-dialog.component.html',
  styleUrls: ['./calls-attachment-dialog.component.scss'],
})
export class CallsAttachmentDialogComponent implements OnInit {
  form = new FormGroup({
    folderName: new FormControl(null, [Validators.required])
  })
  constructor(
    public matDialogRef: MatDialogRef<CallsAttachmentDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: CallsAttachmentDialogData
  ) {}

  ngOnInit(): void {}

  closeDialog(action?: string, value? : string): void {
    this.matDialogRef.close({ action, value });
  }

  get dialogTitle(): string {
    if(this.data.actionType === CallsAttachmentActionType.addFolder){
      return '#LDS#Heading Create Folder';
    }
    if(this.data.actionType === CallsAttachmentActionType.deleteFile){
      return '#LDS#Heading Delete File';
    }
    return '#LDS#Heading Delete Folder';
  }

  get dialogSubHeading(): string {
    switch (this.data.actionType) {
      case CallsAttachmentActionType.addFolder:
        return '#LDS#Create new folder under: {0}';
      case CallsAttachmentActionType.deleteFolder:
        return '#LDS#Are you sure you want to delete the folder "{0}"?';
      default:
        return '#LDS#Are you sure you want to delete the file "{0}"?';
    }
  }

  get isActionAddFolder(): boolean {
    return this.data.actionType === CallsAttachmentActionType.addFolder;
  }
}
