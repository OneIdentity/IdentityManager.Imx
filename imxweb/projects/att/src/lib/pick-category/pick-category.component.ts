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

import { PortalPickcategory } from 'imx-api-qer';
import { CollectionLoadParameters, DisplayColumns, TypedEntity, ValType } from 'imx-qbm-dbts';

import {
  ClassloggerService,
  DataSourceToolbarSettings,
  UserMessageService,
  DataTableComponent,
  DataSourceWrapper,
  ConfirmationService,
  HelpContextualComponent,
  HelpContextualService,
  HELP_CONTEXTUAL,
  BusyService,
} from 'qbm';
import { PickCategoryCreateComponent } from './pick-category-create/pick-category-create.component';
import { PickCategorySidesheetComponent } from './pick-category-sidesheet/pick-category-sidesheet.component';
import { PickCategoryService } from './pick-category.service';

@Component({
  selector: 'imx-pick-category',
  templateUrl: './pick-category.component.html',
  styleUrls: ['./pick-category.component.scss'],
})
export class PickCategoryComponent implements OnInit, OnDestroy {
  public readonly dstWrapper: DataSourceWrapper<PortalPickcategory>;
  public dstSettings: DataSourceToolbarSettings;
  public selectedPickCategoryItems: PortalPickcategory[] = [];
  public busyService = new BusyService();

  @ViewChild(DataTableComponent) private table: DataTableComponent<TypedEntity>;

  constructor(
    private readonly pickCategoryService: PickCategoryService,
    private readonly sideSheet: EuiSidesheetService,
    private readonly confirmationService: ConfirmationService,
    private readonly translate: TranslateService,
    private readonly messageService: UserMessageService,
    private readonly logger: ClassloggerService,
    private readonly helpContextualService: HelpContextualService
  ) {
    const entitySchema = this.pickCategoryService.pickcategorySchema;

    this.dstWrapper = new DataSourceWrapper(
      (state, requestOpts, isInitial) =>
        isInitial ? Promise.resolve({ totalCount: 0, Data: [] }) : this.pickCategoryService.getPickCategories(state, requestOpts),
      [entitySchema.Columns[DisplayColumns.DISPLAY_PROPERTYNAME], entitySchema.Columns.IsManual],
      entitySchema
    );
  }

  public async ngOnInit(): Promise<void> {
    await this.getData(undefined, true);
  }

  public ngOnDestroy(): void {
    this.table?.clearSelection();
  }

  public onSelectionChanged(items: PortalPickcategory[]): void {
    this.logger.trace(this, 'selection changed', items);
    this.selectedPickCategoryItems = items;
  }

  public async onSearch(keywords: string): Promise<void> {
    this.pickCategoryService.abortCall();
    return this.getData({ search: keywords });
  }

  public selectedItemsCanBeDeleted(): boolean {
    return (
      this.selectedPickCategoryItems != null &&
      this.selectedPickCategoryItems.length > 0 &&
      this.selectedPickCategoryItems.every((item) => item.IsManual.value)
    );
  }

  public async getData(newState?: CollectionLoadParameters, isInitialLoad: boolean = false): Promise<void> {
    const isBusy = this.busyService.beginBusy();
    try {
      const dstSettings = await this.dstWrapper.getDstSettings(
        newState,
        { signal: this.pickCategoryService.abortController.signal },
        isInitialLoad
      );
      if (dstSettings) {
        this.dstSettings = dstSettings;
      }
    } finally {
      isBusy.endBusy();
    }
  }

  public async viewDetails(pickCategory: PortalPickcategory): Promise<void> {
    if (pickCategory) {
      this.helpContextualService.setHelpContextId(HELP_CONTEXTUAL.AttestationPreselectionEdit);
      const result = await this.sideSheet
        .open(PickCategorySidesheetComponent, {
          title: await this.translate.get('#LDS#Heading Edit Sample').toPromise(),
          subTitle: pickCategory.GetEntity().GetDisplay(),
          panelClass: 'imx-sidesheet',
          padding: '0',
          width: '600px',
          testId: 'pickCategory-details-sidesheet',
          data: {
            pickCategory,
          },
          headerComponent: HelpContextualComponent,
        })
        .afterClosed()
        .toPromise();

      if (result) {
        this.getData();
      }
    } else {
      this.messageService.subject.next({
        text: '#LDS#You cannot edit the sample. The sample does not exist (anymore). Please reload the page.',
      });
    }
  }

  public async delete(): Promise<void> {
    if (
      await this.confirmationService.confirm({
        Title: '#LDS#Heading Delete Sample',
        Message: '#LDS#Are you sure you want to delete the sample?',
      })
    ) {
      if ((await this.pickCategoryService.deletePickCategories(this.selectedPickCategoryItems)) > 0) {
        await this.getData();
        this.table?.clearSelection();
      }
    }
  }

  public async createNewPickCategory(): Promise<void> {
    const newPickCategory = this.pickCategoryService.createPickCategory();
    this.logger.trace(this, 'new pick category created', newPickCategory);

    if (newPickCategory) {
      this.helpContextualService.setHelpContextId(HELP_CONTEXTUAL.AttestationPreselectionCreate);
      const result = await this.sideSheet
        .open(PickCategoryCreateComponent, {
          title: await this.translate.get('#LDS#Heading Create Sample').toPromise(),
          panelClass: 'imx-sidesheet',
          padding: '0',
          width: '700px',
          disableClose: true,
          testId: 'pickCategory-create-sidesheet',
          data: {
            pickCategory: newPickCategory,
          },
          headerComponent: HelpContextualComponent,
        })
        .afterClosed()
        .toPromise();

      if (result?.create) {
        await this.pickCategoryService.saveNewPickCategoryAndItems(result.pickCategory, result.pickedItems);
        this.getData();
      }
    } else {
      this.messageService.subject.next({
        text: '#LDS#The sample could not be created. Please reload the page and try again.',
      });
    }
  }
}
