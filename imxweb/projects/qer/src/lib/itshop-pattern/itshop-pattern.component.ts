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
 * Copyright 2021 One Identity LLC.
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
import { ActivatedRoute } from '@angular/router';
import { EuiSidesheetService } from '@elemental-ui/core';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';

import { PortalItshopPatternAdmin, PortalItshopPatternPrivate } from 'imx-api-qer';
import { CollectionLoadParameters, DisplayColumns, TypedEntity, ValType } from 'imx-qbm-dbts';

import {
  AuthenticationService,
  ClassloggerService,
  ConfirmationService,
  DataSourceToolbarSettings,
  DataSourceWrapper,
  DataTableComponent,
  SnackBarService,
} from 'qbm';
import { QerPermissionsService } from '../admin/qer-permissions.service';
import { ItshopPatternSidesheetComponent } from './itshop-pattern-sidesheet/itshop-pattern-sidesheet.component';
import { ItshopPatternService } from './itshop-pattern.service';
import { ItshopPatternCreateService } from './itshop-pattern-create-sidesheet/itshop-pattern-create.service';
import { ItShopPatternChangedType } from './itshop-pattern-changed.enum';

@Component({
  selector: 'imx-itshop-pattern',
  templateUrl: './itshop-pattern.component.html',
  styleUrls: ['./itshop-pattern.component.scss']
})
export class ItshopPatternComponent implements OnInit, OnDestroy {

  public dstWrapper: DataSourceWrapper<PortalItshopPatternAdmin>;
  public dstSettings: DataSourceToolbarSettings;
  public selectedPatterns: PortalItshopPatternAdmin[] = [];
  public adminMode: boolean;

  @ViewChild(DataTableComponent) public table: DataTableComponent<TypedEntity>;

  public readonly status = {
    enabled: (pattern: PortalItshopPatternAdmin): boolean => this.isMyPattern(pattern)
  };
  public infoText: string;

  private readonly subscriptions: Subscription[] = [];
  private currentUserUid: string;
  private infoTextAdmin = '#LDS#Here you can manage request templates. You can edit and share your own request templates and create copies of request templates created by others.';
  private infoTextUser = '#LDS#Here you can manage your request templates. You can edit your request templates, delete them and share them with others.';

  constructor(
    private readonly patternService: ItshopPatternService,
    private readonly patternCreateService: ItshopPatternCreateService,
    private readonly qerPermissionService: QerPermissionsService,
    private readonly activatedRoute: ActivatedRoute,
    private readonly sidesheet: EuiSidesheetService,
    private readonly snackBar: SnackBarService,
    private readonly translate: TranslateService,
    private readonly logger: ClassloggerService,
    private readonly confirmationService: ConfirmationService,
    authentication: AuthenticationService
  ) {
    this.subscriptions.push(
      authentication.onSessionResponse.subscribe((sessionState) =>
        this.currentUserUid = sessionState.UserUid
      )
    );
  }

  public async ngOnInit(): Promise<void> {

    this.patternService.handleOpenLoader();
    try {
      const route = this.activatedRoute.snapshot.routeConfig.path;
      this.adminMode = await this.qerPermissionService.isShopAdmin() && route === 'configuration/requesttemplates';

      this.infoText = this.adminMode ? this.infoTextAdmin : this.infoTextUser;

      const entitySchema = this.adminMode
        ? this.patternService.itshopPatternAdminSchema
        : this.patternService.itshopPatternPrivateSchema;
      this.dstWrapper = new DataSourceWrapper(
        state => this.adminMode
          ? this.patternService.getPublicPatterns(state)
          : this.patternService.getPrivatePatterns(state),
        [
          entitySchema.Columns[DisplayColumns.DISPLAY_PROPERTYNAME],
          entitySchema.Columns.UID_Person,
          entitySchema.Columns.IsPublicPattern,
          {
            ColumnName: 'actions',
            Type: ValType.String
          }
        ],
        entitySchema,
        undefined,
        'itshop-pattern'
      );
    } finally {
      this.patternService.handleCloseLoader();
    }
    await this.getData();
  }

  public ngOnDestroy(): void {
    this.subscriptions.forEach(s => s.unsubscribe());
  }

  public isMyPattern(pattern: PortalItshopPatternAdmin): boolean {
    return this.currentUserUid === pattern.UID_Person.value;
  }

  public async delete(selectedPattern?: PortalItshopPatternPrivate): Promise<void> {
    if (await this.confirmationService.confirm({
      Title: '#LDS#Heading Delete Request Templates',
      Message: '#LDS#Are you sure you want to delete the selected request templates?'
    })) {
      await this.patternService.delete(selectedPattern ? [selectedPattern] : this.selectedPatterns);
      this.getData();
      this.table.clearSelection();
    }
  }

  public async publish(selectedPatterns: PortalItshopPatternAdmin[]): Promise<void> {
    await this.patternService.makePublic(selectedPatterns, true);
    this.getData();
    this.table.clearSelection();
  }

  public async unpublish(selectedPatterns: PortalItshopPatternAdmin[]): Promise<void> {
    await this.patternService.makePublic(selectedPatterns, false);
    this.getData();
    this.table.clearSelection();
  }

  public async createNewPattern(): Promise<void> {
    if (await this.patternCreateService.createNewPattern(true)) {
      this.getData();
    }
  }

  public async getData(parameter?: CollectionLoadParameters): Promise<void> {
    this.patternService.handleOpenLoader();
    try {
      const parameters = {
        ...parameter,
        ...{ OrderBy: 'Ident_ShoppingCartPattern asc' }
      };
      this.dstSettings = await this.dstWrapper.getDstSettings(parameters);
    } finally {
      this.patternService.handleCloseLoader();
    }
  }

  public selectedItemsCanBePublished(): boolean {
    return this.selectedPatterns != null
      && this.selectedPatterns.length > 0
      && this.selectedPatterns.every(item => this.isMyPattern(item) && !item.IsPublicPattern.value);
  }

  public selectedItemsCanBeUnpublished(): boolean {
    return this.selectedPatterns != null
      && this.selectedPatterns.length > 0
      && this.selectedPatterns.every(item => this.isMyPattern(item) && item.IsPublicPattern.value);
  }

  public selectedItemsCanBeDeleted(): boolean {
    return this.selectedPatterns != null
      && this.selectedPatterns.length > 0
      && this.selectedPatterns.every(item => this.isMyPattern(item));
  }

  public onSelectionChanged(items: PortalItshopPatternAdmin[]): void {
    this.logger.trace(this, 'selection changed', items);
    this.selectedPatterns = items;
  }


  public async viewDetails(selectedPattern: PortalItshopPatternAdmin): Promise<void> {
    const isMyPattern = this.isMyPattern(selectedPattern);
    const pattern = isMyPattern
      ? await this.patternService.getPrivatePattern(selectedPattern.GetEntity().GetKeys()[0])
      : selectedPattern;

    const result = await this.sidesheet.open(ItshopPatternSidesheetComponent, {
      title: await this.translate.get('#LDS#Heading Edit Request Template').toPromise(),
      headerColour: 'iris-blue',
      bodyColour: 'asher-gray',
      panelClass: 'imx-sidesheet',
      disableClose: true,
      padding: '0',
      width: '600px',
      testId: 'pattern-details-sidesheet',
      data: {
        pattern,
        isMyPattern
      }
    }).afterClosed().toPromise();

    if (result === ItShopPatternChangedType.Saved) {
      const snackBarMessage = '#LDS#The request template has been successfully saved.';
      this.snackBar.open({ key: snackBarMessage });
      this.getData();
    } else if (result) {
      this.getData();
    }

  }
}
