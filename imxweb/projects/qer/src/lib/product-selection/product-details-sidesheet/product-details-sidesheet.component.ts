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
import { EUI_SIDESHEET_DATA } from '@elemental-ui/core';

import { PortalShopServiceitems, QerProjectConfig } from 'imx-api-qer';
import { DisplayColumns } from 'imx-qbm-dbts';
import { BaseReadonlyCdr, ColumnDependentReference } from 'qbm';

@Component({
  selector: 'imx-product-details-sidesheet',
  templateUrl: './product-details-sidesheet.component.html',
  styleUrls: ['./product-details-sidesheet.component.scss']
})
export class ProductDetailsSidesheetComponent implements OnInit {

  public cdrList: ColumnDependentReference[] = [];

  public isRoleAssignment = true;

  constructor(
    @Inject(EUI_SIDESHEET_DATA) public data: {
      item: PortalShopServiceitems,
      projectConfig: QerProjectConfig
    }
  ) {
    this.isRoleAssignment = ['ESet', 'QERAssign'].includes(data.item.TableName.value);
  }

  public async ngOnInit(): Promise<void> {

    this.cdrList = [
      new BaseReadonlyCdr(this.data.item.GetEntity().GetColumn(DisplayColumns.DISPLAY_PROPERTYNAME)),
      new BaseReadonlyCdr(this.data.item.TableName.Column),
      new BaseReadonlyCdr(this.data.item.Tags.Column)
    ];

    const properties = this.data.projectConfig.ITShopConfig.AccProductProperties;
    this.cdrList = this.cdrList.concat(
      properties.map(prop => new BaseReadonlyCdr(this.data.item.GetEntity().GetColumn(prop))));
  }

}
