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
import { PortalShopServiceitemsEntitlements } from 'imx-api-qer';
import { CollectionLoadParameters, DbObjectKey, DisplayColumns, EntitySchema, IClientProperty, ValType } from 'imx-qbm-dbts';
import { ClientPropertyForTableColumns, DataSourceToolbarSettings, MetadataService } from 'qbm';
import { ProductEntitlementApiService } from './product-entitlement-api.service';

@Component({
  selector: 'imx-product-entitlements',
  templateUrl: './product-entitlements.component.html',
  styleUrls: ['./product-entitlements.component.scss'],
})
export class ProductEntitlementsComponent implements OnInit {
  @Input() public uidAccProduct: string;

  public dstSettings: DataSourceToolbarSettings;
  public entitySchema: EntitySchema;
  public DisplayColumns = DisplayColumns;
  public isLoading: boolean;

  public entitlementTypes: Map<string, string>;
  private displayColumns: ClientPropertyForTableColumns[];

  constructor(private readonly entitlementApi: ProductEntitlementApiService, private readonly metadata: MetadataService) {
    this.entitySchema = entitlementApi.productEntitlementSchema;
    this.displayColumns = this.displayColumns = [
      {
        Type: ValType.String,
        ColumnName: 'entitlementDisplay',
        Display: this.entitySchema.Columns[DisplayColumns.DISPLAY_PROPERTYNAME].Display,
      },
      this.entitySchema.Columns.TargetEntitlement,
    ];
  }

  public ngOnInit(): void {
    setTimeout(async () => await this.navigate());
  }

  public async navigate(parameter?: CollectionLoadParameters): Promise<void> {
    this.isLoading = true;
    try {
      const dataSource = await this.entitlementApi.getRoleEntitlements(this.uidAccProduct, parameter);

      this.entitlementTypes = new Map();

      dataSource.Data.forEach(async (item) => {
        this.entitlementTypes.set(item.GetEntity().GetKeys().toString(), await this.getTypeDescription(item));
      });

      this.dstSettings = {
        dataSource,
        entitySchema: this.entitySchema,
        navigationState: parameter
          ? parameter
          : {
              StartIndex: 0,
              PageSize: 20,
            },
        displayedColumns: this.displayColumns,
      };
    } finally {
      this.isLoading = false;
    }
  }

  private async getTypeDescription(item: PortalShopServiceitemsEntitlements): Promise<string> {
    const objKey = DbObjectKey.FromXml(item.TargetEntitlement.value);
    const metadata = await this.metadata.GetTableMetadata(objKey.TableName);
    return metadata.DisplaySingular;
  }
}
