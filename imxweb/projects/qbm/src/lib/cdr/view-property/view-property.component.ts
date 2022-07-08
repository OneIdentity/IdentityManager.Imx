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
 * Copyright 2021 One Identity LLC.
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

import { ValType } from 'imx-qbm-dbts';
import { EntityColumnContainer } from '../entity-column-container';

@Component({
  selector: 'imx-view-property',
  templateUrl: './view-property.component.html',
  styleUrls: ['./view-property.component.scss']
})
export class ViewPropertyComponent {
  @Input() public columnContainer: EntityColumnContainer;
  @Input() public defaultValue: string;

  constructor(
    private translate: TranslateService
  ) { }

  public get displayedValue(): string {

    if (this.columnContainer?.type === ValType.Date) {
      const date: Date = new Date(this.columnContainer.value ?? this.defaultValue);
      return date.toLocaleString(this.translate.currentLang);
    }
    return this.columnContainer?.displayValue || this.columnContainer?.value || this.defaultValue;
  }
}
