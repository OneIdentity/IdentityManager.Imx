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

import { Component, EventEmitter, Inject, Output } from '@angular/core';
import { EuiLoadingService, EuiSidesheetRef, EUI_SIDESHEET_DATA, EUI_SIDESHEET_REF } from '@elemental-ui/core';
import { PortalShopCategories } from 'imx-api-qer';
import { EntitySchema, IEntity, IWriteValue } from 'imx-qbm-dbts';
import { ClassloggerService, SettingsService } from 'qbm';
import { ProductSelectionService } from '../product-selection.service';
import { ServicecategoryTreeDatabase } from './servicecategory-tree-database';

@Component({
  selector: 'imx-category-tree',
  templateUrl: './category-tree.component.html',
  styleUrls: ['./category-tree.component.scss']
})
export class CategoryTreeComponent {
  public selectedServiceCategory: PortalShopCategories;
  public treeDatabase: ServicecategoryTreeDatabase;
  public readonly entitySchema: EntitySchema;
  public recipients: IWriteValue<string>;

  @Output() public serviceCategorySelected = new EventEmitter<PortalShopCategories>();

  constructor(
    @Inject(EUI_SIDESHEET_DATA) public readonly  sidesheetData: any,
    @Inject(EUI_SIDESHEET_REF) public readonly sidesheetRef: EuiSidesheetRef,
    private readonly busyService: EuiLoadingService,
    private readonly logger: ClassloggerService,
    settingsService: SettingsService,
    private readonly productSelectionService: ProductSelectionService) {
    this.selectedServiceCategory = sidesheetData.selectedServiceCategory;
    this.recipients = sidesheetData.recipients;
    this.treeDatabase = new ServicecategoryTreeDatabase(this.busyService, settingsService, this.productSelectionService);
    this.treeDatabase.recipients = this.recipients;
    this.entitySchema = productSelectionService.entitySchemaShopCategories;
  }

  public onServiceCategorySelected(entity: IEntity): void {
    this.logger.debug(this, 'get the selected servicecategory from the end of emitted list');
    const servicecategory = new PortalShopCategories(entity);
    this.serviceCategorySelected.emit(servicecategory);
    this.sidesheetRef.close(servicecategory);
  }

}
