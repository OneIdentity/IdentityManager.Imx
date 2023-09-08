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

import { ErrorHandler } from '@angular/core';
import { Injectable } from '@angular/core';
import { EuiLoadingService, EuiSidesheetService } from '@elemental-ui/core';
import { TranslateService } from '@ngx-translate/core';

import { ClassloggerService, SnackBarService } from 'qbm';
import { ServiceItemsService } from '../../service-items/service-items.service';
import { UserModelService } from '../../user/user-model.service';
import { CartItemsService } from '../cart-items.service';
import { CartItemCloneParameters } from './cart-item-clone-parameters.interface';
import { OrderForAdditionalUsersComponent } from './order-for-additional-users.component';

@Injectable({
  providedIn: 'root'
})
export class CartItemCloneService {
  constructor(
    private readonly sidesheet: EuiSidesheetService,
    private readonly translate: TranslateService,
    private readonly logger: ClassloggerService,
    private readonly busyService: EuiLoadingService,
    private readonly serviceItems: ServiceItemsService,
    private readonly cartItems: CartItemsService,
    private readonly snackBar: SnackBarService,
    private readonly errorHandler: ErrorHandler,
    private readonly userModel: UserModelService
  ) { }

  public async cloneItemForPersons(item: CartItemCloneParameters): Promise<void> {
    const sideSheetRef = this.sidesheet.open(OrderForAdditionalUsersComponent,
      {
        title: await this.translate.get('#LDS#Heading Request for Multiple Identities').toPromise(),
        subTitle: item.accProduct.DisplayValue,
        width: '750px',
        testId: 'request-for-multiple-identities-sidesheet',
        data: {
          fkData: {
            displayValue: '',
            fkRelations: item.personOrderedFkRelations,
            isMultiValue: true
          },
          display: item.accProduct.DisplayValue
        }
      });

    const selection = await sideSheetRef.afterClosed().toPromise();

    if (selection) {
      this.logger.debug(this, 'try to clone items for additional users...');
      const persons = selection.map(candidate => ({
        DataValue: candidate.GetEntity().GetKeys()[0],
        DisplayValue: candidate.GetEntity().GetDisplay()
      }));
      setTimeout(() => this.busyService.show());
      try {
        const serviceItem = await this.serviceItems.getServiceItem(item.accProduct.DataValue);
        const serviceItemForPersons = this.serviceItems.getServiceItemsForPersons(
          [serviceItem],
          persons,
          {
            uidITShopOrg: item.uidITShopOrg
          }
        );

        if (serviceItemForPersons && serviceItemForPersons.length > 0) {
          const savedItems = await this.cartItems.addItems(serviceItemForPersons);

          if (savedItems) {
            this.snackBar.open(
              {
                key: '#LDS#The product "{0}" has been added to the shopping cart for {1} additional recipients.',
                parameters: [
                  item.display,
                  persons.length
                ]
              },
              '#LDS#Close'
            );
          }
        } else {
          this.snackBar.open(
            {
              key: '#LDS#You have canceled the action.',
              parameters: [item.display]
            },
            '#LDS#Close'
          );
        }
      } catch (error) {
        this.errorHandler.handleError(error);
      } finally {
        await this.userModel.reloadPendingItems();
        setTimeout(() => this.busyService.hide());
        /*
        *  TODO later:  UID_ShoppingCartOrder, OrderDetai1l, OrderDetail2 übernehmen von CartItem
        */
      }
    }
  }
}
