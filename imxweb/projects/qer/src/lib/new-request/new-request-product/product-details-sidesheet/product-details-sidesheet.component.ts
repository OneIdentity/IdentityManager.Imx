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

import { Component, Inject, OnInit } from '@angular/core';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { EUI_SIDESHEET_DATA } from '@elemental-ui/core';
import { PortalServiceitems } from 'imx-api-qer';

@Component({
  selector: 'imx-product-details-sidesheet',
  templateUrl: './product-details-sidesheet.component.html',
  styleUrls: ['./product-details-sidesheet.component.scss']
})
export class ProductDetailsSidesheetComponent implements OnInit {
  public hasEntitlements: boolean;
  public onEntitlements = false;

  constructor(
    @Inject(EUI_SIDESHEET_DATA) public data: {
      item: PortalServiceitems,
      orderStatus: {
        statusIcon: string,
        statusDisplay: string
      } | null,
      imageUrl: string
    },
  ) { }

  public ngOnInit(): void {
    this.hasEntitlements = ['ESet', 'QERAssign'].includes(this.getValue('TableName'));
  }

  public getValue(column: string): string {
    const value: string = this.data.item.GetEntity().GetColumn(column).GetValue();
    return value;
  }

  public getDisplay(column: string): string {
    const value: string = this.data.item.GetEntity().GetColumn(column).GetDisplayValue();
    return value;
  }

  public onTabChange(change: MatTabChangeEvent) {
    this.onEntitlements = change.index === 1;
  }

}
