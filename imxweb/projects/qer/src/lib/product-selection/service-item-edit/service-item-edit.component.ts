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

import { Component, Inject } from '@angular/core';
import { EuiSidesheetRef, EUI_SIDESHEET_DATA } from '@elemental-ui/core';
import { TranslateService } from '@ngx-translate/core';

import { BulkItem, BulkItemStatus, ConfirmationService, LdsReplacePipe } from 'qbm';

@Component({
  selector: 'imx-service-item-edit',
  templateUrl: './service-item-edit.component.html',
  styleUrls: ['./service-item-edit.component.scss'],
})
export class ServiceItemEditComponent {
  public infoText =
    '#LDS#Specify additional information for the following products. For all other products, you do not have to specify any additional information.';

  constructor(
    @Inject(EUI_SIDESHEET_DATA) public readonly bulkItems: BulkItem[],
    private readonly confirmationService: ConfirmationService,
    private readonly ldsReplace: LdsReplacePipe,
    private readonly translate: TranslateService,
    private readonly sideSheetRef: EuiSidesheetRef
  ) {
    this.sideSheetRef.closeClicked().subscribe((__) => this.cancel());
  }

  public async close(): Promise<void> {
    const bulkItemsWithNoDecision = this.bulkItems.filter((bulkItem) => bulkItem.status === BulkItemStatus.unknown);
    if (bulkItemsWithNoDecision && bulkItemsWithNoDecision.length > 0) {
      const skipProductMessage =
        '#LDS#You have not specified additional information for one product. This is equivalent to skipping. Are you sure you do not want to add the product to your shopping cart?';
      const skipProductsMessage = this.ldsReplace.transform(
        await this.translate
          .get(
            '#LDS#You have not specified additional information for {0} products. This is equivalent to skipping. Are you sure you do not want to add the products to your shopping cart?'
          )
          .toPromise(),
        bulkItemsWithNoDecision.length
      );

      if (
        await this.confirmationService.confirm({
          Title: bulkItemsWithNoDecision.length > 1 ? '#LDS#Heading Skip Products' : '#LDS#Heading Skip Product',
          Message: bulkItemsWithNoDecision.length > 1 ? skipProductsMessage : skipProductMessage,
        })
      ) {
        return this.sideSheetRef.close(true);
      }
    }
    return this.sideSheetRef.close(true);
  }

  private async cancel(): Promise<void> {
    const cancel = await this.confirmationService.confirm({
      Title: '#LDS#Heading Cancel Request Process',
      Message: '#LDS#Are you sure you want to cancel the request process and not add the products to your shopping cart?',
    });

    if (cancel) {
      this.bulkItems.forEach((item) => (item.status = BulkItemStatus.skipped));
      return this.sideSheetRef.close(false);
    }
  }

  public hasBulkItemsWithDecision(): boolean {
    return this.bulkItems.filter((bulkItem) => bulkItem.status !== BulkItemStatus.unknown).length > 0;
  }
}
