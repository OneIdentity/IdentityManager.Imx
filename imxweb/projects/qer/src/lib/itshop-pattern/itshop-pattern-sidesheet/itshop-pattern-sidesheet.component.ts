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

import { Component, Inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { EuiSidesheetRef, EUI_SIDESHEET_DATA } from '@elemental-ui/core';
import { Subscription } from 'rxjs';

import { PortalItshopPatternItem, PortalItshopPatternPrivate, } from 'imx-api-qer';
import { CollectionLoadParameters, CompareOperator, DisplayColumns, FilterType, TypedEntity } from 'imx-qbm-dbts';

import {
  BaseCdr,
  ClassloggerService,
  ColumnDependentReference,
  ConfirmationService,
  DataSourceToolbarSettings,
  DataSourceWrapper,
  DataTableComponent,
  TabControlHelper,
} from 'qbm';
import { ItshopPatternService } from '../itshop-pattern.service';
import { ItShopPatternChangedType } from '../itshop-pattern-changed.enum';

@Component({
  selector: 'imx-itshop-pattern-sidesheet',
  templateUrl: './itshop-pattern-sidesheet.component.html',
  styleUrls: ['./itshop-pattern-sidesheet.component.scss']
})
export class ItshopPatternSidesheetComponent implements OnInit, OnDestroy {

  public get formArray(): FormArray {
    return this.detailsFormGroup.get('formArray') as FormArray;
  }
  public cdrList: ColumnDependentReference[] = [];
  public readonly detailsFormGroup: FormGroup;

  public dstWrapper: DataSourceWrapper<PortalItshopPatternItem>;
  public dstSettings: DataSourceToolbarSettings;
  public selectedPatternItems: PortalItshopPatternItem[] = [];
  public adminMode: boolean;
  public selectedTabIndex = 0;

  public detailsInfoText = '#LDS#Here you can edit the details of this request template.';
  public productsInfoText =
    '#LDS#Here you can get an overview of all products assigned to this request template. Additionally, you can remove products from this request template.';

  @ViewChild(DataTableComponent) public table: DataTableComponent<TypedEntity>;

  private closeSubscription: Subscription;

  constructor(
    formBuilder: FormBuilder,
    @Inject(EUI_SIDESHEET_DATA) public data: {
      pattern: PortalItshopPatternPrivate
      isMyPattern: boolean,
      adminMode: boolean
    },
    private readonly patternService: ItshopPatternService,
    private readonly sideSheetRef: EuiSidesheetRef,
    private readonly logger: ClassloggerService,
    private confirmation: ConfirmationService
  ) {
    this.detailsFormGroup = new FormGroup({ formArray: formBuilder.array([]) });

    this.closeSubscription = this.sideSheetRef.closeClicked().subscribe(async () => {
      if (!this.detailsFormGroup.dirty
        || await confirmation.confirmLeaveWithUnsavedChanges()) {
        this.sideSheetRef.close();
      }
    });
  }

  public async ngOnInit(): Promise<void> {

    /**
     * Resolve an issue where the mat-tab navigation arrows could appear on first load
     */
    setTimeout(() => {
      TabControlHelper.triggerResizeEvent();
    });

    await this.setupDetailsTab();
    this.setupProductsTab();
  }

  public ngOnDestroy(): void {
    if (this.closeSubscription) {
      this.closeSubscription.unsubscribe();
    }
  }

  public async getData(parameter?: CollectionLoadParameters): Promise<void> {
    this.patternService.handleOpenLoader();
    try {
      const uid = this.data.pattern.GetEntity().GetKeys()[0];
      const filteredState: CollectionLoadParameters = {
        filter: [
          {
            ColumnName: 'UID_ShoppingCartPattern',
            Type: FilterType.Compare,
            CompareOp: CompareOperator.Equal,
            Value1: uid,
          },
        ],
      };


      const parameters = {
        ...parameter,
        ...filteredState
      };
      this.dstSettings = await this.dstWrapper.getDstSettings(parameters);
    } finally {
      this.patternService.handleCloseLoader();
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
      Title: '#LDS#Heading Delete Request Template',
      Message: '#LDS#Are you sure you want to delete this request template?'
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

  private async setupDetailsTab(): Promise<void> {
    this.cdrList = [
      new BaseCdr(this.data.pattern.Ident_ShoppingCartPattern.Column),
      new BaseCdr(this.data.pattern.Description.Column),
      new BaseCdr(this.data.pattern.UID_Person.Column)
    ];
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
