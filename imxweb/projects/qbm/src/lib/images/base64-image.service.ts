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
import { SafeUrl } from '@angular/platform-browser';
import { IWriteValue } from 'imx-qbm-dbts';

@Injectable({
  providedIn: 'root'
})
export class Base64ImageService {
  private readonly base64DataUrl = 'data:image/png;base64,';

  /**
   * Returns the image data without the base64-dataurl-prefix
   * @param url the corresponding url
   */
  public getImageData(url: string): string {
    return url ? url.replace(this.base64DataUrl, '') : '';
  }

  /**
   * Returns the url with the base64-dataurl-prefix for the given {@link IWriteValue|imageProperty}
   * @param imageProperty the corresponding {@link IWriteValue|imageProperty}
   * @returns the base64-imageUrl of the image
   */
  public getImageUrl(imageProperty: IWriteValue<string>): SafeUrl {
    return this.addBase64Prefix(imageProperty.value);
  }

  /**
   * Returns the url with the base64-dataurl-prefix for the given {@link string|imageValue}
   * @param imageValue the corresponding {@link string|imageValue}
   * @returns the base64-imageUrl of the image
   */
  public addBase64Prefix(imageValue: string): SafeUrl {
    if (imageValue && imageValue.length > 0) {
      return (!imageValue.startsWith(this.base64DataUrl) ? this.base64DataUrl : '') + imageValue;
    }

    return '';
  }
}
