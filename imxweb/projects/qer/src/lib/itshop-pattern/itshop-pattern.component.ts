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

import { Component, OnDestroy, OnInit } from '@angular/core';
import { EuiSidesheetService } from '@elemental-ui/core';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';

import { PortalItshopPatternAdmin, PortalItshopPatternPrivate } from '@imx-modules/imx-api-qer';
import { CollectionLoadParameters, DisplayColumns, EntitySchema, TypedEntity, TypedEntityCollectionData } from '@imx-modules/imx-qbm-dbts';

import {
  AuthenticationService,
  ClassloggerService,
  ConfirmationService,
  DataViewInitParameters,
  DataViewSource,
  HELP_CONTEXTUAL,
  HelpContextualValues,
  ISessionState,
  SnackBarService,
  calculateSidesheetWidth,
} from 'qbm';
import { QerPermissionsService } from '../admin/qer-permissions.service';
import { ItShopPatternChangedType } from './itshop-pattern-changed.enum';
import { ItshopPatternCreateService } from './itshop-pattern-create-sidesheet/itshop-pattern-create.service';
import { ItshopPatternSidesheetComponent } from './itshop-pattern-sidesheet/itshop-pattern-sidesheet.component';
import { ItshopPatternService } from './itshop-pattern.service';

/**
 * Component that shows a list of all product bundles (internal names are itshop pattern and request templates) of the current user
 * or all itshop pattern of all other users, if the user is a shop admin.
 */
@Component({
  selector: 'imx-itshop-pattern',
  templateUrl: './itshop-pattern.component.html',
  styleUrls: ['./itshop-pattern.component.scss'],
  providers: [DataViewSource],
})
export class ItshopPatternComponent implements OnInit, OnDestroy {
  /**
   * The list of all selected product bundles.
   */
  public selectedPatterns: (PortalItshopPatternPrivate | PortalItshopPatternAdmin)[] = [];

  /**
   * Indicates wether the component should be shown for shop admins or not.
   */
  public adminMode: boolean;

  public readonly status = {
    enabled: (pattern: PortalItshopPatternAdmin): boolean => this.canBeEditedAndDeleted(pattern),
  };
  public helpContextId: HelpContextualValues;
  public entitySchema: EntitySchema;
  public readonly DisplayColumns = DisplayColumns;

  private readonly subscriptions: Subscription[] = [];
  private currentUserUid: string;

  constructor(
    private readonly patternService: ItshopPatternService,
    private readonly patternCreateService: ItshopPatternCreateService,
    private readonly qerPermissionService: QerPermissionsService,
    private readonly sidesheet: EuiSidesheetService,
    private readonly snackBar: SnackBarService,
    private readonly translate: TranslateService,
    private readonly logger: ClassloggerService,
    private readonly confirmationService: ConfirmationService,
    authentication: AuthenticationService,
    public dataSource: DataViewSource<PortalItshopPatternAdmin | PortalItshopPatternPrivate>,
  ) {
    this.subscriptions.push(
      authentication.onSessionResponse.subscribe((sessionState: ISessionState) => (this.currentUserUid = sessionState.UserUid || '')),
    );
  }

  public async ngOnInit(): Promise<void> {
    this.patternService.handleOpenLoader();
    try {
      this.adminMode = await this.qerPermissionService.isShopAdmin();

      this.helpContextId = this.adminMode ? HELP_CONTEXTUAL.RequestTemplates : HELP_CONTEXTUAL.RequestTemplatesUser;

      this.entitySchema = this.adminMode ? this.patternService.itshopPatternAdminSchema : this.patternService.itshopPatternPrivateSchema;
    } finally {
      this.patternService.handleCloseLoader();
    }
    await this.getData();
  }

  public ngOnDestroy(): void {
    this.subscriptions.forEach((s) => s.unsubscribe());
  }

  public isMyPattern(entity: TypedEntity): boolean {
    const pattern = entity as PortalItshopPatternPrivate | PortalItshopPatternAdmin;
    return this.currentUserUid === pattern.UID_Person.value;
  }

  public canBeEditedAndDeleted(pattern: TypedEntity): boolean {
    return this.isMyPattern(pattern) || this.adminMode;
  }

  public async delete(selectedPattern?: PortalItshopPatternPrivate | PortalItshopPatternAdmin): Promise<void> {
    if (
      await this.confirmationService.confirm({
        Title: '#LDS#Heading Delete Product Bundles',
        Message: '#LDS#Are you sure you want to delete the selected product bundles?',
      })
    ) {
      await this.patternService.delete(selectedPattern ? [selectedPattern] : this.selectedPatterns, this.adminMode);
      this.dataSource.selection.clear();
      this.dataSource.updateState();
    }
  }

  public async publish(selectedPatterns: TypedEntity[]): Promise<void> {
    await this.patternService.makePublic(selectedPatterns, true);
    this.dataSource.selection.clear();
    this.dataSource.updateState();
  }

  public async unpublish(selectedPatterns: TypedEntity[]): Promise<void> {
    await this.patternService.makePublic(selectedPatterns, false);
    this.dataSource.selection.clear();
    this.dataSource.updateState();
  }

  public async createNewPattern(): Promise<void> {
    if (await this.patternCreateService.createNewPattern(true)) {
      this.dataSource.updateState();
    }
  }

  public async getData(): Promise<void> {
    this.dataSource.itemStatus = this.status;
    const dataViewInitParameters: DataViewInitParameters<PortalItshopPatternPrivate | PortalItshopPatternAdmin> = {
      execute: this.adminMode
        ? (params: CollectionLoadParameters, signal: AbortSignal): Promise<TypedEntityCollectionData<PortalItshopPatternAdmin>> =>
            this.patternService.getPublicPatterns(params, signal)
        : (params: CollectionLoadParameters, signal: AbortSignal): Promise<TypedEntityCollectionData<PortalItshopPatternPrivate>> =>
            this.patternService.getPrivatePatterns(params, signal),
      schema: this.entitySchema,
      columnsToDisplay: [
        this.entitySchema.Columns[DisplayColumns.DISPLAY_PROPERTYNAME],
        this.entitySchema.Columns.UID_Person,
        this.entitySchema.Columns.IsPublicPattern,
      ],
      highlightEntity: (entity: PortalItshopPatternPrivate | PortalItshopPatternAdmin) => {
        this.viewDetails(entity);
      },
      selectionChange: (selection: (PortalItshopPatternPrivate | PortalItshopPatternAdmin)[]) => {
        this.logger.trace(this, 'selection changed', selection);
        this.selectedPatterns = selection;
      },
    };
    this.dataSource.init(dataViewInitParameters);
  }

  public selectedItemsCanBePublished(): boolean {
    return (
      this.selectedPatterns != null &&
      this.selectedPatterns.length > 0 &&
      this.selectedPatterns.every((item: PortalItshopPatternAdmin) => this.isMyPattern(item) && !item.IsPublicPattern.value)
    );
  }

  public selectedItemsCanBeUnpublished(): boolean {
    return (
      this.selectedPatterns != null &&
      this.selectedPatterns.length > 0 &&
      this.selectedPatterns.every((item: PortalItshopPatternAdmin) => this.isMyPattern(item) && item.IsPublicPattern.value)
    );
  }

  public selectedItemsCanBeDeleted(): boolean {
    return (
      this.selectedPatterns != null &&
      this.selectedPatterns.length > 0 &&
      this.selectedPatterns.every((item) => this.canBeEditedAndDeleted(item))
    );
  }

  private async viewDetails(selectedPattern: PortalItshopPatternPrivate | PortalItshopPatternAdmin): Promise<void> {
    const isMyPattern = this.isMyPattern(selectedPattern);
    const canEditAndDelete = this.canBeEditedAndDeleted(selectedPattern);
    const pattern = isMyPattern
      ? await this.patternService.getPrivatePattern(selectedPattern.GetEntity().GetKeys()[0])
      : (await this.patternService.getPublicPatterns()).Data.find(
          (pattern) => pattern.GetEntity().GetKeys()[0] === selectedPattern.GetEntity().GetKeys()[0],
        );

    const title = await this.translate
      .get(canEditAndDelete ? '#LDS#Heading Edit Product Bundle' : '#LDS#Heading View Product Bundle Details')
      .toPromise();

    const result = await this.sidesheet
      .open(ItshopPatternSidesheetComponent, {
        title,
        subTitle: pattern?.Ident_ShoppingCartPattern.value,
        panelClass: 'imx-sidesheet',
        disableClose: true,
        padding: '0',
        width: calculateSidesheetWidth(),
        testId: 'pattern-details-sidesheet',
        data: {
          pattern,
          isMyPattern,
          adminMode: this.adminMode,
          canEditAndDelete,
        },
      })
      .afterClosed()
      .toPromise();

    if (result === ItShopPatternChangedType.Saved) {
      const snackBarMessage = '#LDS#The product bundle has been successfully saved.';
      this.snackBar.open({ key: snackBarMessage });
      this.getData();
    } else if (result) {
      this.getData();
    }
  }
}
