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
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

import { ApiClientService } from 'qbm';
import { QerApiService } from 'qer';

@Injectable({
  providedIn: 'root'
})
export class ImageService {
  constructor(
    private readonly qerClient: QerApiService,
    private readonly sanitizer: DomSanitizer,
    private readonly apiProvider: ApiClientService) { }

  /**
   * Gets the person image URL converted to a SafeUrl
   */
  public async getPersonImageUrl(uid: string): Promise<SafeUrl> {
    if (uid && uid.length > 0) {
      const imageData = await this.apiProvider.request(() => this.qerClient.client.portal_person_image_get(uid));

      if (imageData != null && imageData.size > 0 && ['image/png', 'image/jpeg', 'image/gif'].includes(imageData.type)) {
        return this.sanitizer.bypassSecurityTrustUrl(URL.createObjectURL(imageData));
      }
    }

    return undefined;
  }
}
