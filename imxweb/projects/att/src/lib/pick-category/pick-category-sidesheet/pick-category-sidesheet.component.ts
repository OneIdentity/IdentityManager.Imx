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

import { Component, Inject, OnInit } from '@angular/core';
import { EUI_SIDESHEET_DATA, EuiSidesheetService } from '@elemental-ui/core';
import { TranslateService } from '@ngx-translate/core';

import { PortalPickcategory, PortalPickcategoryItems } from '@imx-modules/imx-api-qer';
import { CollectionLoadParameters, DisplayColumns, EntitySchema, TypedEntity, TypedEntityCollectionData } from '@imx-modules/imx-qbm-dbts';

import { UntypedFormGroup } from '@angular/forms';
import {
  BaseCdr,
  calculateSidesheetWidth,
  ClassloggerService,
  ConfirmationService,
  DataViewInitParameters,
  DataViewSource,
  SnackBarService,
} from 'qbm';
import { PickCategorySelectIdentitiesComponent } from '../pick-category-select-identities/pick-category-select-identities.component';
import { PickCategoryService } from '../pick-category.service';

@Component({
  selector: 'imx-pick-category-sidesheet',
  templateUrl: './pick-category-sidesheet.component.html',
  styleUrls: ['./pick-category-sidesheet.component.scss'],
  providers: [DataViewSource],
})
export class PickCategorySidesheetComponent implements OnInit {
  public readonly form = new UntypedFormGroup({});
  public selectedPickedItems: PortalPickcategoryItems[] = [];
  public displayNameCdr: any;
  public entitySchema: EntitySchema;
  public DisplayColumns = DisplayColumns;

  private uidPickCategory: string;

  constructor(
    @Inject(EUI_SIDESHEET_DATA)
    public data: {
      pickCategory: PortalPickcategory;
    },
    private readonly sidesheet: EuiSidesheetService,
    private readonly snackBar: SnackBarService,
    private readonly confirmationService: ConfirmationService,
    private readonly pickCategoryService: PickCategoryService,
    private readonly translate: TranslateService,
    private readonly logger: ClassloggerService,
    public dataSource: DataViewSource<PortalPickcategoryItems>,
  ) {
    this.entitySchema = this.pickCategoryService.pickcategoryItemsSchema;
  }

  public async ngOnInit(): Promise<void> {
    this.uidPickCategory = this.data.pickCategory.GetEntity()?.GetKeys()?.join(',');
    this.displayNameCdr = new BaseCdr(this.data.pickCategory.DisplayName.Column, '#LDS#Display name');
    this.displayNameCdr.minLength = 1;
    await this.getData();
  }

  public async getData(): Promise<void> {
    const dataViewInitParameters: DataViewInitParameters<PortalPickcategoryItems> = {
      execute: (params: CollectionLoadParameters): Promise<TypedEntityCollectionData<PortalPickcategoryItems>> =>
        this.pickCategoryService.getPickCategoryItems(this.uidPickCategory, params),
      schema: this.entitySchema,
      columnsToDisplay: [this.entitySchema.Columns[DisplayColumns.DISPLAY_PROPERTYNAME]],
      selectionChange: (selection: Array<PortalPickcategoryItems>) => this.onSelectionChanged(selection),
    };
    this.dataSource.init(dataViewInitParameters);
  }

  public selectedItemsCanBeDeleted(): boolean {
    return this.selectedPickedItems != null && this.selectedPickedItems.length > 0 && this.data.pickCategory.IsManual.value;
  }

  public onSelectionChanged(items: TypedEntity[]): void {
    this.logger.trace(this, 'selection changed', items);
    this.selectedPickedItems = items as PortalPickcategoryItems[];
  }

  public async assignPickedItems(): Promise<void> {
    const selection = await this.sidesheet
      .open(PickCategorySelectIdentitiesComponent, {
        title: await this.translate.get('#LDS#Heading Assign Identities').toPromise(),
        subTitle: this.data.pickCategory.GetEntity().GetDisplay(),
        padding: '0px',
        width: calculateSidesheetWidth(700, 0.4),
        disableClose: false,
        testId: 'pick-category-select-identities',
        data: this.dataSource?.data,
      })
      .afterClosed()
      .toPromise();

    if (selection && (await this.pickCategoryService.createPickedItems(selection, this.uidPickCategory)) > 0) {
      this.dataSource.updateState();
    }
  }

  public async removePickedItems(): Promise<void> {
    if (
      await this.confirmationService.confirm({
        Title: '#LDS#Heading Remove Identities',
        Message: '#LDS#Are you sure you want to remove the selected identities?',
      })
    ) {
      if ((await this.pickCategoryService.deletePickedItems(this.uidPickCategory, this.selectedPickedItems)) > 0) {
        this.dataSource.updateState();
        this.dataSource.selection.clear();
      }
    }
  }

  public async saveChanges(): Promise<void> {
    if (this.form.valid) {
      this.pickCategoryService.handleOpenLoader();
      let confirmMessage = '#LDS#The sample has been successfully saved.';
      try {
        this.data.pickCategory.GetEntity().Commit(false);
        this.sidesheet.close(true);
        this.snackBar.open({ key: confirmMessage });
      } finally {
        this.pickCategoryService.handleCloseLoader();
      }
    }
  }
}
