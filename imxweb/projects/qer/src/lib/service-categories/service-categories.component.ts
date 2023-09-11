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

import { OverlayRef } from '@angular/cdk/overlay';
import { Component, ErrorHandler, OnDestroy } from '@angular/core';
import { EuiLoadingService, EuiSidesheetService } from '@elemental-ui/core';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';

import { ITShopConfig, PortalServicecategories, PortalShopServiceitems } from 'imx-api-qer';
import { IEntity } from 'imx-qbm-dbts';

import { SettingsService, SnackBarService, HelpContextualComponent, HelpContextualService, HELP_CONTEXTUAL } from 'qbm';
import { ServiceCategoriesService } from './service-categories.service';
import { ServiceCategoryTreeDatabase } from './service-category-tree-database';
import { ServiceCategoryChangedType } from './service-category-changed.enum';
import { ProjectConfigurationService } from '../project-configuration/project-configuration.service';
import { ServiceCategoryComponent } from './service-category.component';
import { ServiceItemsService } from '../service-items/service-items.service';

@Component({
  selector: 'imx-service-categories',
  templateUrl: './service-categories.component.html',
  styleUrls: ['./service-categories.component.scss'],
})
export class ServiceCategoriesComponent implements OnDestroy {
  public selectedEntities: IEntity[] = [];

  public treeDatabase: ServiceCategoryTreeDatabase;
  public hasData = true;
  public config: {
    itshopConfig: ITShopConfig;
    serviceCategoryEditableFields: string[];
    hasAccproductparamcategoryCandidates: boolean;
  };

  private readonly subscriptions: Subscription[] = [];

  constructor(
    private readonly serviceCategoriesProvider: ServiceCategoriesService,
    private readonly serviceItemsService: ServiceItemsService,
    private readonly euiBusyService: EuiLoadingService,
    private readonly projectConfig: ProjectConfigurationService,
    private readonly sidesheet: EuiSidesheetService,
    private readonly translate: TranslateService,
    private readonly settingsService: SettingsService,
    private readonly snackBar: SnackBarService,
    private readonly errorHandler: ErrorHandler,
    private readonly helpContextualService: HelpContextualService
  ) {
    this.initializeTree();
  }

  public ngOnDestroy(): void {
    this.subscriptions.forEach(s => s.unsubscribe());
  }

  public async onServiceCategorySelected(selectedEntity: IEntity): Promise<void> {
    let serviceCategory: PortalServicecategories;
    let serviceItemsInitialSelection: PortalShopServiceitems[];

    let overlayRef: OverlayRef;
    setTimeout(() => overlayRef = this.euiBusyService.show());
    try {
      const key = selectedEntity.GetKeys()[0];

      serviceCategory = (await this.serviceCategoriesProvider.getById(key))?.Data?.[0];

      serviceItemsInitialSelection = (await this.serviceItemsService.get({ UID_AccProductGroup: key }))?.Data;
    } finally {
      setTimeout(() => this.euiBusyService.hide(overlayRef));
    }

    if (serviceCategory) {
      return this.editServiceCategory(serviceCategory, true, serviceItemsInitialSelection);
    }
  }


  public async addServiceCategory(): Promise<void> {
    return this.editServiceCategory(this.serviceCategoriesProvider.createEntity(), false);
  }

  private initializeTree(): void {
    this.treeDatabase = new ServiceCategoryTreeDatabase(this.euiBusyService, this.settingsService, this.serviceCategoriesProvider);

    this.subscriptions.push(this.treeDatabase.initialized.subscribe(async () => {
      if (this.config == null) {
        let overlayRef: OverlayRef;
        setTimeout(() => overlayRef = this.euiBusyService.show());
        try {
          const config = await this.projectConfig.getConfig();
          this.config = {
            itshopConfig: config.ITShopConfig,
            serviceCategoryEditableFields: config.OwnershipConfig.EditableFields.AccProductGroup,
            hasAccproductparamcategoryCandidates: await this.serviceCategoriesProvider.hasAccproductparamcategoryCandidates()
          };
        } finally {
          setTimeout(() => this.euiBusyService.hide(overlayRef));
        }
      }

      this.hasData = this.treeDatabase.hasData;
    }));
  }

  private async editServiceCategory(
    serviceCategory: PortalServicecategories, editMode: boolean, serviceItemsInitialSelection?: PortalShopServiceitems[]
  ): Promise<void> {
    const parentCategoryId = serviceCategory.UID_AccProductGroupParent.value;

    const serviceItemData = {
      title: '#LDS#Heading Select Service Items',
      display: '#LDS#Service items',
      selected: serviceItemsInitialSelection?.slice(),
      parent: serviceCategory,
      getTyped: parameters => this.serviceItemsService.get(parameters),
    };
    this.helpContextualService.setHelpContextId(editMode ? HELP_CONTEXTUAL.ServiceCategoriesEdit : HELP_CONTEXTUAL.ServiceCategoriesCreate);
    const state = await this.sidesheet.open(ServiceCategoryComponent,
      {
        title: await this.translate.get(
          editMode ? '#LDS#Heading Edit Service Category' : '#LDS#Heading Create Service Category'
        ).toPromise(),
        subTitle: editMode ? serviceCategory.GetEntity().GetDisplay() : '',
        padding: '0px',
        width: 'max(600px, 60%)',
        disableClose: true,
        testId: editMode ? 'edit-service-category' : 'create-service-category',
        data: {
          editMode,
          serviceCategory,
          serviceCategoryEditableFields: this.config?.serviceCategoryEditableFields,
          hasAccproductparamcategoryCandidates: this.config?.hasAccproductparamcategoryCandidates,
          serviceItemData
        },
        headerComponent: HelpContextualComponent
      }
    ).afterClosed().toPromise();

    if (state === ServiceCategoryChangedType.Change) {
      return this.save(
        serviceCategory,
        {
          initial: serviceItemsInitialSelection,
          selected: serviceItemData.selected
        },
        editMode,
        parentCategoryId !== serviceCategory.UID_AccProductGroupParent.value
      );
    }

    if (state === ServiceCategoryChangedType.Delete) {
      return this.delete(serviceCategory);
    }
  }

  private async save(
    serviceCategory: PortalServicecategories,
    serviceItems: {
      initial: PortalShopServiceitems[];
      selected: PortalShopServiceitems[];
    },
    editMode: boolean,
    parentChanged: boolean
  ): Promise<void> {
    let overlayRef: OverlayRef;
    setTimeout(() => (overlayRef = this.euiBusyService.show()));

    try {
      if (!editMode) {
        serviceCategory = (await this.serviceCategoriesProvider.create(serviceCategory)).Data?.[0];
      }

      const entity = serviceCategory.GetEntity();

      await entity.Commit(true);

      if (serviceItems) {
        await this.serviceItemsService.updateServiceCategory(
          serviceItems.initial,
          serviceItems.selected,
          entity.GetKeys()[0]
        );
      }

      if (editMode) {
        this.treeDatabase.updateNodeItem(entity);
        this.snackBar.open({ key: '#LDS#The changes to the service category have been successfully saved.' });
      } else {
        this.snackBar.open({ key: '#LDS#The service category has been successfully created.' });
      }

      if (!editMode || parentChanged) {
        this.initializeTree();
        this.selectedEntities = [entity];
      }
    } catch (error) {
      this.errorHandler.handleError(error);
    } finally {
      setTimeout(() => this.euiBusyService.hide(overlayRef));
    }
  }

  private async delete(serviceCategory: PortalServicecategories): Promise<void> {
    let overlayRef: OverlayRef;
    setTimeout(() => (overlayRef = this.euiBusyService.show()));

    try {
      await this.serviceCategoriesProvider.delete(serviceCategory.GetEntity().GetKeys()[0]);
      this.snackBar.open({ key: '#LDS#The service category has been successfully deleted.' });
      this.initializeTree();
      this.selectedEntities = [];
    } catch (error) {
      this.errorHandler.handleError(error);
    } finally {
      setTimeout(() => this.euiBusyService.hide(overlayRef));
    }
  }
}
