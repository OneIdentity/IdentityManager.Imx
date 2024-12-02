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

import { Injectable, Type } from '@angular/core';
import { ICartItemsExtensionService } from './cart-items.model';

/**
 * This service handles the registration and loading of {@link ICartItemsExtensionService | ICartItemsExtensionServices} as hooks of the * * cartitem creation process.
 * */
@Injectable({ providedIn: 'root' })
export class CartItemsExtensionService {
  private registry: { [id: string]: Type<ICartItemsExtensionService> } = {};

  /** Returns the CartItemsExtensionService to use for the specified key. */
  public get(key: string): Type<ICartItemsExtensionService> {
    return this.registry[key];
  }

  /** Registers a new CartItemsExtensionService. */
  public register(key: string, svc: Type<ICartItemsExtensionService>): void {
    this.registry[key] = svc;
  }
}
