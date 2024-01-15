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

import { Component, Inject, ViewChild } from '@angular/core';
import { ServiceCategoryService } from './service-category.service';
import { EUI_SIDESHEET_DATA, EuiLoadingService, EuiSidesheetService } from '@elemental-ui/core';
import { PortalApplication } from 'imx-api-aob';
import { TranslateService } from '@ngx-translate/core';

import { IEntity } from 'imx-qbm-dbts';
import { SettingsService, DataTreeWrapperComponent, SnackBarService, TreeDatabase, ConfirmationService } from 'qbm';
import { ServiceCategoryTreeDatabase } from './service-category-tree-database';
import { EditServiceCategoryInformationComponent } from './edit-service-category-information/edit-service-category-information.component';

@Component({
  selector: 'imx-service-category',
  templateUrl: './service-category.component.html',
  styleUrls: ['./service-category.component.scss'],
})
export class ServiceCategoryComponent {
  public treeDatabase: ServiceCategoryTreeDatabase;

  @ViewChild('dataTreeWrapper', { static: true }) dataTreeWrapper: DataTreeWrapperComponent;

  constructor(
    private readonly categoryService: ServiceCategoryService,
    private readonly settingsService: SettingsService,
    private readonly busyService: EuiLoadingService,
    private readonly snackbar: SnackBarService,
    private readonly sidesheet: EuiSidesheetService,
    private readonly translate: TranslateService,
    private readonly confirm: ConfirmationService,
    @Inject(EUI_SIDESHEET_DATA) public application: PortalApplication
  ) {
    this.initializeTree();
  }

  public async onServiceCategorySelected(entity: IEntity): Promise<void> {
    const oldParent = entity.GetColumn('UID_AccProductGroupParent').GetValue();
    const result = await this.editServiceCategory(entity, 'edit');
    if (result) {
      const overlay = this.busyService.show();
      try {
        await entity.Commit(true);
      } catch(exception){
        await entity.DiscardChanges();
        throw exception;
      }
        finally {
        this.busyService.hide(overlay);
      }
      this.treeDatabase.updateNodeItem(entity);
      if (oldParent !== entity.GetColumn('UID_AccProductGroupParent').GetValue()) {
        this.tryToMoveElement(entity, entity.GetColumn('UID_AccProductGroupParent').GetValue());
        this.snackbar.open({ key: '#LDS#Service category {0} was moved to a new parent', parameters: [entity.GetDisplay()] });
      }
    } else {
      await entity.DiscardChanges();
    }
  }

  public async onDelete(evt: Event, entity: IEntity): Promise<void> {
    evt.stopPropagation();

    if(!(await this.confirm.confirmDelete('#LDS#Heading Delete Service Category', '#LDS#Are you sure you want to delete the service category?'))){
      return;
    }

    const overlay = this.busyService.show();
    try {
      await this.categoryService.delete(entity.GetKeys()[0]);
    } finally {
      this.busyService.hide(overlay);
    }

    this.dataTreeWrapper.deleteNode(entity, false);
    this.snackbar.open({ key: '#LDS#Service category {0} was deleted', parameters: [entity.GetDisplay()] });
  }

  public async addChildCategory(evt: Event, entity: IEntity): Promise<void> {
    evt.stopPropagation();

    const newEntity = this.categoryService.createChild();
    newEntity.GetColumn('UID_AccProductGroupParent').PutValueStruct({ DataValue: entity.GetKeys()[0], DisplayValue: entity.GetDisplay() });

    const result = await this.editServiceCategory(newEntity, 'create');

    if (result) {
      const overlay = this.busyService.show();
      try {
        await newEntity.Commit(true);
      } finally {
        this.busyService.hide(overlay);
      }
      this.snackbar.open({ key: '#LDS#Service category {0} was created', parameters: [newEntity.GetDisplay()] });
      this.add(entity, newEntity);
    } else {
      await entity.DiscardChanges();
    }
  }

  public isDeletable(entity: IEntity): boolean {
    return TreeDatabase.getId(entity) !== this.application.UID_AccProductGroup.value && !this.dataTreeWrapper?.hasChildren(entity);
  }

  private tryToMoveElement(entity: IEntity, newParentId: string): void {
    this.dataTreeWrapper.deleteNode(entity, true);
    const realParent = this.dataTreeWrapper.getEntityById(newParentId);
    if (realParent) {
      this.addToParent(realParent, entity);
    }
  }

  private add(entity: IEntity, newEntity: IEntity): void {
    const parentId = newEntity.GetColumn('UID_AccProductGroupParent').GetValue();
    if (parentId === entity.GetKeys()[0]) {
      // the new category was added as a child
      this.addToParent(entity, newEntity);
    } else {
      // the user updated  UID_AccProductGroupParent before saving, try to add a node to the real parent (onöy possible, if the new parent is rendered)
      const realParent = this.dataTreeWrapper.getEntityById(parentId);
      if (realParent) {
        this.addToParent(realParent, newEntity);
      }
    }
  }

  private addToParent(entity: IEntity, newEntity: IEntity) {
    if (this.dataTreeWrapper.isExpanded(entity)) {
      this.dataTreeWrapper.add(newEntity, TreeDatabase.getId(entity));
    } else {
      this.dataTreeWrapper.updateNode(entity, { expandable: true });
      this.dataTreeWrapper.expandNode(entity);
    }
  }

  private initializeTree(): void {
    this.treeDatabase = new ServiceCategoryTreeDatabase(
      this.busyService,
      this.settingsService,
      this.categoryService,
      this.application.UID_AccProductGroup.value
    );

    this.treeDatabase.initialized.subscribe(async () => {
      this.dataTreeWrapper.treeRendered.subscribe(() => {
        this.dataTreeWrapper.expandNode(this.treeDatabase.topLevelEntities[0]);
        this.treeDatabase.initialized.unsubscribe(); // can be unsubscribed again, because it only needed for initial loading
      });
    });
  }

  private async editServiceCategory(serviceCategory: IEntity, mode: 'edit' | 'create'): Promise<boolean> {
    return await this.sidesheet
      .open(EditServiceCategoryInformationComponent, {
        title: await this.translate
          .get(mode === 'edit' ? '#LDS#Heading Edit Service Category' : '#LDS#Heading Create Service Category')
          .toPromise(),
        subTitle: mode === 'edit' ? serviceCategory.GetDisplay() : '',
        padding: '0px',
        width: 'max(650px, 65%)',
        disableClose: true,
        testId: mode === 'edit' ? 'edit-service-category' : 'create-service-category',
        data: { serviceCategory, isNew: mode === 'create' },
      })
      .afterClosed()
      .toPromise();
  }
}
