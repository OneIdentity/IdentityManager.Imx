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

import { Component, OnInit, ComponentFactoryResolver, ViewChild, Input } from '@angular/core';

import { CartItemLogicService } from './cart-item-logic.service';
import { ExtDirective, ClassloggerService } from 'qbm';
import { PortalCartitem } from 'imx-api-qer';

@Component({
    template: `<ng-template imxExtd></ng-template>`,
    selector: 'imx-cart-item-display'
})
export class CartItemDisplayComponent implements OnInit {
    @Input() public cartItem: PortalCartitem;

    @ViewChild(ExtDirective, { static: true }) public directive: ExtDirective;

    constructor(
        private componentFactoryResolver: ComponentFactoryResolver,
        private logger: ClassloggerService,
        private cartItemLogic: CartItemLogicService
    ) { }

    public ngOnInit(): void {
        const selectedProvider = this.cartItemLogic.getType(this.cartItem.DisplayType.value);
        this.logger.trace(this, 'Getting cart item display component for ', this.cartItem.DisplayType.value);
        if (selectedProvider) {
            this.directive.viewContainerRef.clear();
            const instance = this.directive.viewContainerRef
                .createComponent(this.componentFactoryResolver.resolveComponentFactory(selectedProvider));
            instance.instance.cartItem = this.cartItem;
        }
    }
}
