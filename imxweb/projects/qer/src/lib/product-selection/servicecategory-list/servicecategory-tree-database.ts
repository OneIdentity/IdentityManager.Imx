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

import { EuiLoadingService } from '@elemental-ui/core';

import { TypedEntityCollectionData, IWriteValue, MultiValue, CollectionLoadParameters } from 'imx-qbm-dbts';
import { PortalShopCategories } from 'imx-api-qer';

import { TreeDatabase, SettingsService } from 'qbm';
import { ProductSelectionService } from '../product-selection.service';
import { TreeNodeResultParameter } from 'qbm';

/** Provider of servicecategory-data for the imx-data-tree */
export class ServicecategoryTreeDatabase extends TreeDatabase {

  /** the comma-separated list of recipients of this request */
  public recipients: IWriteValue<string>;

  constructor(
    private readonly loadingServiceElemental: EuiLoadingService,
    private readonly settingsService: SettingsService,
    private productSelectionService: ProductSelectionService
  ) {
    super();
    this.canSearch = true;
  }

  public async getData(showLoading: boolean, parameters: CollectionLoadParameters = {})
    : Promise<TreeNodeResultParameter> {
    let entities: TreeNodeResultParameter;
    if (showLoading) {
      setTimeout(() => this.loadingServiceElemental.show());
    }
    let serviceCategories: TypedEntityCollectionData<PortalShopCategories>;
    try {

      const recipients = MultiValue.FromString(this.recipients?.value).GetValues();
      const navigationState = { PageSize: this.settingsService.DefaultPageSize, StartIndex: 0 };
      const opts = {
        ...navigationState,
        ...parameters,
        UID_Person: recipients.length === 1 ? recipients[0] : undefined,
        UID_AccProductGroupParent: parameters.ParentKey
      };

      serviceCategories = await this.productSelectionService.getServiceCategories(opts);
      entities = {
        entities: serviceCategories.Data.map(element => element.GetEntity()),
        canLoadMore: opts.StartIndex + opts.PageSize < serviceCategories.totalCount, totalCount: serviceCategories.totalCount
      };
    } finally {
      if (showLoading) {
        setTimeout(() => this.loadingServiceElemental.hide());
      }
    }
    return entities;
  }
}
