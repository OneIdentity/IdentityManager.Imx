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

import { Component, Input } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

import { DateFormat, ValType } from '@imx-modules/imx-qbm-dbts';
import { EntityColumnContainer } from '../entity-column-container';
import { ImxTranslationProviderService } from '../../translation/imx-translation-provider.service';

@Component({
  selector: 'imx-view-property',
  templateUrl: './view-property.component.html',
  styleUrls: ['./view-property.component.scss'],
})
export class ViewPropertyComponent {
  @Input() public columnContainer: EntityColumnContainer;
  @Input() public defaultValue: string;

  constructor(private translationProviderService: ImxTranslationProviderService) {}

  public get displayedValue(): string {
    if (this.columnContainer?.type === ValType.Date) {
      // Prefer the server-supplied DisplayValue: it already honors DateFormat (DateOnly vs DateTime) via the shared DisplayBuilder.
      if (this.columnContainer.displayValue) {
        return this.columnContainer.displayValue;
      }
      if (this.columnContainer.value == null) {
        return this.defaultValue;
      }
      const date: Date = new Date(this.columnContainer.value);
      if (!date.getDate()) {
        return this.defaultValue;
      }
      const cultureFormat = this.translationProviderService.CultureFormat;
      switch (this.columnContainer.metaData?.GetDateFormat()) {
        case DateFormat.Date:
          return date.toLocaleDateString(cultureFormat);
        case DateFormat.UtcDateTime:
          return date.toUTCString();
        default:
          return date.toLocaleString(cultureFormat);
      }
    }
    return this.columnContainer?.displayValue || this.columnContainer?.value || this.defaultValue;
  }
}
