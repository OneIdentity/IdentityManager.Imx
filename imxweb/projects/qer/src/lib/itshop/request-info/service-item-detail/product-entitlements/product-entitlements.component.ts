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
 * Copyright 2022 One Identity LLC.
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

import { OverlayRef } from '@angular/cdk/overlay';
import { Component, Input, OnInit } from '@angular/core';
import { EuiLoadingService } from '@elemental-ui/core';
import { PortalShopServiceitemsEntitlements } from 'imx-api-qer';
import { CollectionLoadParameters, DbObjectKey, DisplayColumns, EntitySchema, IClientProperty, ValType } from 'imx-qbm-dbts';
import { DataSourceToolbarSettings, MetadataService } from 'qbm';
import { ProductDetailsService } from '../product-details.service';

@Component({
  selector: 'imx-product-entitlements',
  templateUrl: './product-entitlements.component.html',
  styleUrls: ['./product-entitlements.component.scss']
})
export class ProductEntitlementsComponent implements OnInit {

  public dstSettings: DataSourceToolbarSettings;
  public entitySchema: EntitySchema;
  public DisplayColumns = DisplayColumns;
  public showHelperAlert = true;
  public helperText = '#LDS#Here you can get an overview of the entitlements that are associated with the role. By requesting the role, the user will get the listed entitlements.';

  @Input() public uidAccProduct: string;
  public entitlementTypes: Map<string, string>;

  private displayColumns: IClientProperty[];

  constructor(
    private readonly busy: EuiLoadingService,
    private readonly metadata: MetadataService,
    private readonly detailsProvider: ProductDetailsService
  ) {
    this.entitySchema = detailsProvider.productEntitlementSchema;
    this.displayColumns = this.displayColumns = [
      {
        Type: ValType.String,
        ColumnName: 'entitlementDisplay'
      },
      this.entitySchema.Columns.TargetEntitlement
    ];
  }

  public async ngOnInit(): Promise<void> {
    await this.navigate();
  }

  public onHelperDismissed(): void {
    this.showHelperAlert = false;
  }

  public async search(search: string): Promise<void> {
    return this.navigate({ StartIndex: 0, search });
  }

  public async navigate(parameter?: CollectionLoadParameters): Promise<void> {
    let overlay: OverlayRef;
    setTimeout(() => { overlay = this.busy.show(); });
    try {
      const dataSource = await this.detailsProvider.getRoleEntitlements(this.uidAccProduct, parameter);

      this.entitlementTypes = new Map();

      dataSource.Data.forEach(async item => {
        this.entitlementTypes.set(item.GetEntity().GetKeys().toString(), await this.getTypeDescription(item));
      });

      this.dstSettings = {
        dataSource,
        entitySchema: this.entitySchema,
        navigationState: parameter,
        displayedColumns: this.displayColumns,
      };
    } finally {
      setTimeout(() => { this.busy.hide(overlay); });
    }

  }

  private async getTypeDescription(item: PortalShopServiceitemsEntitlements): Promise<string> {
    const objKey = DbObjectKey.FromXml(item.TargetEntitlement.value);
    const metadata = await this.metadata.GetTableMetadata(objKey.TableName);
    return metadata.DisplaySingular;
  }

}
