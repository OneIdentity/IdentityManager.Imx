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

import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TableImageService {
  private readonly cssPrefix = 'imx-table-';
  private readonly defaultCssPrefix = `${this.cssPrefix}QBM-1650955B496E4A3E959A46569B0F7D85`;
  private readonly cssLargeSuffix = '-large';

  public getCss(imgId: string, largeImg: boolean = false): string {
    if (imgId == null) {
      return '';
    }

    const cssClass = `${this.cssPrefix}${imgId}`;

    return (largeImg ? `${cssClass}${this.cssLargeSuffix}` : cssClass);
  }

  public getDefaultCss(largeImg: boolean = false): string {
    return (largeImg ? `${this.defaultCssPrefix}${this.cssLargeSuffix}` : this.defaultCssPrefix);
  }

}

