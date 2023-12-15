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

import {
  PortalItshopPatternItem,
  PortalItshopPatternRequestable,
  PortalItshopPeergroupMemberships,
  PortalShopServiceitems,
} from 'imx-api-qer';
import { TypedEntity } from 'imx-qbm-dbts';

/**
 * The type of the selected item
 */
export enum SelectedProductType {
  ServiceItem,
  PeergroupMemebership,
  PatternItem,
  Any,
  Undefined,
}

export enum SelectedProductSource {
  AllProducts = '#LDS#Service category',
  PeerGroupProducts = '#LDS#Recommendations/peer group (products)',
  PeerGroupOrgs = '#LDS#Recommendations/peer group (organizational structures)',
  ReferenceUserProducts = '#LDS#Reference user (products)',
  ReferenceUserOrgs = '#LDS#Reference user (organizational structures)',
  ProductBundles = '#LDS#Product bundle',
  Undefined = '#LDS#Undefined',
}

/**
 * Represents a selected item
 */
export interface SelectedProductItem {
  /**
   * The (typed) entity
   */
  item: TypedEntity;

  /**
   * The type of the  item
   */
  type: SelectedProductType;

  source?: SelectedProductSource;

  /**
   * The product bundle of the item.
   * Always null unless the item is a PortalItshopPatternItem
   */
  bundle?: PortalItshopPatternRequestable;
  product?: string;
  productSource?: string;
  description?: string;
}

export function GetSelectedProductType(item: TypedEntity): SelectedProductType {
  if (item instanceof PortalShopServiceitems) {
    return SelectedProductType.ServiceItem;
  } else if (item instanceof PortalItshopPeergroupMemberships) {
    return SelectedProductType.PeergroupMemebership;
  } else if (item instanceof PortalItshopPatternItem) {
    return SelectedProductType.PatternItem;
  } else {
    return SelectedProductType.Undefined;
  }
}
