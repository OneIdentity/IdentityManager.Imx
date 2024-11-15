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

import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, ViewChild } from '@angular/core';
import { AbstractControl } from '@angular/forms';

import { IEntityColumn } from '@imx-modules/imx-qbm-dbts';
import { CdrEditorComponent } from '../cdr-editor/cdr-editor.component';
import { ColumnDependentReference } from '../column-dependent-reference.interface';

/**
 * Provides a column editor component, that wraps around a {@link CdrEditor | column dependent reference editor}.
 */
@Component({
  selector: 'imx-entity-column-editor',
  templateUrl: './entity-column-editor.component.html',
  styleUrls: ['./entity-column-editor.component.scss'],
})
export class EntityColumnEditorComponent implements OnChanges {
  /**
   * @ignore only used in template.
   * The column dependent reference used by the editor.
   */
  public cdr: ColumnDependentReference | undefined;

  /**
   * An entity column, that should be edited with a {@link CdrEditor | column dependent reference editor}.
   */
  @Input() public column: IEntityColumn;

  /**
   * Indicator, whether the control should be displayed as read-only.
   */
  @Input() public readonly: boolean;
  @Input() public display: string;

  /**
   * This is emitted, after the control is created properly.
   * Only after this, the component can be added to a formGroup or FormArray.
   */
  @Output() public controlCreated = new EventEmitter<{ name: string; control: AbstractControl }>();

  /**
   * @ignore Used in template only.
   * The cdr editor component.
   */
  @ViewChild(CdrEditorComponent) editor: CdrEditorComponent;

  /**
   * Updates the cdr, if the 'OnChanges' hook is called.
   * @param changes The changes that are applied (only column and readonly is evaluated).
   */
  public ngOnChanges(changes: SimpleChanges): void {
    if (changes['column'] || changes['readonly']) {
      this.cdr = this.column
        ? {
            column: this.column,
            isReadOnly: () => this.readonly || !this.column.GetMetadata().CanEdit(),
            display: this.display,
          }
        : undefined;
    }
  }

  /**
   * Calls the update method from the {@link CdrEditor | column dependent reference editor}.
   */
  public update(): void {
    this.editor?.update();
  }
}
