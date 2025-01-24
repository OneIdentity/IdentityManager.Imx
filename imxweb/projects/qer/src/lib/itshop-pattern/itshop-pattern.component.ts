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

import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { EuiSidesheetService } from '@elemental-ui/core';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';

import { PortalItshopPatternAdmin, PortalItshopPatternPrivate } from 'imx-api-qer';
import { CollectionLoadParameters, DisplayColumns, TypedEntity } from 'imx-qbm-dbts';

import {
  AuthenticationService,
  BusyService,
  ClassloggerService,
  ConfirmationService,
  DataSourceToolbarSettings,
  DataSourceWrapper,
  DataTableComponent,
  HELP_CONTEXTUAL,
  HelpContextualValues,
  SnackBarService,
} from 'qbm';
import { QerPermissionsService } from '../admin/qer-permissions.service';
import { ItshopPatternSidesheetComponent } from './itshop-pattern-sidesheet/itshop-pattern-sidesheet.component';
import { ItshopPatternService } from './itshop-pattern.service';
import { ItshopPatternCreateService } from './itshop-pattern-create-sidesheet/itshop-pattern-create.service';
import { ItShopPatternChangedType } from './itshop-pattern-changed.enum';

/**
 * Component that shows a list of all product bundles (internal names are itshop pattern and request templates) of the current user
 * or all itshop pattern of all other users, if the user is a shop admin.
 */
@Component({
  selector: 'imx-itshop-pattern',
  templateUrl: './itshop-pattern.component.html',
  styleUrls: ['./itshop-pattern.component.scss'],
})
export class ItshopPatternComponent implements OnInit, OnDestroy {
  /**
   * the wrapper component for the  {@link DataSourceToolbar|dataSourceToolbar}.
   */
  public dstWrapper: DataSourceWrapper<PortalItshopPatternAdmin>;

  public dstSettings: DataSourceToolbarSettings;

  /**
   * The list of all selected product bundles.
   */
  public selectedPatterns: PortalItshopPatternAdmin[] = [];

  /**
   * Indicates wether the component should be shown for shop admins or not.
   */
  public adminMode: boolean;

  public busyService = new BusyService();

  @ViewChild(DataTableComponent) public table: DataTableComponent<TypedEntity>;

  public readonly status = {
    enabled: (pattern: PortalItshopPatternAdmin): boolean => this.canBeEditedAndDeleted(pattern),
  };
  public helpContextId: HelpContextualValues;

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
    authentication: AuthenticationService
  ) {
    this.subscriptions.push(authentication.onSessionResponse.subscribe((sessionState) => (this.currentUserUid = sessionState.UserUid)));
  }

  public async ngOnInit(): Promise<void> {
    const isBusy = this.busyService.beginBusy();
    try {
      this.adminMode = await this.qerPermissionService.isShopAdmin();

      this.helpContextId = this.adminMode ? HELP_CONTEXTUAL.RequestTemplates : HELP_CONTEXTUAL.RequestTemplatesUser;

      const entitySchema = this.adminMode ? this.patternService.itshopPatternAdminSchema : this.patternService.itshopPatternPrivateSchema;
      this.dstWrapper = new DataSourceWrapper(
        (state, requestOpts, isInitial) =>
          isInitial
            ? Promise.resolve({ totalCount: 0, Data: [] })
            : this.adminMode
            ? this.patternService.getPublicPatterns(state, requestOpts)
            : this.patternService.getPrivatePatterns(state, requestOpts),
        [entitySchema.Columns[DisplayColumns.DISPLAY_PROPERTYNAME], entitySchema.Columns.UID_Person, entitySchema.Columns.IsPublicPattern],
        entitySchema,
        undefined,
        'itshop-pattern'
      );
    } finally {
      isBusy.endBusy();
    }
    await this.getData(undefined, true);
  }

  public ngOnDestroy(): void {
    this.subscriptions.forEach((s) => s.unsubscribe());
  }

  public isMyPattern(pattern: PortalItshopPatternPrivate | PortalItshopPatternAdmin): boolean {
    return this.currentUserUid === pattern.UID_Person.value;
  }

  public canBeEditedAndDeleted(pattern: PortalItshopPatternPrivate | PortalItshopPatternAdmin): boolean {
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
      this.getData();
      this.table.clearSelection();
    }
  }

  public async publish(selectedPatterns: PortalItshopPatternPrivate[] | PortalItshopPatternAdmin[]): Promise<void> {
    await this.patternService.makePublic(selectedPatterns, true);
    this.getData();
    this.table.clearSelection();
  }

  public async unpublish(selectedPatterns: PortalItshopPatternPrivate[] | PortalItshopPatternAdmin[]): Promise<void> {
    await this.patternService.makePublic(selectedPatterns, false);
    this.getData();
    this.table.clearSelection();
  }

  public async createNewPattern(): Promise<void> {
    if (await this.patternCreateService.createNewPattern(true)) {
      this.getData();
    }
  }

  public async getData(parameter?: CollectionLoadParameters, isInitialLoad: boolean = false): Promise<void> {
    const isBusy = this.busyService.beginBusy();
    try {
      const parameters = {
        ...parameter,
        ...{ OrderBy: 'Ident_ShoppingCartPattern asc' },
      };
      const dstSettings = await this.dstWrapper.getDstSettings(
        parameters,
        { signal: this.patternService.abortController.signal },
        isInitialLoad
      );
      if (dstSettings) {
        this.dstSettings = dstSettings;
      }
    } finally {
      isBusy.endBusy();
    }
  }

  public onSearch(keywords: string): Promise<void> {
    this.patternService.abortCall();
    return this.getData({ search: keywords });
  }

  public selectedItemsCanBePublished(): boolean {
    return (
      this.selectedPatterns != null &&
      this.selectedPatterns.length > 0 &&
      this.selectedPatterns.every((item) => this.isMyPattern(item) && !item.IsPublicPattern.value)
    );
  }

  public selectedItemsCanBeUnpublished(): boolean {
    return (
      this.selectedPatterns != null &&
      this.selectedPatterns.length > 0 &&
      this.selectedPatterns.every((item) => this.isMyPattern(item) && item.IsPublicPattern.value)
    );
  }

  public selectedItemsCanBeDeleted(): boolean {
    return (
      this.selectedPatterns != null &&
      this.selectedPatterns.length > 0 &&
      this.selectedPatterns.every((item) => this.canBeEditedAndDeleted(item))
    );
  }

  public onSelectionChanged(items: PortalItshopPatternAdmin[]): void {
    this.logger.trace(this, 'selection changed', items);
    this.selectedPatterns = items;
  }

  public async onHighlightedEntityChanged(selectedPattern: PortalItshopPatternPrivate | PortalItshopPatternAdmin): Promise<void> {
    await this.viewDetails(selectedPattern);
  }

  private async viewDetails(selectedPattern: PortalItshopPatternPrivate | PortalItshopPatternAdmin): Promise<void> {
    const isMyPattern = this.isMyPattern(selectedPattern);
    const canEditAndDelete = this.canBeEditedAndDeleted(selectedPattern);
    const pattern = isMyPattern
      ? await this.patternService.getPrivatePattern(selectedPattern.GetEntity().GetKeys()[0])
      : (await this.patternService.getPublicPatterns()).Data.find(
          (pattern) => pattern.GetEntity().GetKeys()[0] === selectedPattern.GetEntity().GetKeys()[0]
        );

    const title = await this.translate
      .get(canEditAndDelete ? '#LDS#Heading Edit Product Bundle' : '#LDS#Heading View Product Bundle Details')
      .toPromise();

    const result = await this.sidesheet
      .open(ItshopPatternSidesheetComponent, {
        title,
        subTitle: pattern.Ident_ShoppingCartPattern.value,
        panelClass: 'imx-sidesheet',
        disableClose: true,
        padding: '0',
        width: '600px',
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
