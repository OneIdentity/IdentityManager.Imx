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

import { ErrorHandler, Injectable } from '@angular/core';
import { OverlayRef } from '@angular/cdk/overlay';
import { EuiLoadingService } from '@elemental-ui/core';

import {
  CollectionLoadParameters,
  EntityCollectionData,
  EntitySchema,
  ExtendedTypedEntityCollection,
} from 'imx-qbm-dbts';
import { PortalPersonAll, PortalPickcategory, PortalPickcategoryItems } from 'imx-api-qer';

import { QerApiService } from 'qer';
import { ClassloggerService, SnackBarService } from 'qbm';


@Injectable({
  providedIn: 'root'
})
export class PickCategoryService {

  private busyIndicator: OverlayRef;

  constructor(
    private readonly qerClient: QerApiService,
    private readonly busyService: EuiLoadingService,
    private readonly snackbar: SnackBarService,
    private readonly logger: ClassloggerService,
    private readonly errorHandler: ErrorHandler,
  ) { }

  public get pickcategorySchema(): EntitySchema {
    return this.qerClient.typedClient.PortalPickcategory.GetSchema();
  }

  public get pickcategoryItemsSchema(): EntitySchema {
    return this.qerClient.typedClient.PortalPickcategoryItems.GetSchema();
  }

  public async getPickCategories(navigationState: CollectionLoadParameters):
    Promise<ExtendedTypedEntityCollection<PortalPickcategory, unknown>> {
    return this.qerClient.typedClient.PortalPickcategory.Get(navigationState);
  }

  /**
   * Post the given {@link PortalPickcategory} to the server
   * @param pickCategory the pick category that should be posted
   * @returns the uid of the {@link PortalPickcategory}
   */
  public async postPickCategory(pickCategory: PortalPickcategory): Promise<string> {
    pickCategory = (await this.qerClient.typedClient.PortalPickcategory.Post(pickCategory))?.Data[0];
    return pickCategory.GetEntity()?.GetKeys()?.join(',');
  }

  public async deletePickCategories(pickCategories: PortalPickcategory[]): Promise<number> {
    let deletedObjects = 0;
    this.handleOpenLoader();
    try {
      deletedObjects = (await this.bulkDeletePickCategories(pickCategories)).length;
      if (deletedObjects > 0) {
        this.snackbar.open({
          key: '#LDS#{0} samples have been successfully deleted.',
          parameters: [deletedObjects]
        }, '#LDS#Close');
      }
    } finally {
      this.handleCloseLoader();
    }
    return deletedObjects;
  }

  public createPickCategory(): PortalPickcategory {
    return this.qerClient.typedClient.PortalPickcategory.createEntity();
  }

  public async getPickCategoryItems(uidQERPickCategory: string, navigationState: CollectionLoadParameters):
    Promise<ExtendedTypedEntityCollection<PortalPickcategoryItems, unknown>> {
    return this.qerClient.typedClient.PortalPickcategoryItems.Get(uidQERPickCategory, navigationState);
  }

  public async deletePickCategoryItems(uidPickCategory: string, pickCategoriesItems: PortalPickcategoryItems[])
    : Promise<EntityCollectionData[]> {
    return this.handlePromiseLoader(
      Promise.all(
        pickCategoriesItems.map(pickedItem =>
          this.qerClient.client.portal_pickcategory_items_delete(uidPickCategory, pickedItem.GetEntity().GetKeys().join(',')))
      )
    );
  }

  public async assignPickCategoryItems(uidPickCategory: string, pickCategoriesItems: PortalPickcategoryItems[]): Promise<number> {
    let assignedObjectsCounter = 0;
    try {
      await this.qerClient.client.portal_pickcategory_items_post(uidPickCategory, {
        Reload: true,
        Objects: pickCategoriesItems.map(item => item.EntityWriteDataSingle)
      });
      assignedObjectsCounter++;
      this.logger.trace(this, `${pickCategoriesItems.length} pick category items assigned`);
    } catch (error) {
      this.errorHandler.handleError(error);
      this.logger.trace(this, `no pick category items assigned`);
    }

    return assignedObjectsCounter;
  }

  public async deletePickedItems(uidPickCategory: string, selectedPickedItems: PortalPickcategoryItems[]): Promise<number> {
    let deletedObjects = 0;
    this.handleOpenLoader();
    try {
      deletedObjects = (await this.deletePickCategoryItems(uidPickCategory, selectedPickedItems)).length;
      if (deletedObjects > 0) {
        this.snackbar.open({
          key: '#LDS#{0} identities have been successfully removed.',
          parameters: [deletedObjects]
        }, '#LDS#Close');
      }
    } finally {
      this.handleCloseLoader();
    }
    return deletedObjects;
  }

  public async createPickedItems(selection: any, uidPickCategory: string, showResultInSnackbar: boolean = true): Promise<number> {

    const newAssignedObjects = (await this.handlePromiseLoader(
      Promise.all(
        selection.map(async (selectedItem: { XObjectKey: { value: string; }; }) => {
          const pickedItem = this.qerClient.typedClient.PortalPickcategoryItems.createEntity();
          pickedItem.UID_QERPickCategory.value = uidPickCategory;
          pickedItem.ObjectKeyItem.value = selectedItem.XObjectKey.value;
          await pickedItem.GetEntity().Commit(true);
        })
      )
    )).length;
    if (newAssignedObjects > 0 && showResultInSnackbar) {
      this.snackbar.open({
        key: '#LDS#{0} identities have been successfully assigned.',
        parameters: [newAssignedObjects]
      }, '#LDS#Close');
    }
    return newAssignedObjects;
  }

  public handleOpenLoader(): void {
    if (!this.busyIndicator) {
      setTimeout(() => this.busyIndicator = this.busyService.show());
    }
  }

  public handleCloseLoader(): void {
    if (this.busyIndicator) {
      setTimeout(() => {
        this.busyService.hide(this.busyIndicator);
        this.busyIndicator = undefined;
      });
    }
  }

  public async saveNewPickCategoryAndItems(pickCategory: PortalPickcategory, pickedItems: PortalPersonAll[]): Promise<void> {

    this.handleOpenLoader();
    try {
      const uidPickCategory = await this.postPickCategory(pickCategory);
      this.logger.debug(this, 'new pick category submitted');

      if (pickedItems && pickedItems.length > 0) {
        await this.createPickedItems(pickedItems, uidPickCategory, false);
      }

    } finally {
      this.handleCloseLoader();
    }

    this.snackbar.open({
      key: '#LDS#The sample has been successfully created.',
      parameters: [pickCategory.GetEntity().GetDisplay()]
    }, '#LDS#Close');

  }

  private async bulkDeletePickCategories(pickCategories: PortalPickcategory[]): Promise<EntityCollectionData[]> {
    return this.handlePromiseLoader(
      Promise.all(
        pickCategories.map(pickCategory => this.qerClient.client.portal_pickcategory_delete(pickCategory.GetEntity().GetKeys().join(',')))
      )
    );
  }

  private async handlePromiseLoader<T>(promise: Promise<T>): Promise<T> {
    const loaderRef = this.handleOpenLoader();
    return promise.finally(() => this.handleCloseLoader());
  }
}
