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
import { TranslateService } from '@ngx-translate/core';

import { ColumnDependentReference } from '../column-dependent-reference.interface';
import { CdrEditor } from '../cdr-editor.interface';
import { EntityColumnContainer } from '../entity-column-container';

/**
 * A component for viewing / editing binary columns
 */
@Component({
  selector: 'imx-edit-binary',
  templateUrl: './edit-binary.component.html',
  styleUrls: ['./edit-binary.component.scss']
})
export class EditBinaryComponent implements CdrEditor {
  public readonly control = new UntypedFormControl({ value: undefined, disabled: true });
  // TODO: TFS 806165 "imx-web: Editor für Binärdaten verbessern" umsetzen

  public readonly columnContainer = new EntityColumnContainer<string>();

  private message: string;

  constructor(translationProvider: TranslateService) {
    translationProvider.get('#LDS#This property cannot be displayed.').subscribe(value => this.message = value);
  }

  /**
   * Binds a column dependent reference to the component
   * @param cdref a column dependent reference
   */
  public bind(cdref: ColumnDependentReference): void {
    if (cdref && cdref.column) {
      this.columnContainer.init(cdref);
      this.control.setValue(this.message, { emitEvent: false });
    }
  }
}
