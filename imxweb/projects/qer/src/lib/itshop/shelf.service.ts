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

import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { EuiLoadingService, EuiSidesheetService } from '@elemental-ui/core';
import { OverlayRef } from '@angular/cdk/overlay';

import { ClassloggerService, MessageDialogComponent } from 'qbm';
import { RequestableProductForPerson, ServiceItemForPerson } from 'imx-api-qer';
import { ShelfSelectionComponent } from './shelf-selection.component';
import { QerApiService } from '../qer-api-client.service';
import { NonRequestableItemsComponent } from './non-requestable-items/non-requestable-items.component';
import { PersonForProduct, ShelfObject, ShelfSelectionObject } from './shelf-selection-sidesheet.model';
import _ from 'lodash';

@Injectable({
  providedIn: 'root',
})
export class ShelfService {
  constructor(
    private readonly sideSheet: EuiSidesheetService,
    private readonly qerClient: QerApiService,
    private readonly logger: ClassloggerService,
    private readonly dialogService: MatDialog,
    private readonly translate: TranslateService,
    private readonly busyService: EuiLoadingService
  ) {}

  public async setShops(requestableServiceItemsForPersons: RequestableProductForPerson[]): Promise<boolean> {
    const requestableServiceItemsForPersonsInShops = await this.findUniqueProductsInShops(requestableServiceItemsForPersons);

    this.logger.debug(this, 'items from server', requestableServiceItemsForPersonsInShops);

    if (requestableServiceItemsForPersonsInShops.length === 0) {
      const dialogRef = this.dialogService.open(MessageDialogComponent, {
        data: {
          ShowOk: true,
          Title: await this.translate.get('#LDS#Heading Products Cannot Be Requested').toPromise(),
          Message: await this.translate.get('#LDS#None of the selected products can be requested for the selected identities.').toPromise(),
        },
        panelClass: 'imx-messageDialog',
      });
      await dialogRef.beforeClosed().toPromise();
      return false;
    }
    // preset unique elements
    this.presetUnique(requestableServiceItemsForPersons, requestableServiceItemsForPersonsInShops);

    if (requestableServiceItemsForPersons.every((elem) => elem.UidITShopOrg != null)) {
      return true;
    } else {
      const data = this.buildShelfSelection(requestableServiceItemsForPersons, requestableServiceItemsForPersonsInShops);

      await this.showNotRequestableProducts(data);

      const requested = requestableServiceItemsForPersons.filter((elem) =>
        data.some(
          (shelf) =>
            elem.UidAccProduct === shelf.uidAccproduct &&
            shelf.personsForProduct.find((person) => person.uidPerson === elem.UidPerson)?.shelfsObjects.length > 0
        )
      );

      if (!(await this.setElementsWithSideSheet(requested, data))) {
        return false;
      }
    }
    this.logger.trace(this, requestableServiceItemsForPersons);

    return true;
  }

  private async showNotRequestableProducts(ssos: ShelfSelectionObject[]): Promise<void> {
    const nonRequestableProductsForPersons: RequestableProductForPerson[] = [];

    if (ssos.length === 0) {
    } else {
      ssos.forEach((sso) =>
        sso.personsForProduct.forEach((person) => {
          if (person.shelfsObjects.length === 0) {
            nonRequestableProductsForPersons.push({
              UidITShopOrg: '',
              Display: sso.displayAccProduct,
              DisplayRecipient: person.displayPerson,
            });
          }
        })
      );
    }

    if (nonRequestableProductsForPersons.length > 0) {
      const dialogRef = this.dialogService.open(NonRequestableItemsComponent, {
        data: {
          nonRequestableProductsForPersons,
        },
      });

      await dialogRef.beforeClosed().toPromise();
    }
  }

  private async setElementsWithSideSheet(requested: RequestableProductForPerson[], ssos: ShelfSelectionObject[]): Promise<boolean> {
    if (ssos.every((sso) => sso.personsForProduct.every((person) => person.shelfsObjects.length < 2))) {
      return true;
    }

    // TODO TASK 321664: This is only a temporary fix to choose to all items with the same uid, regardless of if they are optional or not.
    ssos.forEach((item) => {
      item.personsForProduct = _.uniqWith(item.personsForProduct, _.isEqual);
    });

    // show side sheet for multishelf objects
    const sidesheetRef = this.sideSheet.open(ShelfSelectionComponent, {
      title: await this.translate.get('#LDS#Heading Select Shelf').toPromise(),
      padding: '0px',
      width: 'max(500px, 50%)',
      testId: 'shelf-selection-sidesheet',
      data: ssos,
    });
    const sidesheetResult: ShelfSelectionObject[] = await sidesheetRef.afterClosed().toPromise();
    if (!sidesheetResult) {
      return false;
    }
    sidesheetResult.forEach((requestedProduct) =>
      requestedProduct.personsForProduct.forEach((person) => {
        // TODO TASK 321664: This is only a temporary fix to choose to all items with the same uid, regardless of if they are optional or not.
        const items = requested.filter(
          (elem) =>
            elem.UidAccProduct === requestedProduct.uidAccproduct && elem.UidPerson === person.uidPerson && person.shelfsObjects.length > 0
        );
        items.forEach((item) => {
          item.UidITShopOrg = person.uidItShopOrg;
        });
        // const item = requested.find(elem =>
        //   elem.UidAccProduct === requestedProduct.uidAccproduct && elem.UidPerson === person.uidPerson);
        // item.UidITShopOrg = person.uidItShopOrg;
      })
    );
    return true;
  }

  private presetUnique(requested: RequestableProductForPerson[], productsWithShops: RequestableProductForPerson[]): void {
    // Here we set any unique products with a unique shelf, unique is defined as only one UID for AccProduct, Person
    for (const serviceItemForPerson of requested.filter((elem) => elem.UidITShopOrg == null || elem.UidITShopOrg === '')) {
      const possibleRequestableServiceItems = productsWithShops.filter(
        (item) => item.UidAccProduct === serviceItemForPerson.UidAccProduct && item.UidPerson === serviceItemForPerson.UidPerson
      );
      if (possibleRequestableServiceItems.length === 1) {
        serviceItemForPerson.UidITShopOrg = possibleRequestableServiceItems[0].UidITShopOrg;
        this.logger.debug(this, 'service item associated with shelf', serviceItemForPerson);
      }
    }
  }

  private hasMultipleShelfs(shelfSelectionObject: ShelfSelectionObject): boolean {
    return shelfSelectionObject.personsForProduct.some((person) => person.shelfsObjects.length !== 1);
  }

  private buildShelfSelection(
    requested: RequestableProductForPerson[],
    productsWithShops: RequestableProductForPerson[]
  ): ShelfSelectionObject[] {
    // Build the shelf selection object to then ask the user to set values on
    return requested
      .map((elem) => ({ display: elem.Display, uid: elem.UidAccProduct }))
      .filter(this.uniqueProducts)
      .map((elem) => ({
        uidAccproduct: elem.uid,
        displayAccProduct: elem.display,
        personsForProduct: this.getPersonsForProduct(requested, productsWithShops, elem.uid),
        possibleShelfObjects: this.getPossibleShelfs(productsWithShops, elem.uid),
      }))
      .filter((elem) => this.hasMultipleShelfs(elem))
      .sort((a, b) => a.displayAccProduct.localeCompare(b.displayAccProduct));
  }

  private getPersonsForProduct(
    requested: RequestableProductForPerson[],
    productsWithShops: RequestableProductForPerson[],
    uid: string
  ): PersonForProduct[] {
    const elements = requested.filter((elem) => elem.UidAccProduct === uid);
    return elements
      .map((elem) => ({
        uidPerson: elem.UidPerson,
        uidItShopOrg: this.tryGetItShop(productsWithShops, uid, elem.UidPerson),
        displayPerson: elem.DisplayRecipient,
        shelfsObjects: this.getShelfObjects(productsWithShops, uid, elem.UidPerson),
      }))
      .sort((a, b) => a.displayPerson.localeCompare(b.displayPerson));
  }

  private getPossibleShelfs(productsWithShops: RequestableProductForPerson[], uid: string): ShelfObject[] {
    const elements = productsWithShops.filter((elem) => elem.UidAccProduct === uid);
    return elements
      .map((elem) => ({
        uidItShopOrg: elem.UidITShopOrg,
        displayShelf: elem.Display,
      }))
      .filter(this.uniqueShelfs);
  }

  private uniqueProducts(value: { display: string; uid: string }, index: number, self: { display: string; uid: string }[]): boolean {
    return self.findIndex((elem) => value.uid === elem.uid) === index;
  }

  private tryGetItShop(productsWithShops: RequestableProductForPerson[], uidAcc: string, uidPerson: string): string {
    const shelf = productsWithShops.filter((elem) => elem.UidAccProduct === uidAcc && elem.UidPerson === uidPerson);
    return shelf.length === 1 ? shelf[0].UidITShopOrg : '';
  }

  private getShelfObjects(productsWithShops: RequestableProductForPerson[], uidAcc: string, uidPerson: string): ShelfObject[] {
    return productsWithShops
      .filter((elem) => elem.UidAccProduct === uidAcc && elem.UidPerson === uidPerson)
      .map((elem) => ({ displayShelf: elem.Display, uidItShopOrg: elem.UidITShopOrg }));
  }

  private uniqueShelfs(shelf: ShelfObject, index: number, self: ShelfObject[]): boolean {
    return self.findIndex((elem) => shelf.uidItShopOrg === elem.uidItShopOrg) === index;
  }

  private async findUniqueProductsInShops(serviceItemsForPersons: ServiceItemForPerson[]): Promise<RequestableProductForPerson[]> {
    // Get all unique products within the itshop
    let products: RequestableProductForPerson[];
    let overlay: OverlayRef;
    setTimeout(() => (overlay = this.busyService.show()));
    try {
      products = await this.qerClient.client.portal_itshop_findproducts_post(serviceItemsForPersons);
      products = _.uniqWith(products, _.isEqual);
    } finally {
      setTimeout(() => this.busyService.hide(overlay));
    }
    return products;
  }
}
