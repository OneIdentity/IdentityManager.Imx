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

import { PortalCartitem } from '@imx-modules/imx-api-qer';
import { ExtendedEntityWrapper } from '../parameter-data/extended-entity-wrapper.interface';
import { RequestableProduct } from './requestable-product.interface';

/** Interface for handling the counting of all possible and all saved items */
export interface CartItemsCounter {
  possibleItems: number;
  savedItems: number;
}

/** Interface for hooks of the cartitem creation process. */
export interface ICartItemsExtensionService {
  /** Method that is called before the cart items are created. */
  OnBeforeCreateCartItems(products: RequestableProduct[]): Promise<RequestableProduct[]>;

  /** Method that is called after the cart items are created. */
  OnAfterCreateCartItem(
    product: RequestableProduct,
    cartItem: ExtendedEntityWrapper<PortalCartitem>,
  ): Promise<ExtendedEntityWrapper<PortalCartitem>>;
}
