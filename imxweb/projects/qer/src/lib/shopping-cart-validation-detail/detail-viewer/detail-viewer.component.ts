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

import { AfterViewInit, Component, ComponentRef, Input, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { ICartItemCheck } from 'imx-api-qer';
import { ShoppingCartValidationDetailService } from '../shopping-cart-validation-detail.service';

@Component({
  selector: 'imx-detail-viewer',
  templateUrl: './detail-viewer.component.html'
})
export class DetailViewerComponent implements AfterViewInit {
  @Input() public check: ICartItemCheck;
  @Input() public cartItemDisplay: string;
  @ViewChild('detailContainer', { read: ViewContainerRef }) public container: ViewContainerRef;

  constructor(private readonly detailService: ShoppingCartValidationDetailService) { }

  public ngAfterViewInit(): void {
    setTimeout(() => {
      if (this.check) {
        this.detailService.viewers.forEach(item => {
          if (item.id === this.check.Id) {
            const componentRef: ComponentRef<any> = this.container.createComponent(item.factory);

            if (componentRef) {
              componentRef.instance.check = this.check;
              componentRef.instance.cartItemDisplay = this.cartItemDisplay;
            }
          }
        });
      }
    });
  }
}
