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

import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { EuiSidesheetService, EUI_SIDESHEET_DATA } from '@elemental-ui/core';
import { TranslateService } from '@ngx-translate/core';

import { PortalPickcategory, PortalPickcategoryItems } from 'imx-api-qer';
import { CollectionLoadParameters, DisplayColumns, TypedEntity } from 'imx-qbm-dbts';

import {
  BaseCdr,
  ClassloggerService,
  ColumnDependentReference,
  ConfirmationService,
  DataSourceToolbarSettings,
  DataSourceWrapper,
  DataTableComponent,
} from 'qbm';
import { PickCategorySelectIdentitiesComponent } from '../pick-category-select-identities/pick-category-select-identities.component';
import { PickCategoryService } from '../pick-category.service';

@Component({
  selector: 'imx-pick-category-sidesheet',
  templateUrl: './pick-category-sidesheet.component.html',
  styleUrls: ['./pick-category-sidesheet.component.scss']
})
export class PickCategorySidesheetComponent implements OnInit {

  public readonly dstWrapper: DataSourceWrapper<PortalPickcategoryItems>;
  public dstSettings: DataSourceToolbarSettings;
  public selectedPickedItems: PortalPickcategoryItems[] = [];
  public displayNameReadonlyCdr: ColumnDependentReference;

  @ViewChild(DataTableComponent) private table: DataTableComponent<TypedEntity>;

  private uidPickCategory: string;

  constructor(
    @Inject(EUI_SIDESHEET_DATA) public data: {
      pickCategory: PortalPickcategory
    },
    private readonly sidesheet: EuiSidesheetService,
    private readonly confirmationService: ConfirmationService,
    private readonly pickCategoryService: PickCategoryService,
    private readonly translate: TranslateService,
    private readonly logger: ClassloggerService
  ) {
    const entitySchema = this.pickCategoryService.pickcategoryItemsSchema;

    this.dstWrapper = new DataSourceWrapper(
      state => this.pickCategoryService.getPickCategoryItems(this.uidPickCategory, state),
      [entitySchema.Columns[DisplayColumns.DISPLAY_PROPERTYNAME]],
      entitySchema
    );
  }

  public async ngOnInit(): Promise<void> {
    this.displayNameReadonlyCdr = new BaseCdr(this.data.pickCategory.GetEntity().GetColumn(DisplayColumns.DISPLAY_PROPERTYNAME));
    this.uidPickCategory = this.data.pickCategory.GetEntity()?.GetKeys()?.join(',');
    await this.getData();
  }

  public async getData(newState?: CollectionLoadParameters): Promise<void> {
    this.pickCategoryService.handleOpenLoader();
    try {
      this.dstSettings = await this.dstWrapper.getDstSettings(newState);
    } finally {
      this.pickCategoryService.handleCloseLoader();
    }
  }

  public selectedItemsCanBeDeleted(): boolean {
    return this.selectedPickedItems != null &&
      this.selectedPickedItems.length > 0 &&
      this.data.pickCategory.IsManual.value;
  }

  public onSelectionChanged(items: PortalPickcategoryItems[]): void {
    this.logger.trace(this, 'selection changed', items);
    this.selectedPickedItems = items;
  }

  public async assignPickedItems(): Promise<void> {
    const selection = await this.sidesheet.open(PickCategorySelectIdentitiesComponent, {
      title: await this.translate.get('#LDS#Heading Select Identities').toPromise(),
      headerColour: 'iris-blue',
      padding: '0px',
      width: '700px',
      disableClose: false,
      testId: 'pick-category-select-identities',
      data: this.dstSettings.dataSource.Data
    }).afterClosed().toPromise();

    if (selection && (await this.pickCategoryService.createPickedItems(selection, this.uidPickCategory)) > 0) {
      await this.getData();
    }
  }

  public async removePickedItems(): Promise<void> {
    if (await this.confirmationService.confirm({
      Title: '#LDS#Heading Remove Identities',
      Message: '#LDS#Are you sure you want to remove the selected identities?'
    })) {
      if (await this.pickCategoryService.deletePickedItems(this.uidPickCategory, this.selectedPickedItems) > 0) {
        await this.getData();
        this.table?.clearSelection();
      }
    }
  }

}
