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

import { Component } from '@angular/core';
import { UntypedFormControl } from '@angular/forms';

import { EditorBase } from '../editor-base';
import { ClassloggerService } from '../../classlogger/classlogger.service';

/**
 * A component for viewing / editing limited value columns
 */
@Component({
  selector: 'imx-edit-limited-value',
  templateUrl: './edit-limited-value.component.html',
  styleUrls: ['./edit-limited-value.component.scss'],
})
export class EditLimitedValueComponent extends EditorBase<string | number> {
  public readonly control = new UntypedFormControl(undefined, { updateOn: 'blur' });

  constructor(logger: ClassloggerService) {
    super(logger);
  }

  public removeAssignment(evt: Event){
    evt.stopPropagation();
    this.control.setValue('');
    this.control.markAsDirty();
  }
}
