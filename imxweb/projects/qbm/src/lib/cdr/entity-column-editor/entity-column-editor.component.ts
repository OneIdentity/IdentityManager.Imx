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

import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, ViewChild } from '@angular/core';
import { AbstractControl } from '@angular/forms';

import { IEntityColumn } from 'imx-qbm-dbts';
import { ColumnDependentReference } from '../column-dependent-reference.interface';
import { CdrEditorComponent } from '../cdr-editor/cdr-editor.component';


@Component({
  selector: 'imx-entity-column-editor',
  templateUrl: './entity-column-editor.component.html',
  styleUrls: ['./entity-column-editor.component.scss']
})
export class EntityColumnEditorComponent implements OnChanges {
  public cdr: ColumnDependentReference;

  @Input() public column: IEntityColumn;
  @Input() public readonly: boolean;

  @Output() public controlCreated = new EventEmitter<{ name: string; control: AbstractControl; }>();

  @ViewChild(CdrEditorComponent) editor: CdrEditorComponent;

  public ngOnChanges(changes: SimpleChanges): void {
    if (changes['column'] || changes['readonly']) {
      this.cdr = this.column ?
        {
          column: this.column,
          isReadOnly: () => this.readonly || !this.column.GetMetadata().CanEdit(),
        }
        : undefined;
    }
  }

  public update(): void {
    this.editor?.update();
  }
}
