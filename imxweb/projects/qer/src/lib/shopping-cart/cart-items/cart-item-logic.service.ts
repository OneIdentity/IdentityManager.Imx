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

import { Injectable, Type } from '@angular/core';

import { DefaultCartItemDisplayComponent } from './default-cart-item-display.component';
import { CartItemLogic } from './cart-item-logic.interface';

/** This service provides logic and display components for specific types of cart items. */
@Injectable()
export class CartItemLogicService {
    private registry: { [id: string]: Type<CartItemLogic>; } = {};

    /** Returns the type of component to use for the specified key, or the default component. */
    public getType(key: string): Type<CartItemLogic> {
        return this.registry[key] || DefaultCartItemDisplayComponent;
    }

    /** Registers a new type */
    public register(key: string, svc: Type<CartItemLogic>): void {
        this.registry[key] = svc;
    }
}
