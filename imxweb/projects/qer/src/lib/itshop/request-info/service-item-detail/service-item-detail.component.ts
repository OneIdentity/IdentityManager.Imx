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

import { Component, Input, OnInit } from '@angular/core';
import { PortalShopServiceitems, QerProjectConfig } from 'imx-api-qer';
import { DisplayColumns } from 'imx-qbm-dbts';
import { ColumnDependentReference, BaseReadonlyCdr } from 'qbm';

@Component({
  selector: 'imx-service-item-detail',
  templateUrl: './service-item-detail.component.html',
  styleUrls: ['./service-item-detail.component.scss']
})
export class ServiceItemDetailComponent implements OnInit {
  @Input() public serviceItem: PortalShopServiceitems;
  @Input() public projectConfig: QerProjectConfig;

  public cdrList: ColumnDependentReference[] = [];

  public isRoleAssignment = true;

  constructor() { }

  public async ngOnInit(): Promise<void> {

    this.cdrList = [
      new BaseReadonlyCdr(this.serviceItem.GetEntity().GetColumn(DisplayColumns.DISPLAY_PROPERTYNAME)),
      new BaseReadonlyCdr(this.serviceItem.TableName.Column),
      new BaseReadonlyCdr(this.serviceItem.Tags.Column)
    ];

    const properties = this.projectConfig.ITShopConfig.AccProductProperties;
    this.cdrList = this.cdrList.concat(
      properties.map(prop => new BaseReadonlyCdr(this.serviceItem.GetEntity().GetColumn(prop))));
  }

}
