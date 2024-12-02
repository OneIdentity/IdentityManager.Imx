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

import { Component } from '@angular/core';
import { UntypedFormControl } from '@angular/forms';

import { ClassloggerService } from '../../classlogger/classlogger.service';
import { EditorBase } from '../editor-base';

/**
 * Provides a {@link CdrEditor | CDR editor} for editing / viewing limited value columns.
 *
 * To change the value it uses an Angular Material select component.
 * When set to read-only, it uses a {@link ViewPropertyComponent | view property component} to display the content.
 */
@Component({
  selector: 'imx-edit-limited-value',
  templateUrl: './edit-limited-value.component.html',
  styleUrls: ['./edit-limited-value.component.scss'],
})
export class EditLimitedValueComponent extends EditorBase<string | number> {
  /**
   * The form control associated with the editor.
   */
  public readonly control = new UntypedFormControl(undefined, { updateOn: 'blur' });

  constructor(logger: ClassloggerService) {
    super(logger);
  }

  /**
   * Removes the current assignment and writes the 'empty' value to the form control.
   */
  public removeAssignment(evt: Event) {
    evt.stopPropagation();
    this.control.setValue('');
    this.control.markAsDirty();
  }
}
