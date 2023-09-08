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

import { Component, Input, TemplateRef } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { InfoDialogComponent } from '../info-dialog/info-dialog.component';

@Component({
  selector: 'imx-info-button',
  templateUrl: './info-button.component.html',
  styleUrls: ['./info-button.component.scss']
})
export class InfoButtonComponent  {
  // width string = '400px'. Sets the width of the appearing dialog.
  @Input() public width = '400px';

  // title: string Gives the dialog an h3 title if present
  @Input() public title: string = null;

  // templateRef: TemplateRef<unknown>. Provides the content within the the dialog
  @Input() public templateRef: TemplateRef<unknown>;

  // panelClass: string | string[]. Allows for a class to be applied to the overlay and the above templateRef to be styled.
  @Input() public panelClass: string | string[];

  constructor(
    private dialogService: MatDialog
  ) { }

  public async showInfo(): Promise<void> {
    await this.dialogService.open(InfoDialogComponent, {
      width: this.width,
      data: {
        title: this.title,
        content: this.templateRef
      },
      panelClass: this.panelClass
    }).afterClosed().toPromise();
  }

}
