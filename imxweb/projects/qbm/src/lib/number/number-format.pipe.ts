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

import { Injectable, Pipe, PipeTransform } from '@angular/core';
import { ImxTranslationProviderService } from '../translation/imx-translation-provider.service';

@Injectable({
  providedIn: 'root',
})
@Pipe({
  name: 'formatNumber',
  standalone: true,
})
export class NumberFormatPipe implements PipeTransform {
  private readonly currentCulture: string;

  constructor(private readonly translationProviderService: ImxTranslationProviderService) {
    this.currentCulture = this.translationProviderService.CultureFormat;
  }

  public transform(value: number | string): string {
    return Intl.NumberFormat(this.currentCulture).format(+value);
  }
}
