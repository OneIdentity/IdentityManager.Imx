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

import { ITShopConfig, PortalItshopPattern, PortalItshopPatternItem, PortalServicecategories, PortalShopServiceitems, V2ApiClientMethodFactory } from 'imx-api-qer';
import { MethodDefinition, MethodDescriptor } from 'imx-qbm-dbts';
import { AppConfigService, CdrFactoryService } from 'qbm';
import { QerApiService } from '../qer-api-client.service';

@Injectable({
  providedIn: 'root'
})
export class ImageService {
  private readonly methodFactory = new V2ApiClientMethodFactory();

  constructor(
    private readonly api: QerApiService,
    private readonly config: AppConfigService,
  ) { }

  /** Returns the URL to the image for the specified service item. */
  public getPath(item: PortalShopServiceitems | PortalServicecategories | PortalItshopPatternItem): string {
    const imageValue = item.ImageRef?.value ?? CdrFactoryService.tryGetColumn(item.GetEntity(), 'ImageRef')?.GetValue();
    const tokens = imageValue?.split('/');
    if (tokens?.length > 1) {
      let path: MethodDescriptor<any>;
      if (tokens[0] === 'category') {
        path = this.methodFactory.portal_shop_categoryimage_get(tokens[1]);
      } else if (tokens[0] === 'product') {
        path = this.methodFactory.portal_shop_serviceitemimage_get(tokens[1]);
      }

      if (path) {
        // parameterize path
        return this.config.BaseUrl + new MethodDefinition(path).path;
      }
    }
    return null;
  }

  /**
   * @deprecated Use getPath()
   */
  public async get(serviceItem: PortalShopServiceitems, config: ITShopConfig): Promise<Blob> {
    const tokens = serviceItem.ImageRef.value?.split('/');
    if (tokens?.length > 1) {
      if (tokens[0] === 'category') {
        if (config?.InheritCategoryImagesToCategories) {
          return this.api.client.portal_shop_categoryimage_get(tokens[1]);
        }
      } else if (tokens[0] === 'product') {
        if (config?.InheritCategoryImagesToItems) {
          return this.api.client.portal_shop_serviceitemimage_get(tokens[1]);
        }
      }
    }

    return null;
  }
}
