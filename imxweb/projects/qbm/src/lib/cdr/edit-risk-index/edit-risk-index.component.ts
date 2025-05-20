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
import { MatSliderDragEvent } from '@angular/material/slider';
import { ClassloggerService } from '../../classlogger/classlogger.service';
import { ImxTranslationProviderService } from '../../translation/imx-translation-provider.service';
import { EditorBase } from '../editor-base';

/**
 * Provides a {@link CdrEditor | CDR editor} for editing / viewing risk index columns.
 *
 * To change the value, it uses an Angular Material slider, that ranges between 0 and 1.
 * When set to read-only, it uses a {@link ViewPropertyComponent | view property component} to display the content.
 */
@Component({
  selector: 'imx-edit-risk-index',
  templateUrl: './edit-risk-index.component.html',
  styleUrls: ['./edit-risk-index.component.scss'],
})
export class EditRiskIndexComponent extends EditorBase<number> {
  /**
   * The form control associated with the editor.
   */
  public readonly control = new UntypedFormControl(undefined, { updateOn: 'submit' });
  private currentCulture: string;
  /**
   * Converts a number value to a string in the current language.
   * @param value The number value, that should be formatted.
   * @returns A local representation of the number value.
   */
  public formatLabel = (value: number) => value.toLocaleString();

  constructor(
    public readonly translationProviderService: ImxTranslationProviderService,
    protected readonly logger: ClassloggerService,
  ) {
    super(logger);
    this.translationProviderService.GetCultures().then(() => {
      this.currentCulture = this.translationProviderService.CultureFormat;
      this.formatLabel = (value: number) => value.toLocaleString(this.currentCulture);
    });
  }

  onDragEnd($event: MatSliderDragEvent): void {
    this.control.setValue($event.value);
    this.control.markAsDirty();
  }
}
