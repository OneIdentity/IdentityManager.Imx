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

import { StepperSelectionEvent } from '@angular/cdk/stepper';
import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { EuiSidesheetService, EUI_SIDESHEET_DATA } from '@elemental-ui/core';

import { PortalPickcategory, PortalPickcategoryItems } from 'imx-api-qer';
import { DisplayColumns } from 'imx-qbm-dbts';

import {
  BaseCdr,
  ColumnDependentReference,
  DataSourceToolbarSettings,
  DataSourceWrapper,
} from 'qbm';
import { PickCategorySelectIdentitiesComponent } from '../pick-category-select-identities/pick-category-select-identities.component';
import { PickCategoryService } from '../pick-category.service';

@Component({
  selector: 'imx-pick-category-create',
  templateUrl: './pick-category-create.component.html',
  styleUrls: ['./pick-category-create.component.scss']
})
export class PickCategoryCreateComponent implements OnInit {

  public readonly displayNameForm = new FormGroup({});

  public readonly dstWrapper: DataSourceWrapper<PortalPickcategoryItems>;
  public dstSettings: DataSourceToolbarSettings;

  public selectedItems: PortalPickcategoryItems[] = [];

  public displayNameCdr: ColumnDependentReference;
  public displayNameReadonlyCdr: ColumnDependentReference;

  @ViewChild(PickCategorySelectIdentitiesComponent) public selectIndentities: PickCategorySelectIdentitiesComponent;

  constructor(
    @Inject(EUI_SIDESHEET_DATA) public data: {
      pickCategory: PortalPickcategory
    },
    private readonly sidesheet: EuiSidesheetService,
    readonly pickCategoryService: PickCategoryService
  ) {
    const entitySchema = pickCategoryService.pickcategoryItemsSchema;

    this.dstWrapper = new DataSourceWrapper(
      () => Promise.resolve({
        totalCount: this.selectIndentities.selection?.length,
        Data: this.selectIndentities.selection
      }),
      [entitySchema.Columns[DisplayColumns.DISPLAY_PROPERTYNAME]],
      entitySchema
    );
  }

  public async ngOnInit(): Promise<void> {
    this.displayNameCdr = new BaseCdr(this.data.pickCategory.DisplayName.Column);
    this.displayNameCdr.minLength = 1;
    this.displayNameReadonlyCdr = new BaseCdr(this.data.pickCategory.GetEntity().GetColumn(DisplayColumns.DISPLAY_PROPERTYNAME));
  }

  public async stepChange(change: StepperSelectionEvent): Promise<void> {
    switch (change.selectedIndex) {
      case 2:
        return this.showSummary();
    }
  }

  public async showSummary(): Promise<void> {
    this.getData();
  }

  public closeSidesheet(): void {
    this.sidesheet.close({
      create: true,
      pickCategory: this.data.pickCategory,
      pickedItems: this.selectIndentities?.selection
    });
  }

  private async getData(): Promise<void> {
    this.dstSettings = await this.dstWrapper.getDstSettings();
  }
}
