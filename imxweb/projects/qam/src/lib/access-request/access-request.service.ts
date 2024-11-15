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

import { Injectable } from '@angular/core';
import { EuiLoadingService, EuiSidesheetService } from '@elemental-ui/core';
import { TranslateService } from '@ngx-translate/core';
import _ from 'lodash';

import { PortalCartitem } from '@imx-modules/imx-api-qer';
import { calculateSidesheetWidth } from 'qbm';
import { ExtendedEntityWrapper, ICartItemsExtensionService, RequestableProduct } from 'qer';
import { AccessRequestDataService } from './access-request-data.service';
import { AccessRequestSidesheetData } from './access-request-sidesheet-data.interface';
import { AccessRequestSidesheetComponent } from './access-request-sidesheet.component';

@Injectable({
  providedIn: 'root',
})
export class AccessRequestService implements ICartItemsExtensionService {
  private folders: string[] = [];

  // TODO #460645: replace UidAccProduct-workaround with if (requestable.DisplayType === 'DGEAccessRequest' )
  private fileSystemAccessUidAccProduct = 'QAM-4B31152BD53849CFBCEA4B27570BD947';

  constructor(
    private readonly accessRequestDataService: AccessRequestDataService,
    private readonly busyIndicator: EuiLoadingService,
    private readonly sidesheetService: EuiSidesheetService,
    private readonly translate: TranslateService,
  ) {}

  public async OnBeforeCreateCartItems(products: RequestableProduct[]): Promise<RequestableProduct[]> {
    this.folders = [];
    let requestableProducts: RequestableProduct[] = [];

    const entitySchema = this.accessRequestDataService.getSchema();
    const dataModel = await this.accessRequestDataService.getDataModel();

    const data: AccessRequestSidesheetData = {
      entitySchema,
      dataModel,
    };
    this.busyIndicator.hide();

    // TODO #460645: replace UidAccProduct-workaround with if (requestable.DisplayType === 'DGEAccessRequest' )
    const countFileSystemAccessProducts = products.filter((product) => product.UidAccProduct === this.fileSystemAccessUidAccProduct).length;

    if (countFileSystemAccessProducts > 0) {
      // the user should specify which folders he want to request
      data.uidAccProduct = this.fileSystemAccessUidAccProduct;
      this.folders = await this.sidesheetService
        .open(AccessRequestSidesheetComponent, {
          title: this.translate.instant('#LDS#Heading Requesting File System Access'),
          width: calculateSidesheetWidth(800, 0.5),
          disableClose: true,
          testId: 'access-request-sidesheet',
          padding: '0px',
          data,
        })
        .afterClosed()
        .toPromise();
    }
    for (const product of products) {
      if (product.UidAccProduct === this.fileSystemAccessUidAccProduct) {
        if (this.folders?.length > 0) {
          // create a product for each folder
          for (const folder of this.folders) {
            const requestable = _.cloneDeep(product);
            requestable.Folder = folder;
            requestableProducts.push(requestable);
          }
        }
      } else {
        requestableProducts.push(product);
      }
    }

    return requestableProducts;
  }

  public async OnAfterCreateCartItem(
    product: RequestableProduct,
    cartItem: ExtendedEntityWrapper<PortalCartitem>,
  ): Promise<ExtendedEntityWrapper<PortalCartitem>> {
    if ((product.Folder?.length ?? 0) > 0) {
      for (const parameterCategoryColumn of cartItem.parameterCategoryColumns) {
        if (parameterCategoryColumn.column.ColumnName === 'Resource') {
          parameterCategoryColumn.column.PutValue(product.Folder);
        }
        if (parameterCategoryColumn.column.ColumnName === 'Access') {
          parameterCategoryColumn.column.PutValue('Read');
        }
      }
    }
    return cartItem;
  }
}
