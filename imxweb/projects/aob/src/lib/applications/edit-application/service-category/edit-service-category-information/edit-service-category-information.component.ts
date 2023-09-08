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

import { Component, Inject, OnInit } from '@angular/core';
import { EUI_SIDESHEET_DATA, EuiSidesheetRef } from '@elemental-ui/core';
import { IEntity } from 'imx-qbm-dbts';
import { BaseCdr, CdrFactoryService, ColumnDependentReference, ConfirmationService } from 'qbm';
import { ServiceCategoryService } from '../service-category.service';
import { FormArray, FormGroup } from '@angular/forms';

interface ServiceItemForm {
  cdrArray: FormArray;
}
@Component({
  selector: 'imx-edit-service-category-information',
  templateUrl: './edit-service-category-information.component.html',
  styleUrls: ['./edit-service-category-information.component.scss'],
})
export class EditServiceCategoryInformationComponent implements OnInit {
  public cdrList: ColumnDependentReference[];

  public readonly formGroup: FormGroup<ServiceItemForm>;

  public get formArray(): FormArray {
    return this.formGroup.controls.cdrArray;
  }

  constructor(
    private readonly categoryProvider: ServiceCategoryService,
    private readonly confirm: ConfirmationService,
    private readonly ref: EuiSidesheetRef,
    private readonly cdrFactoryService: CdrFactoryService,
    @Inject(EUI_SIDESHEET_DATA) public data: { serviceCategory: IEntity; isNew: boolean }
  ) {
    this.formGroup = new FormGroup({
      cdrArray: new FormArray([]),
    });

    this.ref.closeClicked().subscribe(async () => {
      if (!this.formGroup.dirty || (await this.confirm.confirmLeaveWithUnsavedChanges())) {
        this.ref.close(false);
      }
    });
  }

  public async ngOnInit(): Promise<void> {
    const schema = this.categoryProvider.serviceCategorySchema;
    const columnNames = [
      schema.Columns.Ident_AccProductGroup,
      schema.Columns.Description,
      schema.Columns.UID_OrgRuler,
      schema.Columns.UID_PWODecisionMethod,
      schema.Columns.UID_OrgAttestator,
      schema.Columns.JPegPhoto,
    ].map(elem=> elem.ColumnName);

    this.cdrList = this.cdrFactoryService.buildCdrFromColumnList(this.data.serviceCategory, columnNames);

    if (!this.data.isNew) {
      this.cdrList.push(new BaseCdr(this.data.serviceCategory.GetColumn(schema.Columns.UID_AccProductGroupParent.ColumnName)));
    }
  }

  public save(): void {
    this.ref.close(true);
  }
}
