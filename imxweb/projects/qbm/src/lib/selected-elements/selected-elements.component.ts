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

import { Component, Input } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';

import { TypedEntity } from 'imx-qbm-dbts';
import { SelectedElementsDialog } from './selected-elements-dialog/selected-elements-dialog.component';

@Component({
  selector: 'imx-selected-elements',
  templateUrl: './selected-elements.component.html',
  styleUrls: ['./selected-elements.component.scss'],
})
export class SelectedElementsComponent {
  @Input() public selectedElements: TypedEntity[] = [];
  @Input() public tables: string[];
  @Input() public isLoading: boolean;
  @Input() public caption = this.translate.instant('#LDS#Show selected');
  @Input() public dialogHeader = this.translate.instant('#LDS#Heading Selected Items');

  constructor(public readonly dialog: MatDialog, public readonly translate: TranslateService) {}

  public onOpenSelectionDialog(): void {
    this.dialog.open(SelectedElementsDialog, {
      width: 'max(60%,600px)',
      height: 'max(60%,600px)',
      data: { entities: this.selectedElements, tables: this.tables ?? [], header: this.dialogHeader },
    });
  }
}
