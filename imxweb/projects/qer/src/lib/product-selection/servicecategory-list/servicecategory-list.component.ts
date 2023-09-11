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

import { Component, Input, OnInit, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { OverlayRef } from '@angular/cdk/overlay';
import { EuiLoadingService } from '@elemental-ui/core';

import { CollectionLoadParameters, IWriteValue, MultiValue, CompareOperator, FilterType, EntitySchema } from 'imx-qbm-dbts';
import { PortalShopCategories } from 'imx-api-qer';
import { ClassloggerService, SettingsService } from 'qbm';
import { ProductSelectionService } from '../product-selection.service';
import { ServicecategoryTreeDatabase } from './servicecategory-tree-database';

/** Shows information about the currently selected category. */
@Component({
  templateUrl: './servicecategory-list.component.html',
  styleUrls: ['./servicecategory-list.component.scss'],
  selector: 'imx-servicecategory-list'
})
export class ServiceCategoryListComponent implements OnInit, OnChanges {
  @Input() public selectedServiceCategory: PortalShopCategories;
  @Input() public recipients: IWriteValue<string>;

  @Output() public serviceCategorySelected = new EventEmitter<PortalShopCategories>();
  @Output() public hideList = new EventEmitter<boolean>();
  @Output() public includeChildCategories = new EventEmitter<boolean>();

  public data: PortalShopCategories[];
  public total: number;
  public readonly entitySchema: EntitySchema;
  public selectedServiceCategoryTree: PortalShopCategories[] = [];
  public serviceCategoriesCaption: string;
  public treeDatabase: ServicecategoryTreeDatabase;

  private navigationState: CollectionLoadParameters;

  constructor(
    private readonly logger: ClassloggerService,
    private readonly busyService: EuiLoadingService,
    settings: SettingsService,
    private readonly productSelectionService: ProductSelectionService) {
    this.treeDatabase = new ServicecategoryTreeDatabase(busyService, settings, productSelectionService);
    this.navigationState = { PageSize: 100000, StartIndex: 0, filter: [] };
    this.entitySchema = productSelectionService.entitySchemaShopCategories;
  }

  public async ngOnInit(): Promise<void> {
    this.serviceCategoriesCaption = await this.productSelectionService.getServiceCategoryDisplaySingular();
  }

  public async ngOnChanges(changes: SimpleChanges): Promise<void> {
    if (changes.recipients) {
      this.treeDatabase.recipients = this.recipients;
    }

    if (changes.selectedServiceCategory && changes.selectedServiceCategory.currentValue) {
      this.updateDropdown();
    }
  }

  public async onServiceCategoryChanged(servicecategory: PortalShopCategories): Promise<void> {
    this.serviceCategorySelected.emit(servicecategory);
  }

  public resetCategory(): void {
    this.selectedServiceCategoryTree = [];
  }

  public onIncludeChilds(checked: boolean): void {
    this.includeChildCategories.emit(checked);
  }

  private async getParent(uid: string): Promise<PortalShopCategories> {
    this.navigationState.filter = [
      {
        ColumnName: 'UID_AccProductGroup',
        Type: FilterType.Compare,
        CompareOp: CompareOperator.Equal,
        Value1: uid
      }
    ];
    return (await this.getData(this.navigationState))?.[0];
  }

  private async getChildren(): Promise<PortalShopCategories[]> {
    this.navigationState.filter = [];
    const recipients = MultiValue.FromString(this.recipients?.value).GetValues();
    const opts = {
      ...this.navigationState,
      UID_Person: recipients.length === 1 ? recipients[0] : undefined,
      UID_AccProductGroupParent: this.selectedServiceCategory.UID_AccProductGroup.value
    } as CollectionLoadParameters;
    return this.getData(opts);
  }

  private async getData(navigationState: CollectionLoadParameters): Promise<PortalShopCategories[]> {
    let childCategories: PortalShopCategories[];
    let overlayRef: OverlayRef;
    setTimeout(() => overlayRef = this.busyService.show());
    try {
      this.logger.debug(this, `loading service-categories`);
      childCategories = (await this.productSelectionService.getServiceCategories(navigationState))?.Data;
    } finally {
      setTimeout(() => this.busyService.hide(overlayRef));
    }
    return childCategories;
  }

  private async updateDropdown(): Promise<void> {
    const parentUid = this.selectedServiceCategory.UID_AccProductGroupParent.value;
    const parent = await this.getParent(parentUid);

    const children = await this.getChildren();

    this.selectedServiceCategoryTree = [
      ...(parent ? [parent] : []),
      this.selectedServiceCategory,
      ...(children ? children : [])
    ];
  }
}
