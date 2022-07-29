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
import { ErrorHandler, Injectable } from '@angular/core';
import { EuiLoadingService } from '@elemental-ui/core';

import { PortalItshopPatternAdmin, PortalItshopPatternItem, PortalItshopPatternPrivate } from 'imx-api-qer';
import { CollectionLoadParameters, CompareOperator, EntitySchema, ExtendedTypedEntityCollection, FilterType } from 'imx-qbm-dbts';

import { ClassloggerService, SnackBarService } from 'qbm';
import { QerApiService } from '../qer-api-client.service';

@Injectable({
  providedIn: 'root'
})
export class ItshopPatternService {

  private busyIndicator: OverlayRef;
  private busyIndicatorCounter = 0;

  constructor(
    private readonly qerClient: QerApiService,
    private readonly logger: ClassloggerService,
    private readonly busyService: EuiLoadingService,
    private readonly errorHandler: ErrorHandler,
    private readonly snackBar: SnackBarService) { }

  public get itshopPatternAdminSchema(): EntitySchema {
    return this.qerClient.typedClient.PortalItshopPatternAdmin.GetSchema();
  }

  public get itshopPatternPrivateSchema(): EntitySchema {
    return this.qerClient.typedClient.PortalItshopPatternPrivate.GetSchema();
  }

  public get itshopPatternItemSchema(): EntitySchema {
    return this.qerClient.typedClient.PortalItshopPatternItem.GetSchema();
  }


  /**
   * Retrieves all private itshop patterns of a person.
   *
   * @returns A list of {@link PortalItshopPatternPrivate} entities.
   */
  public async getPrivatePatterns(navigationState?: CollectionLoadParameters):
    Promise<ExtendedTypedEntityCollection<PortalItshopPatternPrivate, unknown>> {
    this.logger.debug(this, `Retrieving private itshop patterns`);
    this.logger.trace('Navigation state', navigationState);
    return this.qerClient.typedClient.PortalItshopPatternPrivate.Get(navigationState);
  }

  /**
   * Retrieves a private itshop patterns for a given UID_ShoppingCartPattern
   *
   * @returns Details of {@link PortalItshopPatternPrivate} entity.
   */
  public async getPrivatePattern(id: string): Promise<PortalItshopPatternPrivate> {
    const filteredState: CollectionLoadParameters = {
      filter: [
        {
          ColumnName: 'UID_ShoppingCartPattern',
          Type: FilterType.Compare,
          CompareOp: CompareOperator.Equal,
          Value1: id,
        },
      ],
    };
    this.logger.debug(this, `Retrieving private pattern with Id ${id}`);
    return (await this.qerClient.typedClient.PortalItshopPatternPrivate.Get(filteredState)).Data[0];
  }

  /**
   * Retrieves all {@link PortalItshopPatternItem | PortalItshopPatternItems}.
   *
   * @returns A list of {@link PortalItshopPatternAdmin} entities.
   */
  public async getPatternItems(navigationState?: CollectionLoadParameters):
    Promise<ExtendedTypedEntityCollection<PortalItshopPatternItem, unknown>> {
    this.logger.debug(this, `Retrieving public itshop patterns`);
    this.logger.trace('Navigation state', navigationState);
    return this.qerClient.typedClient.PortalItshopPatternItem.Get(navigationState);
  }

  /**
   * Retrieves all public itshop patterns.
   *
   * @returns A list of {@link PortalItshopPatternAdmin} entities.
   */
  public async getPublicPatterns(navigationState?: CollectionLoadParameters):
    Promise<ExtendedTypedEntityCollection<PortalItshopPatternAdmin, unknown>> {
    this.logger.debug(this, `Retrieving public itshop patterns`);
    this.logger.trace('Navigation state', navigationState);
    return this.qerClient.typedClient.PortalItshopPatternAdmin.Get(navigationState);
  }

  /**
   * Create a private copy of an existing {@link PortalItshopPatternPrivate} on the server
   * @param uid the uid of itshop pattern that should be copy
   * @returns the copy of the {@link PortalItshopPatternPrivate} was successfully created.
   */
  public async createCopy(uid: string): Promise<boolean> {
    let reload = false;
    this.handleOpenLoader();
    try {
      await this.qerClient.v2Client.portal_itshop_pattern_copy_post(uid);
      this.snackBar.open({ key: '#LDS#The copy of the request template has been successfully created.' });
      reload = true;
    } finally {
      this.handleCloseLoader();
    }
    return reload;
  }

  /**
   * Deletes a list of {@link PortalItshopPatternPrivate} on the server
   * @param selectedPatterns the list of itshop pattern that should be delete.
   * @returns true if at least on pattern was successfully deleted.
   */
  public async delete(selectedPatterns: PortalItshopPatternPrivate[]): Promise<boolean> {
    let deleteCount = 0;
    this.handleOpenLoader();
    try {
      for (const pattern of selectedPatterns) {
        if (await this.tryDelete(pattern.GetEntity().GetKeys()[0])) {
          deleteCount++;
        }
      }

      if (deleteCount > 0) {
        const message = deleteCount > 1
          ? '#LDS#The selected request templates have been successfully deleted.'
          : '#LDS#The request template has been successfully deleted.';
        this.snackBar.open({ key: message });
      }
    } finally {
      this.handleCloseLoader();
    }
    return deleteCount > 0;
  }

  /**
   * Deletes a list of {@link PortalItshopPatternItem} from a {@link PortalItshopPatternPrivate} on the server
   * @param selectedPatterns the list of itshop pattern that should be delete.
   * @returns true if at least on pattern was successfully deleted.
   */
  public async deleteProducts(selectedPatternItems: PortalItshopPatternItem[]): Promise<boolean> {
    let deleteCount = 0;
    this.handleOpenLoader();
    try {
      for (const items of selectedPatternItems) {
        if (await this.tryDeleteProducts(items.GetEntity().GetKeys()[0])) {
          deleteCount++;
        }
      }
      this.snackBar.open({ key: '#LDS#The selected products have been successfully removed from the request template.' });
    } finally {
      this.handleCloseLoader();
    }
    return deleteCount > 0;
  }

  /**
   * Toogle the IsPublicPattern value of a {@link PortalItshopPatternPrivate} and commit the changes to the server
   * @param uid the uid of itshop pattern that should be toggled.
   * @returns true if the sPublicPattern value was successfully toggled.
   */
  public async togglePublic(uid: string): Promise<boolean> {
    let reload = false;
    this.handleOpenLoader();
    try {
      const pattern = await this.getPrivatePattern(uid);
      pattern.IsPublicPattern.value = !pattern.IsPublicPattern.value;
      if (await this.tryCommit(pattern)) {
        reload = true;
        const message = pattern.IsPublicPattern.value
          ? '#LDS#The request template has been shared successfully. The request template is now available for all users.'
          : '#LDS#Sharing of the request template has been successfully undone. The request template is now only available for yourself.';
        this.snackBar.open({ key: message });
      }
    } finally {
      this.handleCloseLoader();
    }
    return reload;
  }

  public async makePublic(selectedPatterns: PortalItshopPatternAdmin[], shouldBePublic: boolean): Promise<boolean> {
    let commitCount = 0;
    this.handleOpenLoader();
    try {
      for (const pattern of selectedPatterns) {
        pattern.IsPublicPattern.value = shouldBePublic;
        if (await this.tryCommit(pattern)) {
          commitCount++;
        }
      }
      const message = shouldBePublic
        ? (commitCount === 1
          ? '#LDS#The request template has been shared successfully. The request template is now available for all users.'
          : '#LDS#The request templates have been shared successfully. {0} request templates are now available for all users.')
        : (commitCount === 1
          ? '#LDS#Sharing of the request template has been successfully undone. The request template is now only available for yourself.'
          : '#LDS#Sharing of the request templates has been successfully undone. {0} request templates are now only available for yourself.'
        );
      this.snackBar.open({ key: message, parameters: [commitCount] });
    } finally {
      this.handleCloseLoader();
    }
    return commitCount > 0;
  }

  public handleOpenLoader(): void {
    if (this.busyIndicatorCounter === 0) {
      setTimeout(() => this.busyIndicator = this.busyService.show());
    }
    this.busyIndicatorCounter++;
  }

  public handleCloseLoader(): void {
    if (this.busyIndicatorCounter === 1) {
      setTimeout(() => {
        this.busyService.hide(this.busyIndicator);
        this.busyIndicator = undefined;
      });
    }
    this.busyIndicatorCounter--;
  }

  private async tryCommit(pattern: PortalItshopPatternPrivate): Promise<boolean> {
    try {
      await pattern.GetEntity().Commit(false);
      return true;
    } catch (error) {
      this.errorHandler.handleError(error);
    }
    return false;
  }

  private async tryDelete(uid: string): Promise<boolean> {
    try {
      await this.qerClient.v2Client.portal_itshop_pattern_private_delete(uid);
      return true;
    } catch (error) {
      this.errorHandler.handleError(error);
    }
    return false;
  }

  private async tryDeleteProducts(uid: string): Promise<boolean> {
    try {
      await this.qerClient.v2Client.portal_itshop_pattern_item_delete(uid);
      return true;
    } catch (error) {
      this.errorHandler.handleError(error);
    }
    return false;
  }
}
