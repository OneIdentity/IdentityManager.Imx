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
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { MessageDialogResult } from './message-dialog-result.enum';
import { MessageDialogService } from './message-dialog.service';
import { MessageParameter } from './message-parameter.interface';

@Component({
  selector: 'imx-message-dialog',
  templateUrl: './message-dialog.component.html',
  styleUrls: ['./message-dialog.component.scss'],
})
export class MessageDialogComponent {
  public readonly MessageDialogResult = MessageDialogResult; // Enables use of this Enum in Angular Templates.

  constructor(
    public dialogRef: MatDialogRef<MessageDialogComponent>,
    public messageDialogService: MessageDialogService,
    @Inject(MAT_DIALOG_DATA) public data: MessageParameter,
  ) {}

  public click(state: MessageDialogResult): void {
    this.dialogRef.close(state);
  }

  public get messages(): (string | undefined)[] {
    let messages = this.messageDialogService.errorMessages$.value;
    if (!!messages && messages.length > 0) {
      return messages.filter((message, index) => index == messages.indexOf(message));
    } else {
      return [this.data.Message];
    }
  }
}
