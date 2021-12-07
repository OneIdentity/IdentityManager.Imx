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

import { Platform } from '@angular/cdk/platform';
import { Component, Inject, OnDestroy } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { EuiSidesheetRef, EUI_SIDESHEET_DATA } from '@elemental-ui/core';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';

import { ColumnDependentReference, BaseCdr, MessageDialogComponent, MessageDialogResult, ConfirmationService } from 'qbm';
import { IEntity } from 'imx-qbm-dbts';
import { ServiceCategoryChangedType } from './service-category-changed.enum';
import { TypedEntitySelectionData } from '../service-items/service-item-select/typed-entity-selection-data.interface';
import { PortalServicecategoriesInteractive } from 'imx-api-qer';

@Component({
  selector: 'imx-service-category',
  templateUrl: './service-category.component.html',
  styleUrls: ['./service-category.component.scss'],
})
export class ServiceCategoryComponent implements OnDestroy {
  public readonly canDelete: boolean;
  public readonly editMode: boolean;
  public readonly form = new FormGroup({});
  public readonly cdrList: ColumnDependentReference[] = [];
  public readonly serviceItemData: TypedEntitySelectionData;

  private readonly subscriptions: Subscription[] = [];

  constructor(
    @Inject(EUI_SIDESHEET_DATA) data: {
      serviceCategory: PortalServicecategoriesInteractive;
      editMode: boolean;
      serviceItemData: TypedEntitySelectionData;
      serviceCategoryEditableFields: string[];
      hasAccproductparamcategoryCandidates: boolean;
    },
    private readonly dialog: MatDialog,
    private readonly translate: TranslateService,
    private readonly platform: Platform,
    private readonly sidesheetRef: EuiSidesheetRef,
    confirmation: ConfirmationService
  ) {
    const entity = data.serviceCategory.GetEntity();

    this.subscriptions.push(this.sidesheetRef.closeClicked().subscribe(async () => {
      if ((entity.GetDiffData()?.Data?.length > 0 || !this.form.pristine) && !(await confirmation.confirmLeaveWithUnsavedChanges())) {
        return;
      }

      this.sidesheetRef.close(ServiceCategoryChangedType.Cancel);
    }));

    this.editMode = data.editMode;
    this.serviceItemData = data.serviceItemData;

    this.canDelete = this.editMode && !data.serviceCategory.HasChildren?.value && !data.serviceItemData?.selected?.length
      && this.isCustomerModule(entity.GetKeys()[0]);

    const showProductParamCategory = (data.hasAccproductparamcategoryCandidates
      && data.serviceCategory.UID_AccProductParamCategory.value
      && data.serviceCategory.UID_AccProductParamCategory.value.length !== 0);

    this.cdrList = this.createCdrList(data.serviceCategoryEditableFields, entity, showProductParamCategory);
  }

  public ngOnDestroy(): void {
    this.subscriptions.forEach(s => s.unsubscribe());
  }

  public async save(): Promise<void> {
    this.sidesheetRef.close(ServiceCategoryChangedType.Change);
  }

  public ieSave(): void {
    if (!this.platform.TRIDENT) {
      return;
    }

    this.save();
  }

  public async delete(): Promise<void> {
    if (await this.confirmDelecte()) {
      this.sidesheetRef.close(ServiceCategoryChangedType.Delete);
    }
  }

  public addFormControl(columnName: string, control: FormControl): void {
    // Add control after timeout to prevent expression changed error
    setTimeout(() => {
      this.form.addControl(columnName, control);
    });
  }

  private async confirmDelecte(): Promise<boolean> {
    const result = await this.dialog.open(MessageDialogComponent, {
      data: {
        ShowOk: true,
        ShowCancel: true,
        Title: await this.translate.get('#LDS#Heading Delete Service Category').toPromise(),
        Message: await this.translate.get('#LDS#Are you sure you want to delete the service category?').toPromise(),
        identifier: 'confirm-delete'
      },
      panelClass: 'imx-messageDialog'
    }).afterClosed().toPromise();

    return result === MessageDialogResult.OkResult ? true : false;
  }

  private createCdrList(columnNames: string[], entity: IEntity, showProductParamCategory: boolean): BaseCdr[] {
    const cdrList = [];

    columnNames?.forEach(name => {
      if (name !== 'UID_AccProductParamCategory' || showProductParamCategory) {
        try {
          cdrList.push(new BaseCdr(entity.GetColumn(name)));
        } catch {}
      }
    });

    return cdrList;
  }

  // TODO Later: Move the method to imx-qbm-dbts
  private isCustomerModule(uid: string): boolean {
    return uid == null || uid.length < 4 || uid[3] !== '-' || uid.substring(0, 3) === 'CCC';
  }
}
