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

import { Component, Inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { UntypedFormArray, UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { EuiSidesheetRef, EuiSidesheetService, EUI_SIDESHEET_DATA } from '@elemental-ui/core';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';

import { PortalItshopPatternItem, PortalItshopPatternPrivate, PortalShopServiceitems, ProjectConfig, QerProjectConfig } from 'imx-api-qer';
import { CollectionLoadParameters, CompareOperator, DisplayColumns, FilterType, TypedEntity } from 'imx-qbm-dbts';

import {
  BaseCdr,
  BusyService,
  BaseReadonlyCdr,
  ClassloggerService,
  ColumnDependentReference,
  ConfirmationService,
  DataSourceToolbarSettings,
  DataSourceWrapper,
  DataTableComponent,
  SnackBarService,
} from 'qbm';
import { ItshopPatternService } from '../itshop-pattern.service';
import { ItShopPatternChangedType } from '../itshop-pattern-changed.enum';
import { ItshopPatternAddProductsComponent } from '../itshop-pattern-add-products/itshop-pattern-add-products.component';
import { ItshopPatternItemEditComponent } from '../itshop-pattern-item-edit/itshop-pattern-item-edit.component';
import { ServiceItemsService } from '../../service-items/service-items.service';
import { ProjectConfigurationService } from '../../project-configuration/project-configuration.service';

@Component({
  selector: 'imx-itshop-pattern-sidesheet',
  templateUrl: './itshop-pattern-sidesheet.component.html',
  styleUrls: ['./itshop-pattern-sidesheet.component.scss']
})
export class ItshopPatternSidesheetComponent implements OnInit, OnDestroy {

  public get formArray(): UntypedFormArray {
    return this.detailsFormGroup.get('formArray') as UntypedFormArray;
  }
  public cdrList: ColumnDependentReference[] = [];
  public readonly detailsFormGroup: UntypedFormGroup;

  public busyService = new BusyService();

  public dstWrapper: DataSourceWrapper<PortalItshopPatternItem>;
  public dstSettings: DataSourceToolbarSettings;
  public selectedPatternItems: PortalItshopPatternItem[] = [];
  public adminMode: boolean;
  public selectedTabIndex = 0;

  public detailsInfoText = '#LDS#Here you can see the details of this product bundle.';
  public editableDetailsInfoText = '#LDS#Here you can edit the details of this product bundle.';

  public productsInfoText = '#LDS#Here you can get an overview of all products assigned to this product bundle.';
  public editableProductsInfoText = '#LDS#Here you can get an overview of all products assigned to this product bundle. Additionally, you can add and remove products.';


  @ViewChild(DataTableComponent) public table: DataTableComponent<TypedEntity>;

  private closeSubscription: Subscription;
  private shoppingCartPatternUid = '';

  constructor(
    formBuilder: UntypedFormBuilder,
    @Inject(EUI_SIDESHEET_DATA) public data: {
      pattern: PortalItshopPatternPrivate
      isMyPattern: boolean,
      adminMode: boolean,
      canEditAndDelete: boolean
    },
    private readonly translate: TranslateService,
    private readonly patternService: ItshopPatternService,
    private readonly serviceItemsService: ServiceItemsService,
    private readonly projectConfigurationService: ProjectConfigurationService,
    private readonly sidesheet: EuiSidesheetService,
    private readonly sideSheetRef: EuiSidesheetRef,
    private readonly snackBar: SnackBarService,
    private readonly logger: ClassloggerService,
    private confirmation: ConfirmationService
  ) {
    this.detailsFormGroup = new UntypedFormGroup({ formArray: formBuilder.array([]) });

    this.closeSubscription = this.sideSheetRef.closeClicked().subscribe(async () => {
      if (!this.detailsFormGroup.dirty
        || await confirmation.confirmLeaveWithUnsavedChanges()) {
          this.data.pattern.GetEntity().DiscardChanges();
          this.sideSheetRef.close();
      }
    });
  }

  public async ngOnInit(): Promise<void> {
    this.shoppingCartPatternUid = this.data.pattern.GetEntity().GetKeys()[0];

    await this.setupDetailsTab();
    this.setupProductsTab();
  }

  public ngOnDestroy(): void {
    if (this.closeSubscription) {
      this.closeSubscription.unsubscribe();
    }
  }

  public async getData(parameter?: CollectionLoadParameters): Promise<void> {
    const isBusy = this.busyService.beginBusy();
    try {
      const filteredState: CollectionLoadParameters = {
        filter: [
          {
            ColumnName: 'UID_ShoppingCartPattern',
            Type: FilterType.Compare,
            CompareOp: CompareOperator.Equal,
            Value1: this.shoppingCartPatternUid,
          },
        ],
      };

      const parameters = {
        ...parameter,
        ...filteredState
      };
      this.dstSettings = await this.dstWrapper.getDstSettings(parameters);
    } finally {
      isBusy.endBusy();
    }
  }

  public async onSelectedTabChanged(event: MatTabChangeEvent): Promise<void> {
    this.selectedTabIndex = event.index;

    if (this.selectedTabIndex === 1) {
      // load data for the product-tab
      await this.getData();
    }
  }

  public onSelectionChanged(items: PortalItshopPatternItem[]): void {
    this.logger.trace(this, 'selection changed', items);
    this.selectedPatternItems = items;
  }

  public async togglePublic(): Promise<void> {
    await this.patternService.togglePublic(this.data.pattern.GetEntity().GetKeys()[0]);
    this.sideSheetRef.close(ItShopPatternChangedType.TogglePublic);
  }

  public async delete(): Promise<void> {
    if (await this.confirmation.confirm({
      Title: '#LDS#Heading Delete Product Bundle',
      Message: '#LDS#Are you sure you want to delete the product bundle?'
    })) {
      if (await this.patternService.delete([this.data.pattern])) {
        this.sideSheetRef.close(ItShopPatternChangedType.Deleted);
      }
    }
  }

  public async deleteProducts(): Promise<void> {
    if (await this.patternService.deleteProducts(this.selectedPatternItems)) {
      await this.getData();
      this.table?.clearSelection();
    }
  }

  public async addProducts(): Promise<void> {

    const result = await this.sidesheet.open(ItshopPatternAddProductsComponent, {
      title: await this.translate.get('#LDS#Heading Add Products To Product Bundle').toPromise(),
      subTitle: this.data.pattern.Ident_ShoppingCartPattern.value,
      panelClass: 'imx-sidesheet',
      padding: '0',
      width: 'max(768px, 70%)',
      testId: 'pattern-add-products-sidesheet',
      data: {
        shoppingCartPatternUid: this.shoppingCartPatternUid
      }
    }).afterClosed().toPromise();

    if (result) {
      const snackBarMessage = '#LDS#The selected products have been successfully added to the product bundle.';
      this.snackBar.open({ key: snackBarMessage });
      await this.getData();
    }
  }

  public selectedItemsCanBeDeleted(): boolean {
    return this.selectedPatternItems != null
      && this.selectedPatternItems.length > 0;
  }

  public async createPrivateCopy(): Promise<void> {
    await this.patternService.createCopy(this.data.pattern.GetEntity().GetKeys()[0]);
    this.sideSheetRef.close(ItShopPatternChangedType.CreateCopy);
  }

  public async save(): Promise<void> {
    if (this.detailsFormGroup.valid) {
      this.logger.debug(this, `Saving itshop pattern changes`);
      this.patternService.handleOpenLoader();
      try {
        await this.data.pattern.GetEntity().Commit(true);
        this.detailsFormGroup.markAsPristine();
        this.sideSheetRef.close(ItShopPatternChangedType.Saved);
      } finally {
        this.patternService.handleCloseLoader();
      }
    }
  }

  public async onHighlightedEntityChanged(selectedItem: PortalItshopPatternItem): Promise<void> {
    await this.editPatternItem(selectedItem);
  }

  public async editPatternItem(selectedItem: PortalItshopPatternItem): Promise<void> {

    let projectConfig: QerProjectConfig & ProjectConfig;
    let serviceItem: PortalShopServiceitems;

    this.patternService.handleOpenLoader();
    try {
      serviceItem = await this.serviceItemsService.getServiceItem(selectedItem.UID_AccProduct.value, true);
      projectConfig = await this.projectConfigurationService.getConfig();
    } finally {
      this.patternService.handleCloseLoader();
    }

    this.sidesheet.open(ItshopPatternItemEditComponent,
      {
        title: await this.translate.get('#LDS#Heading View Product Details').toPromise(),
        subTitle: selectedItem.GetEntity().GetDisplay(),
        padding: '0px',
        width: '600px',
        testId: 'itshop-pattern-item-edit-sidesheet',
        data: {
          patternItemUid: selectedItem.GetEntity().GetKeys().join(''),
          serviceItem,
          projectConfig
        }
      }
    );
  }

  private async setupDetailsTab(): Promise<void> {

    if (this.data.canEditAndDelete) {
      this.cdrList = [
        new BaseCdr(this.data.pattern.Ident_ShoppingCartPattern.Column),
        new BaseCdr(this.data.pattern.Description.Column),
        new BaseCdr(this.data.pattern.UID_Person.Column)
      ];
    } else {
      this.cdrList = [
        new BaseReadonlyCdr(this.data.pattern.Ident_ShoppingCartPattern.Column),
        new BaseReadonlyCdr(this.data.pattern.Description.Column),
        new BaseReadonlyCdr(this.data.pattern.UID_Person.Column)
      ];
    }
  }

  private setupProductsTab(): void {
    const entitySchema = this.patternService.itshopPatternItemSchema;
    this.dstWrapper = new DataSourceWrapper(
      state => this.patternService.getPatternItems(state),
      [
        entitySchema.Columns[DisplayColumns.DISPLAY_PROPERTYNAME]
      ],
      entitySchema
    );
  }
}
