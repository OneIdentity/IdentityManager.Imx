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

import { OverlayRef } from '@angular/cdk/overlay';
import { ErrorHandler, Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { EuiLoadingService, EuiSidesheetService } from '@elemental-ui/core';
import { TranslateService } from '@ngx-translate/core';

import { PortalItshopPatternItem, PortalItshopPatternPrivate } from 'imx-api-qer';

import { ClassloggerService, HELP_CONTEXTUAL, HelpContextualComponent, HelpContextualService, SnackBarService, UserMessageService } from 'qbm';
import { QerApiService } from '../../qer-api-client.service';
import { DuplicatePatternItem } from '../duplicate-pattern-items/duplicate-pattern-item';
import { DuplicatePatternItemsComponent } from '../duplicate-pattern-items/duplicate-pattern-items.component';
import { ItShopPatternChangedType } from '../itshop-pattern-changed.enum';
import { ItshopPatternCreateSidesheetComponent } from './itshop-pattern-create-sidesheet.component';
import { PatternItemCandidate } from '../pattern-item-candidate.interface';

@Injectable({
  providedIn: 'root'
})
export class ItshopPatternCreateService {

  private busyIndicator: OverlayRef;
  private busyIndicatorCounter = 0;

  constructor(
    private readonly qerClient: QerApiService,
    private readonly logger: ClassloggerService,
    private readonly busyService: EuiLoadingService,
    private readonly dialogService: MatDialog,
    private readonly messageService: UserMessageService,
    private readonly sidesheet: EuiSidesheetService,
    private readonly translate: TranslateService,
    private readonly errorHandler: ErrorHandler,
    private readonly snackBar: SnackBarService,
    private readonly helpContextualService: HelpContextualService
  ) { }

  public async saveNewPatternAndItems(pattern: PortalItshopPatternPrivate, patternItems: PortalItshopPatternItem[]): Promise<void> {

    this.handleOpenLoader();
    try {
      const uidPattern = await this.postPattern(pattern);
      this.logger.debug(this, 'new pattern submitted');

      if (patternItems && patternItems.length > 0) {
        await this.createPatternItems(patternItems, uidPattern, false);
      }

    } finally {
      this.handleCloseLoader();
    }

    this.snackBar.open({
      key: '#LDS#The product bundle has been successfully created.',
      parameters: [pattern.GetEntity().GetDisplay()]
    }, '#LDS#Close');

  }

  /**
   * Post the given {@link PortalItshopPatternPrivate} to the server
   * @param pattern the itshop pattern that should be posted
   * @returns the uid of the {@link PortalItshopPatternPrivate}
   */
  public async postPattern(pattern: PortalItshopPatternPrivate): Promise<string> {
    pattern = (await this.qerClient.typedClient.PortalItshopPatternPrivate.Post(pattern))?.Data[0];
    return pattern.GetEntity()?.GetKeys()?.join(',');
  }


  public async createPatternItems(selection: any, uidPattern: string, showResultInSnackbar: boolean = true): Promise<number> {

    const newAssignedObjects = (await this.handlePromiseLoader(
      Promise.all(
        selection.map(async (selectedItem: { XObjectKey: { value: string; }; }) => {
          const patternItem = this.qerClient.typedClient.PortalItshopPatternItem.createEntity();
          patternItem.UID_ShoppingCartPattern.value = uidPattern;
          patternItem.UID_AccProduct.value = selectedItem.XObjectKey.value;
          await patternItem.GetEntity().Commit(true);
        })
      )
    )).length;
    if (newAssignedObjects > 0 && showResultInSnackbar) {
      this.snackBar.open({
        key: '#LDS#{0} identities have been successfully assigned.',
        parameters: [newAssignedObjects]
      }, '#LDS#Close');
    }
    return newAssignedObjects;
  }

  public async assignItemsToPattern(
    items: PatternItemCandidate[],
    uidPattern: string = ''): Promise<number> {

    if (uidPattern.length === 0) {
      // create new pattern
      const pattern = await this.createNewPattern(false);
      if (!pattern) {
        return 0;
      }
      uidPattern = pattern.GetEntity().GetKeys()[0];
    }

    const duplicateItems: DuplicatePatternItem[] = [];
    let newAssignedObjects = 0;

    for (const item of items) {
      let patternItem: PortalItshopPatternItem;
      try {
        patternItem = this.qerClient.typedClient.PortalItshopPatternItem.createEntity();
        patternItem.UID_ShoppingCartPattern.value = uidPattern;
        patternItem.UID_AccProduct.value = item.uidAccProduct;
        await this.qerClient.typedClient.PortalItshopPatternItem.Post(patternItem);
        newAssignedObjects++;
      } catch (exception) {
        // 810303 == the combination of the fields Role/organization, Service item, Product bundle must be unique.
        if (exception?.dataItems.length && exception.dataItems[0].Number === 810303 ) {
          duplicateItems.push(new DuplicatePatternItem(item.display));
        }
        else {
          this.errorHandler.handleError(exception);
        }
      }
    }

    if (duplicateItems.length > 0) {
      const dialogRef = this.dialogService.open(DuplicatePatternItemsComponent, {
        data: {
          duplicatePatternItems: duplicateItems
        }
      });

      await dialogRef.beforeClosed().toPromise();
    }
    return newAssignedObjects;
  }

  public async createNewPattern(showSnackbar: boolean): Promise<PortalItshopPatternPrivate> {
    const newPattern = this.createNewPatternEntity();
    this.logger.trace(this, 'new itshop pattern created', newPattern);

    if (newPattern) {
      this.helpContextualService.setHelpContextId(HELP_CONTEXTUAL.RequestTemplatesCreate);
      const result = await this.sidesheet.open(ItshopPatternCreateSidesheetComponent, {
        title: await this.translate.get('#LDS#Heading Create Product Bundle').toPromise(),
        panelClass: 'imx-sidesheet',
        disableClose: true,
        padding: '0',
        width: '600px',
        testId: 'pattern-create-sidesheet',
        data: {
          pattern: newPattern
        },
        headerComponent: HelpContextualComponent
      }).afterClosed().toPromise();

      if (result === ItShopPatternChangedType.Saved) {

        if (showSnackbar) {
          const snackBarMessage = '#LDS#The product bundle has been successfully created.';
          this.snackBar.open({ key: snackBarMessage });
        }
        return newPattern;
      }
    }
    else {
      this.messageService.subject.next({
        text: '#LDS#The sample could not be created. Please reload the page and try again.'
      });
      return null;
    }
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

  private createNewPatternEntity(): PortalItshopPatternPrivate {
    return this.qerClient.typedClient.PortalItshopPatternPrivate.createEntity();
  }

  private async handlePromiseLoader<T>(promise: Promise<T>): Promise<T> {
    const loaderRef = this.handleOpenLoader();
    return promise.finally(() => this.handleCloseLoader());
  }
}
