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
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ChapterLink, ContextualHelpItem } from 'imx-api-qbm';
import { HelpContextualService } from '../help-contextual.service';

/**
 * The dialog component opens by the help contextual component
 */
@Component({
  selector: 'imx-help-contextual-dialog',
  templateUrl: './help-contextual-dialog.component.html',
  styleUrls: ['./help-contextual-dialog.component.scss'],
})
export class HelpContextualDialogComponent {
  constructor(
    private readonly helpContextService: HelpContextualService,
    public matDialogRef: MatDialogRef<HelpContextualDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ContextualHelpItem
  ) {}

  /**
   * The call retruns the dialog heading
   * @returns {string}
   */
  get dialogHeading(): string {
    return this.data.Heading || '#LDS#Heading Information';
  }

  /**
   * The call retruns the dialog details
   * @returns {string[]}
   */
  get dialogDetails(): string[] {
    return this.data.Details || [];
  }

  /**
   * The call returns the url in a correct way. If the url not external we add the baseUrl before the link.
   * @param {ChapterLink} ChapterLink
   * @returns {string}
   */
  getHelpLink(link: ChapterLink): string {
    if (link.IsExternal) {
      return link.Url;
    }
    return this.helpContextService.getHelpLink(link.Url);
  }
}
