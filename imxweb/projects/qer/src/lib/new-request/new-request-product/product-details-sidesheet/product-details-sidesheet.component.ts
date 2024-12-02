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

import { Clipboard } from '@angular/cdk/clipboard';
import { Component, Inject, OnInit } from '@angular/core';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { Router } from '@angular/router';
import { EUI_SIDESHEET_DATA } from '@elemental-ui/core';
import { PortalServiceitems, QerProjectConfig } from '@imx-modules/imx-api-qer';
import { TranslateService } from '@ngx-translate/core';
import { LdsReplacePipe, SnackBarService } from 'qbm';
import { NEW_REQUEST_ROUTE } from '../../constants';

@Component({
  selector: 'imx-product-details-sidesheet',
  templateUrl: './product-details-sidesheet.component.html',
  styleUrls: ['./product-details-sidesheet.component.scss'],
})
export class ProductDetailsSidesheetComponent implements OnInit {
  public hasEntitlements: boolean;
  public onEntitlements = false;

  /**
   * A list of AccProduct properties, that can be customized in the Admin Portal:
   * ServerConfig/ITShopConfig/AccProductProperties
   */
  protected accProductProperties: string[] = [];

  /** A list of properties, that cannot be customized in the Admin Portal. */
  protected fixedProductProperties = ['ServiceCategoryFullPath', 'TableName', 'Tags'];

  protected ldsEntitlementInfo =
    '#LDS#Here you can get an overview of the entitlements associated with the product. If you request the product, the recipient will get the listed entitlements.';

  /** A mapping between properties/columns and a css class to visualize the property value. */
  private cssPropertyMapping = new Map<string, string>([
    ['ServiceCategoryFullPath', 'link'],
    ['TableName', 'bold'],
    ['Tags', 'bold'],
    ['ArticleCode', 'bold'],
  ]);

  constructor(
    @Inject(EUI_SIDESHEET_DATA)
    public data: {
      item: PortalServiceitems;
      orderStatus: {
        statusIcon: string;
        statusDisplay: string;
      } | null;
      imageUrl: string;
      projectConfig: QerProjectConfig;
    },
    private snackbar: SnackBarService,
    private translate: TranslateService,
    private ldsReplace: LdsReplacePipe,
    private clipboard: Clipboard,
    private route: Router,
  ) {}

  public ngOnInit(): void {
    this.hasEntitlements = ['ESet', 'QERAssign'].includes(this.getValue('TableName'));
    this.accProductProperties = this.data?.projectConfig?.ITShopConfig?.AccProductProperties ?? [];
  }

  public onTabChange(change: MatTabChangeEvent) {
    this.onEntitlements = change.index === 1;
  }

  /** Returns the display value for the given property/column. */
  public getDisplay(column: string): string {
    const value: string = this.data.item.GetEntity().GetColumn(column).GetDisplayValue();
    return value;
  }

  /** Returns the caption for the given property/column. */
  protected getCaption(column: string): string {
    return this.data.item.GetEntity().GetColumn(column).GetMetadata().GetDisplay();
  }

  /** Returns a special css class for the given property/column.  */
  protected getCssClass(column: string): string {
    return this.cssPropertyMapping.get(column) ?? '';
  }

  private getValue(column: string): string {
    const value: string = this.data.item.GetEntity().GetColumn(column).GetValue();
    return value;
  }

  /**
   * Display a snackbar with copied url to clipboard
   */
  public copyUrl(): void {
    const url = this.createUrl();
    this.clipboard.copy(url);
    this.snackbar.open(
      {
        key: this.ldsReplace.transform(this.translate.instant('#LDS#The following product URL has been successfully copied to your clipboard: {0}'), url),
      },
      '#LDS#Close',
      { duration: 3000 },
    );
  }

  /**
   * Uses the window location and module route head to get the platform origin, combines that with the relative serialized url from the router
   */
  private createUrl(): string {
    const domain = window.location.href.split('/' + NEW_REQUEST_ROUTE)[0];
    const tree = this.route.parseUrl(this.route.url);
    tree.queryParams = {
      ...tree.queryParams,
      serviceItem: this.data.item.GetEntity().GetKeys().join(','),
    };
    return [domain, this.route.serializeUrl(tree)].join('');
  }
}
